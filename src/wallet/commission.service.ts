import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThanOrEqual, MoreThanOrEqual, IsNull } from 'typeorm';
import {
  CommissionConfig,
  CommissionTransaction,
  CommissionTransactionStatus,
  Booking,
  Payment,
  Wallet,
  WalletUserType,
  WalletTransactionCategory,
  CustomerRewardPoints,
  RewardTier,
  CODTransaction,
  CODTransactionStatus,
} from '../database/entities';
import { WalletService } from './wallet.service';
import { PaymentMethodType } from '../database/entities/settlement-transaction.entity';

@Injectable()
export class CommissionService {
  private readonly logger = new Logger(CommissionService.name);

  constructor(
    @InjectRepository(CommissionConfig)
    private readonly commissionConfigRepository: Repository<CommissionConfig>,
    @InjectRepository(CommissionTransaction)
    private readonly commissionTransactionRepository: Repository<CommissionTransaction>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(CustomerRewardPoints)
    private readonly rewardPointsRepository: Repository<CustomerRewardPoints>,
    @InjectRepository(CODTransaction)
    private readonly codTransactionRepository: Repository<CODTransaction>,
    private readonly walletService: WalletService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Get active commission configuration
   */
  async getActiveCommissionConfig(date: Date = new Date()): Promise<CommissionConfig> {
    const config = await this.commissionConfigRepository.findOne({
      where: {
        isActive: true,
        effectiveFrom: LessThanOrEqual(date),
      },
      order: {
        effectiveFrom: 'DESC',
      },
    });

    if (!config) {
      throw new NotFoundException(
        'No active commission configuration found. Please contact administrator to set up commission rates.',
      );
    }

    return config;
  }

  /**
   * Calculate and apply commission for a completed booking
   * This is the main method called when booking status changes to COMPLETED
   */
  async calculateAndApplyCommission(
    bookingId: string,
    paymentMethod: PaymentMethodType = PaymentMethodType.ONLINE,
  ): Promise<CommissionTransaction> {
    return await this.dataSource.transaction(async (transactionalEntityManager) => {
      // Fetch booking with all relations including bookingServices
      const booking = await transactionalEntityManager.findOne(Booking, {
        where: { id: bookingId },
        relations: ['customer', 'businessOwner', 'bookingServices'],
      });

      if (!booking) {
        throw new NotFoundException(`Booking not found with ID: ${bookingId}`);
      }

      const payment = await transactionalEntityManager.findOne(Payment, {
        where: { bookingId: booking.id },
      });

      // Check if commission already calculated
      const existingCommission = await transactionalEntityManager.findOne(CommissionTransaction, {
        where: { bookingId },
      });

      if (existingCommission) {
        this.logger.warn(`Commission already calculated for booking ${bookingId}`);
        return existingCommission;
      }

      // Get active commission config
      const commissionConfig = await this.getActiveCommissionConfig(booking.serviceCompletedAt || new Date());

      // booking.totalAmount already includes base services + add-ons + delivery from booking service
      const bookingAmount = Number(booking.totalAmount);
      const addOnTotal = Number(booking.addOnServicesTotal || 0);
      const deliveryCharge = Number(booking.deliveryCharge || 0);
      const servicesCount = booking.bookingServices?.length || 0;

      const businessOwnerCommissionPercent = Number(commissionConfig.businessOwnerCommissionPercent);
      const customerRewardPercent = Number(commissionConfig.customerRewardPercent);

      // Calculate commission amounts on the full total
      const businessOwnerCommissionAmount = (bookingAmount * businessOwnerCommissionPercent) / 100;
      const customerRewardAmount = (bookingAmount * customerRewardPercent) / 100;

      // Enhanced logging with breakdown
      this.logger.log(
        `Commission calculation for booking ${bookingId}: ` +
          `Total=₹${bookingAmount} (AddOns=₹${addOnTotal}, Delivery=₹${deliveryCharge}, Services=${servicesCount}), ` +
          `BO Commission=${businessOwnerCommissionPercent}% (₹${businessOwnerCommissionAmount}), ` +
          `Customer Reward=${customerRewardPercent}% (₹${customerRewardAmount})`,
      );

      let businessOwnerWalletTransactionId: string | undefined;
      let customerWalletTransactionId: string | undefined;

      // Process business owner wallet transactions
      const businessOwnerWallet = await this.walletService.getOrCreateWallet(
        booking.businessOwner.userId,
        WalletUserType.BUSINESS_OWNER,
      );

      // For ONLINE payments: Credit booking amount first, then debit commission
      // For COD payments: Only debit commission (they received cash directly)
      if (paymentMethod === PaymentMethodType.ONLINE) {
        // Step 1: Credit full booking amount (payment received via Razorpay)
        await this.walletService.credit(
          businessOwnerWallet.id,
          WalletTransactionCategory.BOOKING_PAYMENT,
          bookingAmount,
          `Payment received for booking #${bookingId.substring(0, 8)} - ₹${bookingAmount} (Online)`,
          {
            bookingId,
            paymentId: payment?.id,
            additionalData: {
              bookingAmount,
              paymentMethod,
              note: 'Online payment credited to wallet',
            },
          },
        );

        this.logger.log(`Credited ₹${bookingAmount} to business owner wallet for online booking ${bookingId}`);
      }

      // Step 2: Debit commission (for both ONLINE and COD)
      if (businessOwnerCommissionAmount > 0) {
        const boTransaction = await this.walletService.debit(
          businessOwnerWallet.id,
          WalletTransactionCategory.COMMISSION,
          businessOwnerCommissionAmount,
          paymentMethod === PaymentMethodType.ONLINE
            ? `Commission for booking #${bookingId.substring(0, 8)} - ${businessOwnerCommissionPercent}% of ₹${bookingAmount} (Online)`
            : `Commission owed for booking #${bookingId.substring(0, 8)} - ${businessOwnerCommissionPercent}% of ₹${bookingAmount} (COD)`,
          {
            bookingId,
            paymentId: payment?.id,
            additionalData: {
              bookingAmount,
              commissionPercent: businessOwnerCommissionPercent,
              paymentMethod,
              netAmount: paymentMethod === PaymentMethodType.ONLINE ? bookingAmount - businessOwnerCommissionAmount : null,
            },
          },
        );

        businessOwnerWalletTransactionId = boTransaction.id;

        this.logger.log(
          `Debited ₹${businessOwnerCommissionAmount} commission from business owner wallet. ` +
          `Payment method: ${paymentMethod}. ` +
          (paymentMethod === PaymentMethodType.ONLINE
            ? `Net earnings: ₹${bookingAmount - businessOwnerCommissionAmount}`
            : `Commission debt: ₹${businessOwnerCommissionAmount}`),
        );
      }

      // Process customer reward (if > 0)
      if (customerRewardAmount > 0) {
        const customerWallet = await this.walletService.getOrCreateWallet(
          booking.customer.userId,
          WalletUserType.CUSTOMER,
        );

        // Credit reward to customer wallet
        const customerTransaction = await this.walletService.credit(
          customerWallet.id,
          WalletTransactionCategory.REWARD_POINTS,
          customerRewardAmount,
          `Reward for booking #${bookingId.substring(0, 8)} - ${customerRewardPercent}% of ₹${bookingAmount}`,
          {
            bookingId,
            paymentId: payment?.id,
            additionalData: {
              bookingAmount,
              rewardPercent: customerRewardPercent,
              paymentMethod,
            },
          },
        );

        customerWalletTransactionId = customerTransaction.id;

        // Update customer reward points
        await this.updateCustomerRewardPoints(
          booking.customerId,
          customerRewardAmount,
          transactionalEntityManager,
        );
      }

      // Create commission transaction record
      const commissionTransaction = transactionalEntityManager.create(CommissionTransaction, {
        bookingId,
        paymentId: payment?.id,
        businessOwnerId: booking.businessOwnerId,
        customerId: booking.customerId,
        commissionConfigId: commissionConfig.id,
        bookingAmount,
        businessOwnerCommissionPercent,
        businessOwnerCommissionAmount,
        customerRewardPercent,
        customerRewardAmount,
        businessOwnerWalletTransactionId,
        customerWalletTransactionId,
        status: CommissionTransactionStatus.APPLIED,
        calculatedAt: new Date(),
      });

      const savedCommission = await transactionalEntityManager.save(CommissionTransaction, commissionTransaction);

      // If payment method is COD, create COD transaction record
      if (paymentMethod === PaymentMethodType.COD) {
        const codTransaction = transactionalEntityManager.create(CODTransaction, {
          bookingId,
          businessOwnerId: booking.businessOwnerId,
          customerId: booking.customerId,
          amount: bookingAmount,
          commissionAmount: businessOwnerCommissionAmount,
          netAmount: bookingAmount - businessOwnerCommissionAmount,
          collectedAt: booking.serviceCompletedAt || new Date(),
          status: CODTransactionStatus.PENDING,
          notes: `COD payment collected for booking #${bookingId.substring(0, 8)}`,
        });

        await transactionalEntityManager.save(CODTransaction, codTransaction);
        this.logger.log(`COD transaction created for booking ${bookingId}: ₹${bookingAmount} (net: ₹${bookingAmount - businessOwnerCommissionAmount})`);
      }

      // Update booking with commission transaction ID and payment method
      await transactionalEntityManager.update(Booking, bookingId, {
        commissionTransactionId: savedCommission.id,
        paymentMethod,
      });

      this.logger.log(
        `✅ Commission applied for booking ${bookingId}: ` +
          `BO: -₹${businessOwnerCommissionAmount}, Customer: +₹${customerRewardAmount}`,
      );

      return savedCommission;
    });
  }

  /**
   * Update customer reward points and tier
   */
  private async updateCustomerRewardPoints(
    customerId: string,
    rewardAmount: number,
    transactionalEntityManager: any,
  ): Promise<void> {
    let rewardPoints = await transactionalEntityManager.findOne(CustomerRewardPoints, {
      where: { customerId },
    });

    if (!rewardPoints) {
      rewardPoints = transactionalEntityManager.create(CustomerRewardPoints, {
        customerId,
        totalPoints: 0,
        totalEarned: 0,
        totalRedeemed: 0,
        tier: RewardTier.BRONZE,
        totalBookings: 0,
      });
    }

    rewardPoints.totalPoints = Number(rewardPoints.totalPoints) + rewardAmount;
    rewardPoints.totalEarned = Number(rewardPoints.totalEarned) + rewardAmount;
    rewardPoints.totalBookings = Number(rewardPoints.totalBookings) + 1;
    rewardPoints.lastEarnedAt = new Date();

    // Update tier based on total bookings
    rewardPoints.tier = this.calculateTier(rewardPoints.totalBookings);

    await transactionalEntityManager.save(CustomerRewardPoints, rewardPoints);
  }

  /**
   * Calculate customer tier based on total bookings
   */
  private calculateTier(totalBookings: number): RewardTier {
    if (totalBookings >= 50) return RewardTier.PLATINUM;
    if (totalBookings >= 25) return RewardTier.GOLD;
    if (totalBookings >= 10) return RewardTier.SILVER;
    return RewardTier.BRONZE;
  }

  /**
   * Reverse commission (for refunds, cancellations)
   */
  async reverseCommission(commissionTransactionId: string, reason: string): Promise<void> {
    return await this.dataSource.transaction(async (transactionalEntityManager) => {
      const commissionTransaction = await transactionalEntityManager.findOne(CommissionTransaction, {
        where: { id: commissionTransactionId },
      });

      if (!commissionTransaction) {
        throw new NotFoundException(`Commission transaction not found with ID: ${commissionTransactionId}`);
      }

      if (commissionTransaction.status === CommissionTransactionStatus.REVERSED) {
        throw new BadRequestException('Commission already reversed');
      }

      // Reverse business owner wallet transaction
      if (commissionTransaction.businessOwnerWalletTransactionId) {
        await this.walletService.reverseTransaction(
          commissionTransaction.businessOwnerWalletTransactionId,
          `Commission reversal: ${reason}`,
        );
      }

      // Reverse customer wallet transaction
      if (commissionTransaction.customerWalletTransactionId) {
        await this.walletService.reverseTransaction(
          commissionTransaction.customerWalletTransactionId,
          `Reward reversal: ${reason}`,
        );

        // Deduct reward points
        const rewardPoints = await transactionalEntityManager.findOne(CustomerRewardPoints, {
          where: { customerId: commissionTransaction.customerId },
        });

        if (rewardPoints) {
          rewardPoints.totalPoints = Math.max(
            0,
            Number(rewardPoints.totalPoints) - commissionTransaction.customerRewardAmount,
          );
          rewardPoints.totalBookings = Math.max(0, rewardPoints.totalBookings - 1);
          rewardPoints.tier = this.calculateTier(rewardPoints.totalBookings);
          await transactionalEntityManager.save(CustomerRewardPoints, rewardPoints);
        }
      }

      // Mark commission transaction as reversed
      commissionTransaction.status = CommissionTransactionStatus.REVERSED;
      await transactionalEntityManager.save(CommissionTransaction, commissionTransaction);

      this.logger.log(`Commission reversed for transaction ${commissionTransactionId}. Reason: ${reason}`);
    });
  }

  /**
   * Get commission summary for business owner
   */
  async getBusinessOwnerCommissionSummary(
    businessOwnerId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalBookings: number;
    totalBookingAmount: number;
    totalCommissionPaid: number;
    averageCommissionPercent: number;
    netEarnings: number;
    codAmount: number;
    onlineAmount: number;
    gstAmount: number;
    totalDeduction: number;
  }> {
    const queryBuilder = this.commissionTransactionRepository
      .createQueryBuilder('ct')
      .where('ct.businessOwnerId = :businessOwnerId', { businessOwnerId })
      .andWhere('ct.status = :status', { status: CommissionTransactionStatus.APPLIED });

    if (startDate) {
      queryBuilder.andWhere('ct.calculatedAt >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('ct.calculatedAt <= :endDate', { endDate });
    }

    const result = await queryBuilder
      .select('COUNT(*)', 'totalBookings')
      .addSelect('SUM(ct.bookingAmount)', 'totalBookingAmount')
      .addSelect('SUM(ct.businessOwnerCommissionAmount)', 'totalCommissionPaid')
      .addSelect('AVG(ct.businessOwnerCommissionPercent)', 'averageCommissionPercent')
      .getRawOne();

    const totalBookings = parseInt(result.totalBookings) || 0;
    const totalBookingAmount = parseFloat(result.totalBookingAmount) || 0;
    const totalCommissionPaid = parseFloat(result.totalCommissionPaid) || 0;
    const averageCommissionPercent = parseFloat(result.averageCommissionPercent) || 0;

    // Get payment method breakdown
    const paymentMethodQueryBuilder = this.commissionTransactionRepository
      .createQueryBuilder('ct')
      .leftJoin('ct.booking', 'b')
      .where('ct.businessOwnerId = :businessOwnerId', { businessOwnerId })
      .andWhere('ct.status = :status', { status: CommissionTransactionStatus.APPLIED });

    if (startDate) {
      paymentMethodQueryBuilder.andWhere('ct.calculatedAt >= :startDate', { startDate });
    }

    if (endDate) {
      paymentMethodQueryBuilder.andWhere('ct.calculatedAt <= :endDate', { endDate });
    }

    const paymentMethodBreakdown = await paymentMethodQueryBuilder
      .select('b.paymentMethod', 'paymentMethod')
      .addSelect('SUM(ct.bookingAmount)', 'amount')
      .groupBy('b.paymentMethod')
      .getRawMany();

    const codAmount = parseFloat(
      paymentMethodBreakdown.find(p => p.paymentMethod === 'cod')?.amount || '0'
    );
    const onlineAmount = parseFloat(
      paymentMethodBreakdown.find(p => p.paymentMethod === 'online')?.amount || '0'
    );

    const gstAmount = (totalCommissionPaid * 18) / 100;
    const totalDeduction = totalCommissionPaid + gstAmount;
    const netEarnings = totalBookingAmount - totalDeduction;

    return {
      totalBookings,
      totalBookingAmount,
      totalCommissionPaid,
      averageCommissionPercent,
      netEarnings: Math.round(netEarnings * 100) / 100,
      codAmount,
      onlineAmount,
      gstAmount: Math.round(gstAmount * 100) / 100,
      totalDeduction: Math.round(totalDeduction * 100) / 100,
    };
  }

  /**
   * Get customer reward summary
   */
  async getCustomerRewardSummary(customerId: string): Promise<CustomerRewardPoints | null> {
    return await this.rewardPointsRepository.findOne({
      where: { customerId },
      relations: ['customer'],
    });
  }

  /**
   * Get commission transactions with pagination
   */
  async getCommissionTransactions(
    filters: {
      businessOwnerId?: string;
      customerId?: string;
      status?: CommissionTransactionStatus;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      limit?: number;
    },
  ): Promise<{
    transactions: CommissionTransaction[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.commissionTransactionRepository
      .createQueryBuilder('ct')
      .leftJoinAndSelect('ct.booking', 'booking')
      .leftJoinAndSelect('ct.businessOwner', 'businessOwner')
      .leftJoinAndSelect('ct.customer', 'customer')
      .orderBy('ct.calculatedAt', 'DESC');

    if (filters.businessOwnerId) {
      queryBuilder.andWhere('ct.businessOwnerId = :businessOwnerId', {
        businessOwnerId: filters.businessOwnerId,
      });
    }

    if (filters.customerId) {
      queryBuilder.andWhere('ct.customerId = :customerId', { customerId: filters.customerId });
    }

    if (filters.status) {
      queryBuilder.andWhere('ct.status = :status', { status: filters.status });
    }

    if (filters.startDate) {
      queryBuilder.andWhere('ct.calculatedAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters.endDate) {
      queryBuilder.andWhere('ct.calculatedAt <= :endDate', { endDate: filters.endDate });
    }

    const [transactions, total] = await queryBuilder.skip(skip).take(limit).getManyAndCount();

    return {
      transactions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Create or update commission configuration (Admin only)
   */
  async createCommissionConfig(
    businessOwnerCommissionPercent: number,
    customerRewardPercent: number,
    effectiveFrom: Date,
    createdByAdminId: string,
    notes?: string,
  ): Promise<CommissionConfig> {
    // Validate percentages
    if (businessOwnerCommissionPercent < 0 || businessOwnerCommissionPercent > 100) {
      throw new BadRequestException('Business owner commission percent must be between 0 and 100');
    }

    if (customerRewardPercent < 0 || customerRewardPercent > 100) {
      throw new BadRequestException('Customer reward percent must be between 0 and 100');
    }

    // Deactivate previous configs with overlapping dates
    await this.commissionConfigRepository.update(
      {
        isActive: true,
        effectiveFrom: LessThanOrEqual(effectiveFrom),
      },
      {
        isActive: false,
        effectiveUntil: new Date(effectiveFrom.getTime() - 24 * 60 * 60 * 1000), // Day before new config
      },
    );

    // Create new config
    const config = this.commissionConfigRepository.create({
      businessOwnerCommissionPercent,
      customerRewardPercent,
      effectiveFrom,
      isActive: true,
      createdByAdminId,
      notes,
    });

    const savedConfig = await this.commissionConfigRepository.save(config);

    this.logger.log(
      `New commission config created: BO=${businessOwnerCommissionPercent}%, Customer=${customerRewardPercent}%, Effective from ${effectiveFrom.toISOString()}`,
    );

    return savedConfig;
  }

  /**
   * Get commission configuration history
   */
  async getCommissionConfigHistory(limit: number = 20): Promise<CommissionConfig[]> {
    return await this.commissionConfigRepository.find({
      order: {
        effectiveFrom: 'DESC',
      },
      take: limit,
      relations: ['createdBy'],
    });
  }
}
