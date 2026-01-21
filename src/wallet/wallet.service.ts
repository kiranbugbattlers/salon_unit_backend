import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  Wallet,
  WalletUserType,
  WalletTransaction,
  WalletTransactionType,
  WalletTransactionCategory,
  WalletTransactionStatus,
  BusinessOwner,
} from '../database/entities';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    @InjectRepository(Wallet)
    public readonly walletRepository: Repository<Wallet>,
    @InjectRepository(WalletTransaction)
    private readonly walletTransactionRepository: Repository<WalletTransaction>,
    @InjectRepository(BusinessOwner)
    private readonly businessOwnerRepository: Repository<BusinessOwner>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Get or create wallet for a user
   */
  async getOrCreateWallet(userId: string, userType: WalletUserType): Promise<Wallet> {
    let wallet = await this.walletRepository.findOne({
      where: { userId, userType },
    });

    if (!wallet) {
      wallet = this.walletRepository.create({
        userId,
        userType,
        balance: 0,
        totalEarned: 0,
        totalSpent: 0,
        totalCommissionPaid: 0,
        totalCommissionReceived: 0,
        isActive: true,
      });
      wallet = await this.walletRepository.save(wallet);
      this.logger.log(`Created new wallet for user ${userId} (${userType})`);
    }

    return wallet;
  }

  /**
   * Get wallet by ID
   */
  async getWalletById(walletId: string): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({
      where: { id: walletId },
      relations: ['user'],
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet not found with ID: ${walletId}`);
    }

    return wallet;
  }

  /**
   * Get wallet by user ID and type
   */
  async getWalletByUser(userId: string, userType: WalletUserType): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({
      where: { userId, userType },
      relations: ['user'],
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet not found for user ${userId} (${userType})`);
    }

    return wallet;
  }

  /**
   * Create a wallet transaction (credit or debit) with atomic balance update
   * This is the core method that ensures transaction integrity
   */
  async createTransaction(
    walletId: string,
    type: WalletTransactionType,
    category: WalletTransactionCategory,
    amount: number,
    description: string,
    metadata?: {
      bookingId?: string;
      paymentId?: string;
      settlementId?: string;
      additionalData?: any;
    },
  ): Promise<WalletTransaction> {
    if (amount <= 0) {
      throw new BadRequestException('Transaction amount must be positive');
    }

    // Use transaction to ensure atomicity
    return await this.dataSource.transaction(async (transactionalEntityManager) => {
      // Lock wallet row for update to prevent race conditions
      const wallet = await transactionalEntityManager
        .createQueryBuilder(Wallet, 'wallet')
        .setLock('pessimistic_write')
        .where('wallet.id = :walletId', { walletId })
        .getOne();

      if (!wallet) {
        throw new NotFoundException(`Wallet not found with ID: ${walletId}`);
      }

      if (!wallet.isActive) {
        throw new BadRequestException('Wallet is not active');
      }

      const balanceBefore = Number(wallet.balance);
      let balanceAfter: number;

      if (type === WalletTransactionType.CREDIT) {
        balanceAfter = balanceBefore + amount;
        wallet.balance = balanceAfter;
        wallet.totalEarned = Number(wallet.totalEarned) + amount;

        // Track commission received for customers
        if (category === WalletTransactionCategory.COMMISSION || category === WalletTransactionCategory.REWARD_POINTS) {
          wallet.totalCommissionReceived = Number(wallet.totalCommissionReceived) + amount;
        }
      } else {
        // DEBIT
        balanceAfter = balanceBefore - amount;
        wallet.balance = balanceAfter;
        wallet.totalSpent = Number(wallet.totalSpent) + amount;

        // Track commission paid for business owners
        if (category === WalletTransactionCategory.COMMISSION) {
          wallet.totalCommissionPaid = Number(wallet.totalCommissionPaid) + amount;
        }

        // Allow negative balance for business owners (COD case)
        // But log a warning if balance goes below -10000
        if (balanceAfter < -10000 && wallet.userType === WalletUserType.BUSINESS_OWNER) {
          this.logger.warn(`⚠️ Business owner wallet ${walletId} balance is critically low: ${balanceAfter}`);
        }

        // Prevent customers from going negative
        if (balanceAfter < 0 && wallet.userType === WalletUserType.CUSTOMER) {
          throw new BadRequestException('Insufficient wallet balance');
        }
      }

      wallet.lastTransactionAt = new Date();
      await transactionalEntityManager.save(Wallet, wallet);

      // Auto-restore from defaulter status if balance becomes non-negative
      // This happens when business owner makes a payment to clear negative balance
      if (wallet.userType === WalletUserType.BUSINESS_OWNER && balanceBefore < 0 && balanceAfter >= 0) {
        // Find the business owner and check if they are marked as defaulter
        const businessOwner = await transactionalEntityManager.findOne(BusinessOwner, {
          where: { userId: wallet.userId, isDefaulter: true },
        });

        if (businessOwner) {
          // Restore from defaulter status
          businessOwner.isDefaulter = false;
          businessOwner.defaulterSince = null;
          await transactionalEntityManager.save(BusinessOwner, businessOwner);

          this.logger.log(
            `✅ Business owner ${businessOwner.businessName} (${businessOwner.shopId}) restored from defaulter status. ` +
              `Wallet balance: ${balanceBefore} → ${balanceAfter}`,
          );
        }
      }

      // Create transaction record
      const transaction = transactionalEntityManager.create(WalletTransaction, {
        walletId,
        type,
        category,
        amount,
        balanceBefore,
        balanceAfter,
        bookingId: metadata?.bookingId,
        paymentId: metadata?.paymentId,
        settlementId: metadata?.settlementId,
        description,
        metadata: metadata?.additionalData,
        status: WalletTransactionStatus.COMPLETED,
      });

      const savedTransaction = await transactionalEntityManager.save(WalletTransaction, transaction);

      this.logger.log(
        `Wallet transaction created: ${type} ${amount} INR | ` +
          `Wallet ${walletId} | ${balanceBefore} → ${balanceAfter} | ` +
          `Category: ${category}`,
      );

      return savedTransaction;
    });
  }

  /**
   * Credit wallet (add money)
   */
  async credit(
    walletId: string,
    category: WalletTransactionCategory,
    amount: number,
    description: string,
    metadata?: any,
  ): Promise<WalletTransaction> {
    return this.createTransaction(walletId, WalletTransactionType.CREDIT, category, amount, description, metadata);
  }

  /**
   * Debit wallet (subtract money)
   */
  async debit(
    walletId: string,
    category: WalletTransactionCategory,
    amount: number,
    description: string,
    metadata?: any,
  ): Promise<WalletTransaction> {
    return this.createTransaction(walletId, WalletTransactionType.DEBIT, category, amount, description, metadata);
  }

  /**
   * Get wallet transactions with pagination
   */
  async getTransactions(
    walletId: string,
    options?: {
      page?: number;
      limit?: number;
      category?: WalletTransactionCategory;
      type?: WalletTransactionType;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<{ transactions: WalletTransaction[]; total: number; page: number; totalPages: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.walletTransactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.walletId = :walletId', { walletId })
      .orderBy('transaction.createdAt', 'DESC');

    if (options?.category) {
      queryBuilder.andWhere('transaction.category = :category', { category: options.category });
    }

    if (options?.type) {
      queryBuilder.andWhere('transaction.type = :type', { type: options.type });
    }

    if (options?.startDate) {
      queryBuilder.andWhere('transaction.createdAt >= :startDate', { startDate: options.startDate });
    }

    if (options?.endDate) {
      queryBuilder.andWhere('transaction.createdAt <= :endDate', { endDate: options.endDate });
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
   * Get wallet balance
   */
  async getBalance(walletId: string): Promise<number> {
    const wallet = await this.getWalletById(walletId);
    return Number(wallet.balance);
  }

  /**
   * Reverse a transaction (for refunds, cancellations)
   */
  async reverseTransaction(transactionId: string, reason: string): Promise<WalletTransaction> {
    return await this.dataSource.transaction(async (transactionalEntityManager) => {
      const originalTransaction = await transactionalEntityManager.findOne(WalletTransaction, {
        where: { id: transactionId },
      });

      if (!originalTransaction) {
        throw new NotFoundException(`Transaction not found with ID: ${transactionId}`);
      }

      if (originalTransaction.status === WalletTransactionStatus.REVERSED) {
        throw new BadRequestException('Transaction already reversed');
      }

      // Create reverse transaction
      const reverseType =
        originalTransaction.type === WalletTransactionType.CREDIT
          ? WalletTransactionType.DEBIT
          : WalletTransactionType.CREDIT;

      const reverseTransaction = await this.createTransaction(
        originalTransaction.walletId,
        reverseType,
        WalletTransactionCategory.REFUND,
        originalTransaction.amount,
        `Reversal: ${reason}`,
        {
          bookingId: originalTransaction.bookingId,
          paymentId: originalTransaction.paymentId,
          additionalData: {
            originalTransactionId: transactionId,
            reversalReason: reason,
          },
        },
      );

      // Mark original transaction as reversed
      originalTransaction.status = WalletTransactionStatus.REVERSED;
      await transactionalEntityManager.save(WalletTransaction, originalTransaction);

      this.logger.log(`Transaction ${transactionId} reversed. Reason: ${reason}`);

      return reverseTransaction;
    });
  }

  /**
   * Daily reconciliation check - verify wallet balance matches transaction history
   */
  async reconcileWallet(walletId: string): Promise<{
    isBalanced: boolean;
    expectedBalance: number;
    actualBalance: number;
    difference: number;
  }> {
    const wallet = await this.getWalletById(walletId);

    // Calculate expected balance from all transactions
    const result = await this.walletTransactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(CASE WHEN type = :credit THEN amount ELSE -amount END)', 'netAmount')
      .where('transaction.walletId = :walletId', { walletId })
      .andWhere('transaction.status = :status', { status: WalletTransactionStatus.COMPLETED })
      .setParameters({ credit: WalletTransactionType.CREDIT })
      .getRawOne();

    const expectedBalance = Number(result.netAmount) || 0;
    const actualBalance = Number(wallet.balance);
    const difference = Math.abs(actualBalance - expectedBalance);

    const isBalanced = difference < 0.01; // Allow 1 paisa difference for rounding

    if (!isBalanced) {
      this.logger.error(
        `⚠️ Wallet reconciliation mismatch for wallet ${walletId}: ` +
          `Expected ${expectedBalance}, Actual ${actualBalance}, Difference ${difference}`,
      );
    }

    return {
      isBalanced,
      expectedBalance,
      actualBalance,
      difference,
    };
  }

  /**
   * Admin: Manual wallet adjustment
   */
  async adminAdjustWallet(
    walletId: string,
    amount: number,
    reason: string,
    adminId: string,
  ): Promise<WalletTransaction> {
    const type = amount > 0 ? WalletTransactionType.CREDIT : WalletTransactionType.DEBIT;
    const absoluteAmount = Math.abs(amount);

    return this.createTransaction(
      walletId,
      type,
      WalletTransactionCategory.ADJUSTMENT,
      absoluteAmount,
      `Admin adjustment: ${reason}`,
      {
        additionalData: {
          adjustedBy: adminId,
          adjustmentReason: reason,
        },
      },
    );
  }

  /**
   * Get wallet statistics (consolidated with commission summary for business owners)
   */
  async getWalletStats(
    walletId: string,
    options?: {
      businessOwnerId?: string;
      customerId?: string;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<{
    balance: number;
    totalEarned: number;
    totalSpent: number;
    totalCommissionPaid: number;
    totalCommissionReceived: number;
    transactionCount: number;
    lastTransactionAt: Date | null;
    totalBookings?: number;
    totalBookingAmount?: number;
    averageCommissionPercent?: number;
    netEarnings?: number;
  }> {
    const wallet = await this.getWalletById(walletId);
    const transactionCount = await this.walletTransactionRepository.count({
      where: { walletId },
    });

    const baseStats = {
      balance: Number(wallet.balance),
      totalEarned: Number(wallet.totalEarned),
      totalSpent: Number(wallet.totalSpent),
      totalCommissionPaid: Number(wallet.totalCommissionPaid),
      totalCommissionReceived: Number(wallet.totalCommissionReceived),
      transactionCount,
      lastTransactionAt: wallet.lastTransactionAt,
    };

    // If businessOwnerId is provided, include commission summary
    if (options?.businessOwnerId) {
      // These will be populated by the controller calling commissionService
      return {
        ...baseStats,
        totalBookings: 0,
        totalBookingAmount: 0,
        averageCommissionPercent: 0,
        netEarnings: 0,
      };
    }

    return baseStats;
  }
}
