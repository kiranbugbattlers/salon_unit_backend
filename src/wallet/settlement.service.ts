import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
import {
  MonthlySettlement,
  SettlementStatus,
  SettlementTransaction,
  CommissionTransaction,
  CommissionTransactionStatus,
  CODTransaction,
  CODTransactionStatus,
  Booking,
  BookingStatus,
  BusinessOwner,
  BankingInfo,
  WalletTransactionCategory,
} from '../database/entities';
import { PaymentMethodType } from '../database/entities/settlement-transaction.entity';
import { WalletService } from './wallet.service';
import { RazorpayPayoutService } from './razorpay-payout.service';

@Injectable()
export class SettlementService {
  private readonly logger = new Logger(SettlementService.name);

  constructor(
    @InjectRepository(MonthlySettlement)
    private readonly settlementRepository: Repository<MonthlySettlement>,
    @InjectRepository(SettlementTransaction)
    private readonly settlementTransactionRepository: Repository<SettlementTransaction>,
    @InjectRepository(CommissionTransaction)
    private readonly commissionTransactionRepository: Repository<CommissionTransaction>,
    @InjectRepository(CODTransaction)
    private readonly codTransactionRepository: Repository<CODTransaction>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(BusinessOwner)
    private readonly businessOwnerRepository: Repository<BusinessOwner>,
    @InjectRepository(BankingInfo)
    private readonly bankingInfoRepository: Repository<BankingInfo>,
    private readonly walletService: WalletService,
    private readonly razorpayPayoutService: RazorpayPayoutService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Generate monthly settlement for a business owner
   * Called by cron job on 1st of every month
   */
  async generateMonthlySettlement(businessOwnerId: string, month: string): Promise<MonthlySettlement> {
    // Validate/sanitize month format (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(month)) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(month)) {
        month = month.substring(0, 7);
      } else {
        throw new Error(`Invalid month format: ${month}. Expected YYYY-MM`);
      }
    }

    return await this.dataSource.transaction(async (transactionalEntityManager) => {
      // Check if settlement already exists
      const existingSettlement = await transactionalEntityManager.findOne(MonthlySettlement, {
        where: { businessOwnerId, settlementMonth: month },
      });

      if (existingSettlement) {
        this.logger.warn(`Settlement already exists for business owner ${businessOwnerId} for ${month}`);
        return existingSettlement;
      }

      // Parse month (format: YYYY-MM)
      const [year, monthNum] = month.split('-').map(Number);
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0, 23, 59, 59); // Last day of month

      // Get all completed bookings for the month
      const completedBookings = await transactionalEntityManager.find(Booking, {
        where: {
          businessOwnerId,
          status: BookingStatus.COMPLETED,
          serviceCompletedAt: Between(startDate, endDate),
        },
        relations: ['commissionTransaction'],
      });

      if (completedBookings.length === 0) {
        this.logger.log(`No completed bookings for business owner ${businessOwnerId} in ${month}`);
        // Still create settlement with zero amounts
      }

      let totalBookingAmount = 0;
      let totalCommissionAmount = 0;
      let totalCODAmount = 0;
      let totalOnlineAmount = 0;
      const settlementTransactions: any[] = [];

      // Process each booking
      for (const booking of completedBookings) {
        const bookingAmount = Number(booking.totalAmount);
        const paymentMethod = booking.paymentMethod || PaymentMethodType.ONLINE;

        let commissionAmount = 0;
        let commissionTransactionId: string | undefined;

        // Get commission transaction
        if (booking.commissionTransactionId) {
          const commissionTransaction = await transactionalEntityManager.findOne(CommissionTransaction, {
            where: { id: booking.commissionTransactionId },
          });

          if (commissionTransaction && commissionTransaction.status === CommissionTransactionStatus.APPLIED) {
            commissionAmount = Number(commissionTransaction.businessOwnerCommissionAmount);
            commissionTransactionId = commissionTransaction.id;
          }
        }

        totalBookingAmount += bookingAmount;
        totalCommissionAmount += commissionAmount;

        if (paymentMethod === PaymentMethodType.COD) {
          totalCODAmount += bookingAmount;

          // Update COD transaction status
          await transactionalEntityManager.update(
            CODTransaction,
            { bookingId: booking.id },
            {
              status: CODTransactionStatus.SETTLED,
              settledInMonth: month,
            },
          );
        } else {
          totalOnlineAmount += bookingAmount;
        }

        // Create settlement transaction line item
        settlementTransactions.push({
          bookingId: booking.id,
          commissionTransactionId,
          amount: bookingAmount,
          commissionAmount,
          netAmount: bookingAmount - commissionAmount,
          paymentMethod,
          bookingCompletedAt: booking.serviceCompletedAt,
        });
      }

      // Calculate net payable
      // For online payments: Company has the money, pays business owner (totalOnline - commission on online)
      // For COD payments: Business owner has the money, owes commission to company (commission on COD)
      const netPayableToBusinessOwner = totalOnlineAmount - totalCommissionAmount;

      // Create settlement
      const settlement = transactionalEntityManager.create(MonthlySettlement, {
        businessOwnerId,
        settlementMonth: month,
        totalBookingAmount,
        totalCommissionAmount,
        netPayableToBusinessOwner,
        totalCODAmount,
        totalOnlineAmount,
        bookingCount: completedBookings.length,
        status:
          netPayableToBusinessOwner < 0 ? SettlementStatus.REQUIRES_PAYMENT : SettlementStatus.PENDING,
      });

      const savedSettlement = await transactionalEntityManager.save(MonthlySettlement, settlement);

      // Create settlement transaction records
      for (const txn of settlementTransactions) {
        const settlementTxn = transactionalEntityManager.create(SettlementTransaction, {
          settlementId: savedSettlement.id,
          ...txn,
        });
        await transactionalEntityManager.save(SettlementTransaction, settlementTxn);

        // Update COD transactions with settlement ID
        if (txn.paymentMethod === PaymentMethodType.COD) {
          await transactionalEntityManager.update(
            CODTransaction,
            { bookingId: txn.bookingId },
            { settlementId: savedSettlement.id },
          );
        }
      }

      this.logger.log(
        `✅ Settlement generated for ${businessOwnerId} (${month}): ` +
          `Bookings=${completedBookings.length}, Total=₹${totalBookingAmount}, ` +
          `Commission=₹${totalCommissionAmount}, Net Payable=₹${netPayableToBusinessOwner}`,
      );

      return savedSettlement;
    });
  }

  /**
   * Generate settlements for all business owners for a given month
   */
  async generateAllMonthlySettlements(month: string): Promise<MonthlySettlement[]> {
    const businessOwners = await this.businessOwnerRepository.find({
      where: { isApproved: true },
    });

    const settlements: MonthlySettlement[] = [];

    for (const businessOwner of businessOwners) {
      try {
        const settlement = await this.generateMonthlySettlement(businessOwner.id, month);
        settlements.push(settlement);
      } catch (error) {
        this.logger.error(`Failed to generate settlement for ${businessOwner.id}: ${error.message}`);
      }
    }

    this.logger.log(`Generated ${settlements.length} settlements for ${month}`);
    return settlements;
  }

  /**
   * Process payout via Razorpay for a settlement
   */
  async processPayout(settlementId: string): Promise<MonthlySettlement> {
    const settlement = await this.settlementRepository.findOne({
      where: { id: settlementId },
      relations: ['businessOwner', 'businessOwner.user'],
    });

    if (!settlement) {
      throw new NotFoundException(`Settlement not found with ID: ${settlementId}`);
    }

    if (settlement.status === SettlementStatus.COMPLETED) {
      throw new BadRequestException('Settlement already completed');
    }

    if (settlement.netPayableToBusinessOwner <= 0) {
      throw new BadRequestException(
        'Cannot process payout for negative or zero settlement. Business owner owes money to company.',
      );
    }

    // Get banking info
    const bankingInfo = await this.bankingInfoRepository.findOne({
      where: { businessOwnerId: settlement.businessOwnerId },
    });

    if (!bankingInfo) {
      throw new BadRequestException('Banking information not found. Please add bank details.');
    }

    if (!bankingInfo.isVerified) {
      throw new BadRequestException('Banking information not verified. Please contact admin.');
    }

    // Ensure fund account exists
    if (!bankingInfo.razorpayFundAccountId) {
      this.logger.log(`Creating fund account for business owner ${settlement.businessOwnerId}`);
      await this.razorpayPayoutService.createFundAccount(bankingInfo.id);
    }

    // Delegate to RazorpayPayoutService for actual payout processing
    this.logger.log(`Processing payout for settlement ${settlementId} via RazorpayPayoutService`);
    return await this.razorpayPayoutService.processPayout(settlementId);
  }

  /**
   * Mark business owner payment as received (for negative settlements)
   */
  async markPaymentReceived(settlementId: string, adminNotes?: string): Promise<MonthlySettlement> {
    const settlement = await this.settlementRepository.findOne({
      where: { id: settlementId },
    });

    if (!settlement) {
      throw new NotFoundException(`Settlement not found with ID: ${settlementId}`);
    }

    if (settlement.status === SettlementStatus.PAYMENT_RECEIVED) {
      throw new BadRequestException('Payment already marked as received');
    }

    if (settlement.netPayableToBusinessOwner >= 0) {
      throw new BadRequestException('This settlement is not a payment-required settlement');
    }

    settlement.status = SettlementStatus.PAYMENT_RECEIVED;
    settlement.payoutCompletedAt = new Date();
    settlement.adminNotes = adminNotes || 'Payment received from business owner';

    await this.settlementRepository.save(settlement);

    this.logger.log(`Payment marked as received for settlement ${settlementId}`);

    return settlement;
  }

  /**
   * Get settlement by ID
   */
  async getSettlementById(settlementId: string): Promise<MonthlySettlement> {
    const settlement = await this.settlementRepository.findOne({
      where: { id: settlementId },
      relations: ['businessOwner', 'transactions', 'transactions.booking', 'transactions.commissionTransaction'],
    });

    if (!settlement) {
      throw new NotFoundException(`Settlement not found with ID: ${settlementId}`);
    }

    return settlement;
  }

  /**
   * Get settlements for a business owner
   */
  async getBusinessOwnerSettlements(
    businessOwnerId: string,
    options?: {
      page?: number;
      limit?: number;
      status?: SettlementStatus;
    },
  ): Promise<{
    settlements: MonthlySettlement[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const page = options?.page || 1;
    const limit = options?.limit || 12; // 12 months per page
    const skip = (page - 1) * limit;

    const queryBuilder = this.settlementRepository
      .createQueryBuilder('settlement')
      .where('settlement.businessOwnerId = :businessOwnerId', { businessOwnerId })
      .orderBy('settlement.settlementMonth', 'DESC');

    if (options?.status) {
      queryBuilder.andWhere('settlement.status = :status', { status: options.status });
    }

    const [settlements, total] = await queryBuilder.skip(skip).take(limit).getManyAndCount();

    return {
      settlements,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get all settlements (Admin only)
   */
  async getAllSettlements(options?: {
    page?: number;
    limit?: number;
    status?: SettlementStatus;
    month?: string;
  }): Promise<{
    settlements: MonthlySettlement[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.settlementRepository
      .createQueryBuilder('settlement')
      .leftJoinAndSelect('settlement.businessOwner', 'businessOwner')
      .orderBy('settlement.settlementMonth', 'DESC')
      .addOrderBy('settlement.createdAt', 'DESC');

    if (options?.status) {
      queryBuilder.andWhere('settlement.status = :status', { status: options.status });
    }

    if (options?.month) {
      queryBuilder.andWhere('settlement.settlementMonth = :month', { month: options.month });
    }

    const [settlements, total] = await queryBuilder.skip(skip).take(limit).getManyAndCount();

    return {
      settlements,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get pending approvals (negative settlements requiring payment)
   */
  async getPendingApprovals(): Promise<MonthlySettlement[]> {
    return await this.settlementRepository.find({
      where: { status: SettlementStatus.REQUIRES_PAYMENT },
      relations: ['businessOwner'],
      order: { settlementMonth: 'DESC' },
    });
  }

  /**
   * Get settlement statistics
   */
  async getSettlementStats(month: string): Promise<{
    totalSettlements: number;
    totalBookings: number;
    totalBookingAmount: number;
    totalCommission: number;
    totalPayouts: number;
    pendingCount: number;
    completedCount: number;
    requiresPaymentCount: number;
  }> {
    const settlements = await this.settlementRepository.find({
      where: { settlementMonth: month },
    });

    const stats = settlements.reduce(
      (acc, settlement) => {
        acc.totalBookings += settlement.bookingCount;
        acc.totalBookingAmount += Number(settlement.totalBookingAmount);
        acc.totalCommission += Number(settlement.totalCommissionAmount);

        if (settlement.netPayableToBusinessOwner > 0) {
          acc.totalPayouts += Number(settlement.netPayableToBusinessOwner);
        }

        if (settlement.status === SettlementStatus.PENDING) acc.pendingCount++;
        if (settlement.status === SettlementStatus.COMPLETED) acc.completedCount++;
        if (settlement.status === SettlementStatus.REQUIRES_PAYMENT) acc.requiresPaymentCount++;

        return acc;
      },
      {
        totalSettlements: settlements.length,
        totalBookings: 0,
        totalBookingAmount: 0,
        totalCommission: 0,
        totalPayouts: 0,
        pendingCount: 0,
        completedCount: 0,
        requiresPaymentCount: 0,
      },
    );

    return stats;
  }
}
