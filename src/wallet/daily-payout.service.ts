import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  Wallet,
  WalletUserType,
  BusinessOwner,
  BankingInfo,
  WalletTransaction,
  WalletTransactionType,
  WalletTransactionCategory,
  WalletTransactionStatus,
} from '../database/entities';
import { RazorpayPayoutService } from './razorpay-payout.service';

interface PayoutResult {
  businessOwnerId: string;
  shopId: string;
  walletId: string;
  amount: number;
  status: 'success' | 'failed' | 'skipped';
  reason?: string;
  razorpayPayoutId?: string;
}

interface PayoutSummary {
  totalProcessed: number;
  successCount: number;
  failedCount: number;
  skippedCount: number;
  totalPaidOut: number;
  results: PayoutResult[];
}

@Injectable()
export class DailyPayoutService {
  private readonly logger = new Logger(DailyPayoutService.name);

  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(BusinessOwner)
    private readonly businessOwnerRepository: Repository<BusinessOwner>,
    @InjectRepository(BankingInfo)
    private readonly bankingInfoRepository: Repository<BankingInfo>,
    @InjectRepository(WalletTransaction)
    private readonly walletTransactionRepository: Repository<WalletTransaction>,
    private readonly razorpayPayoutService: RazorpayPayoutService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Main entry point - Process daily payouts for all eligible business owners
   * Runs every night at 3:00 AM via cron job
   */
  async processDailyPayouts(): Promise<PayoutSummary> {
    this.logger.log('🚀 Starting daily payout processing...');

    const summary: PayoutSummary = {
      totalProcessed: 0,
      successCount: 0,
      failedCount: 0,
      skippedCount: 0,
      totalPaidOut: 0,
      results: [],
    };

    try {
      // Get all eligible wallets (positive balance, active business owners)
      const eligibleWallets = await this.getEligibleWallets();

      this.logger.log(`Found ${eligibleWallets.length} business owners with positive balances`);

      if (eligibleWallets.length === 0) {
        this.logger.log('No business owners with positive balances to process');
        return summary;
      }

      // Process each business owner sequentially with delay
      for (const wallet of eligibleWallets) {
        summary.totalProcessed++;

        try {
          const result = await this.processBusinessOwnerPayout(wallet);
          summary.results.push(result);

          if (result.status === 'success') {
            summary.successCount++;
            summary.totalPaidOut += result.amount;
          } else if (result.status === 'failed') {
            summary.failedCount++;
          } else {
            summary.skippedCount++;
          }

          // Add small delay between payouts to avoid rate limiting
          await this.delay(100);
        } catch (error) {
          this.logger.error(
            `Unexpected error processing payout for wallet ${wallet.id}: ${error.message}`,
            error.stack,
          );

          summary.failedCount++;
          summary.results.push({
            businessOwnerId: wallet.userId,
            shopId: 'UNKNOWN',
            walletId: wallet.id,
            amount: Number(wallet.balance),
            status: 'failed',
            reason: `Unexpected error: ${error.message}`,
          });
        }
      }

      this.logger.log(
        `✅ Daily payout processing completed | ` +
          `Total: ${summary.totalProcessed} | Success: ${summary.successCount} | ` +
          `Failed: ${summary.failedCount} | Skipped: ${summary.skippedCount} | ` +
          `Total Paid: ₹${summary.totalPaidOut.toFixed(2)}`,
      );

      return summary;
    } catch (error) {
      this.logger.error(`❌ Fatal error in daily payout processing: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get all eligible wallets for payout
   * - Business owner type
   * - Positive balance
   * - Active wallet
   * - Approved business owner
   */
  private async getEligibleWallets(): Promise<Wallet[]> {
    return await this.walletRepository
      .createQueryBuilder('wallet')
      .innerJoin('wallet.user', 'user')
      .innerJoin(BusinessOwner, 'businessOwner', 'businessOwner.userId = user.id')
      .where('wallet.userType = :userType', { userType: WalletUserType.BUSINESS_OWNER })
      .andWhere('wallet.balance > 0')
      .andWhere('wallet.isActive = true')
      .andWhere('businessOwner.isApproved = true')
      .select(['wallet.id', 'wallet.userId', 'wallet.balance'])
      .getMany();
  }

  /**
   * Process payout for a single business owner
   */
  private async processBusinessOwnerPayout(wallet: Wallet): Promise<PayoutResult> {
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId: wallet.userId },
    });

    if (!businessOwner) {
      return {
        businessOwnerId: wallet.userId,
        shopId: 'UNKNOWN',
        walletId: wallet.id,
        amount: Number(wallet.balance),
        status: 'skipped',
        reason: 'Business owner record not found',
      };
    }

    this.logger.log(
      `Processing payout for ${businessOwner.shopId} | Balance: ₹${Number(wallet.balance).toFixed(2)}`,
    );

    // Check banking info
    const bankingInfo = await this.bankingInfoRepository.findOne({
      where: { businessOwnerId: businessOwner.id },
    });

    if (!bankingInfo) {
      this.logger.warn(`⚠️ No banking info found for ${businessOwner.shopId}`);
      return {
        businessOwnerId: businessOwner.id,
        shopId: businessOwner.shopId,
        walletId: wallet.id,
        amount: Number(wallet.balance),
        status: 'skipped',
        reason: 'Banking information not found',
      };
    }

    if (!bankingInfo.isVerified) {
      this.logger.warn(`⚠️ Banking info not verified for ${businessOwner.shopId}`);
      return {
        businessOwnerId: businessOwner.id,
        shopId: businessOwner.shopId,
        walletId: wallet.id,
        amount: Number(wallet.balance),
        status: 'skipped',
        reason: 'Banking information not verified',
      };
    }

    // Ensure fund account exists
    if (!bankingInfo.razorpayFundAccountId) {
      this.logger.log(`Creating fund account for ${businessOwner.shopId}`);

      try {
        await this.razorpayPayoutService.createFundAccount(bankingInfo.id);

        // Reload banking info to get the fund account ID
        const updatedBankingInfo = await this.bankingInfoRepository.findOne({
          where: { id: bankingInfo.id },
        });

        if (!updatedBankingInfo?.razorpayFundAccountId) {
          return {
            businessOwnerId: businessOwner.id,
            shopId: businessOwner.shopId,
            walletId: wallet.id,
            amount: Number(wallet.balance),
            status: 'failed',
            reason: 'Fund account creation failed',
          };
        }

        bankingInfo.razorpayFundAccountId = updatedBankingInfo.razorpayFundAccountId;
      } catch (error) {
        this.logger.error(
          `Failed to create fund account for ${businessOwner.shopId}: ${error.message}`,
        );
        return {
          businessOwnerId: businessOwner.id,
          shopId: businessOwner.shopId,
          walletId: wallet.id,
          amount: Number(wallet.balance),
          status: 'failed',
          reason: `Fund account creation failed: ${error.message}`,
        };
      }
    }

    // Execute the actual payout
    try {
      const payoutResult = await this.executePayout(wallet, businessOwner, bankingInfo);
      return payoutResult;
    } catch (error) {
      this.logger.error(`Payout execution failed for ${businessOwner.shopId}: ${error.message}`);
      return {
        businessOwnerId: businessOwner.id,
        shopId: businessOwner.shopId,
        walletId: wallet.id,
        amount: Number(wallet.balance),
        status: 'failed',
        reason: `Payout execution failed: ${error.message}`,
      };
    }
  }

  /**
   * Execute atomic payout with transaction safety
   * Either ALL steps succeed or NONE (rollback)
   */
  private async executePayout(
    wallet: Wallet,
    businessOwner: BusinessOwner,
    bankingInfo: BankingInfo,
  ): Promise<PayoutResult> {
    return await this.dataSource.transaction(async (transactionalEntityManager) => {
      // Lock wallet row to prevent race conditions
      const lockedWallet = await transactionalEntityManager
        .createQueryBuilder(Wallet, 'wallet')
        .setLock('pessimistic_write')
        .where('wallet.id = :walletId', { walletId: wallet.id })
        .getOne();

      if (!lockedWallet) {
        throw new Error('Wallet not found during lock');
      }

      // Re-check balance after lock (prevent race condition)
      if (lockedWallet.balance <= 0) {
        this.logger.warn(
          `Balance changed to ${lockedWallet.balance} for ${businessOwner.shopId}, skipping payout`,
        );
        return {
          businessOwnerId: businessOwner.id,
          shopId: businessOwner.shopId,
          walletId: wallet.id,
          amount: 0,
          status: 'skipped',
          reason: 'Balance became zero or negative during processing',
        };
      }

      const payoutAmount = Number(lockedWallet.balance);
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      this.logger.log(
        `💰 Initiating Razorpay payout for ${businessOwner.shopId}: ₹${payoutAmount.toFixed(2)}`,
      );

      // Create Razorpay payout via RazorpayPayoutService
      // Note: We're creating a temporary "daily payout" record
      // The RazorpayPayoutService expects a settlement ID, but for daily payouts
      // we'll create a wallet transaction instead

      try {
        // Convert to paise for Razorpay
        const amountInPaise = Math.round(payoutAmount * 100);

        // Call Razorpay API directly here since we don't have a settlement
        const payout = await this.razorpayPayoutService['razorpay'].payouts.create({
          account_number: this.razorpayPayoutService['accountNumber'],
          fund_account_id: bankingInfo.razorpayFundAccountId,
          amount: amountInPaise,
          currency: 'INR',
          mode: this.determinePayoutMode(payoutAmount),
          purpose: 'payout',
          queue_if_low_balance: true,
          reference_id: `daily_payout_${wallet.id}_${today}`,
          narration: `Daily payout - ${today}`,
        });

        this.logger.log(
          `✅ Razorpay payout created: ${payout.id} | Status: ${payout.status} | Amount: ₹${payoutAmount}`,
        );

        // Debit wallet balance
        lockedWallet.balance = 0;
        lockedWallet.totalSpent = Number(lockedWallet.totalSpent || 0) + payoutAmount;
        await transactionalEntityManager.save(Wallet, lockedWallet);

        // Create wallet transaction record
        const walletTransaction = transactionalEntityManager.create(WalletTransaction, {
          walletId: wallet.id,
          type: WalletTransactionType.DEBIT,
          category: WalletTransactionCategory.SETTLEMENT,
          amount: payoutAmount,
          balanceBefore: payoutAmount,
          balanceAfter: 0,
          status: WalletTransactionStatus.COMPLETED,
          description: `Daily automatic payout - ${today}`,
          metadata: {
            payoutType: 'daily',
            razorpayPayoutId: payout.id,
            fundAccountId: bankingInfo.razorpayFundAccountId,
            mode: payout.mode,
            reference: `daily_payout_${wallet.id}_${today}`,
          },
        });

        await transactionalEntityManager.save(WalletTransaction, walletTransaction);

        this.logger.log(
          `✅ Daily payout successful for ${businessOwner.shopId}: ₹${payoutAmount.toFixed(2)} | Payout ID: ${payout.id}`,
        );

        return {
          businessOwnerId: businessOwner.id,
          shopId: businessOwner.shopId,
          walletId: wallet.id,
          amount: payoutAmount,
          status: 'success',
          razorpayPayoutId: payout.id,
        };
      } catch (error) {
        // Transaction will auto-rollback
        this.logger.error(
          `Razorpay payout API failed for ${businessOwner.shopId}: ${error.message}`,
        );
        throw error; // Re-throw to trigger rollback
      }
    });
  }

  /**
   * Determine payout mode based on amount and time
   */
  private determinePayoutMode(amount: number): 'IMPS' | 'NEFT' | 'RTGS' {
    // RTGS for amounts >= ₹2 lakh (faster, but only during business hours)
    if (amount >= 200000) {
      const hour = new Date().getHours();
      if (hour >= 9 && hour < 16) {
        return 'RTGS';
      }
    }

    // IMPS for amounts < ₹2 lakh (24x7, instant)
    if (amount < 200000) {
      return 'IMPS';
    }

    // NEFT as fallback (works 24x7)
    return 'NEFT';
  }

  /**
   * Utility: Delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get payout history for a business owner
   * Returns all daily payout transactions
   */
  async getPayoutHistory(
    businessOwnerId: string,
    options?: { limit?: number; offset?: number },
  ): Promise<WalletTransaction[]> {
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { id: businessOwnerId },
      relations: ['user'],
    });

    if (!businessOwner) {
      return [];
    }

    const wallet = await this.walletRepository.findOne({
      where: {
        userId: businessOwner.userId,
        userType: WalletUserType.BUSINESS_OWNER,
      },
    });

    if (!wallet) {
      return [];
    }

    const query = this.walletTransactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.walletId = :walletId', { walletId: wallet.id })
      .andWhere('transaction.type = :type', { type: WalletTransactionType.DEBIT })
      .andWhere('transaction.category = :category', {
        category: WalletTransactionCategory.SETTLEMENT,
      })
      .andWhere('transaction.settlementId IS NULL') // Daily payouts have no settlement ID
      .orderBy('transaction.createdAt', 'DESC');

    if (options?.limit) {
      query.take(options.limit);
    }

    if (options?.offset) {
      query.skip(options.offset);
    }

    return await query.getMany();
  }
}
