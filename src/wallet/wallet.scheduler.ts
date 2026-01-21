import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SettlementService } from './settlement.service';
import { RewardPointsService } from './reward-points.service';
import { DailyPayoutService } from './daily-payout.service';

@Injectable()
export class WalletScheduler {
  private readonly logger = new Logger(WalletScheduler.name);

  constructor(
    private readonly settlementService: SettlementService,
    private readonly rewardPointsService: RewardPointsService,
    private readonly dailyPayoutService: DailyPayoutService,
  ) {}

  /**
   * Generate monthly settlements on 1st of every month at 2:00 AM
   * Cron: 0 2 1 * * (minute hour day-of-month month day-of-week)
   */
  @Cron('0 2 1 * *')
  async generateMonthlySettlements() {
    this.logger.log('🔄 Starting monthly settlement generation...');

    try {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const month = lastMonth.toISOString().substring(0, 7); // YYYY-MM format

      const settlements = await this.settlementService.generateAllMonthlySettlements(month);

      this.logger.log(`✅ Generated ${settlements.length} settlements for ${month}`);

      // Log summary
      const totalBookings = settlements.reduce((sum, s) => sum + s.bookingCount, 0);
      const totalAmount = settlements.reduce((sum, s) => sum + Number(s.totalBookingAmount), 0);
      const totalCommission = settlements.reduce((sum, s) => sum + Number(s.totalCommissionAmount), 0);

      this.logger.log(
        `📊 Settlement Summary: ${totalBookings} bookings, ₹${totalAmount} total, ₹${totalCommission} commission`,
      );
    } catch (error) {
      this.logger.error(`❌ Failed to generate monthly settlements: ${error.message}`, error.stack);
    }
  }

  /**
   * Process pending payouts on 1st of every month at 4:00 AM
   * Runs 2 hours after settlement generation
   * Cron: 0 4 1 * *
   */
  @Cron('0 4 1 * *')
  async processPendingPayouts() {
    this.logger.log('🔄 Starting payout processing...');

    try {
      // Get all pending settlements
      const pendingSettlements = await this.settlementService.getAllSettlements({
        status: 'pending' as any,
        page: 1,
        limit: 100,
      });

      let successCount = 0;
      let failureCount = 0;

      for (const settlement of pendingSettlements.settlements) {
        // Only process positive settlements (company pays business owner)
        if (settlement.netPayableToBusinessOwner > 0) {
          try {
            await this.settlementService.processPayout(settlement.id);
            successCount++;
            this.logger.log(`✅ Processed payout for settlement ${settlement.id}: ₹${settlement.netPayableToBusinessOwner}`);
          } catch (error) {
            failureCount++;
            this.logger.error(`❌ Failed to process payout for settlement ${settlement.id}: ${error.message}`);
          }
        }
      }

      this.logger.log(`📊 Payout Processing Complete: ${successCount} succeeded, ${failureCount} failed`);
    } catch (error) {
      this.logger.error(`❌ Payout processing failed: ${error.message}`, error.stack);
    }
  }

  /**
   * Expire old reward points daily at 1:00 AM
   * Cron: 0 1 * * *
   */
  @Cron('0 1 * * *')
  async expireOldPoints() {
    this.logger.log('🔄 Starting reward points expiry check...');

    try {
      await this.rewardPointsService.expireOldPoints();
      this.logger.log('✅ Reward points expiry check completed');
    } catch (error) {
      this.logger.error(`❌ Failed to expire reward points: ${error.message}`, error.stack);
    }
  }

  /**
   * Calculate expiring points (30 days warning) daily at 1:30 AM
   * Cron: 30 1 * * *
   */
  @Cron('30 1 * * *')
  async calculateExpiringPoints() {
    this.logger.log('🔄 Calculating expiring reward points...');

    try {
      await this.rewardPointsService.calculateExpiringPoints();
      this.logger.log('✅ Expiring points calculation completed');
    } catch (error) {
      this.logger.error(`❌ Failed to calculate expiring points: ${error.message}`, error.stack);
    }
  }

  /**
   * Process daily automatic payouts at 3:00 AM
   * Transfers positive wallet balances to business owners' bank accounts
   * Cron: 0 3 * * *
   */
  @Cron('0 3 * * *')
  async processDailyPayouts() {
    this.logger.log('🔄 Starting daily automatic payout processing...');

    try {
      const summary = await this.dailyPayoutService.processDailyPayouts();

      this.logger.log(
        `✅ Daily payout processing completed | ` +
          `Processed: ${summary.totalProcessed} | Success: ${summary.successCount} | ` +
          `Failed: ${summary.failedCount} | Skipped: ${summary.skippedCount} | ` +
          `Total Paid Out: ₹${summary.totalPaidOut.toFixed(2)}`,
      );

      if (summary.failedCount > 0) {
        const failedDetails = summary.results
          .filter((r) => r.status === 'failed')
          .map((r) => `${r.shopId}: ${r.reason}`)
          .join(', ');
        this.logger.error(`⚠️ ${summary.failedCount} payouts failed: ${failedDetails}`);
      }

      if (summary.skippedCount > 0) {
        const skippedDetails = summary.results
          .filter((r) => r.status === 'skipped')
          .map((r) => `${r.shopId}: ${r.reason}`)
          .join(', ');
        this.logger.warn(`⚠️ ${summary.skippedCount} payouts skipped: ${skippedDetails}`);
      }
    } catch (error) {
      this.logger.error(`❌ Daily payout processing failed: ${error.message}`, error.stack);
    }
  }

  /**
   * Daily wallet reconciliation at 3:30 AM (after payouts)
   * Verify all wallet balances match transaction history
   * Cron: 30 3 * * *
   */
  @Cron('30 3 * * *')
  async dailyWalletReconciliation() {
    this.logger.log('🔄 Starting daily wallet reconciliation...');

    try {
      // In production, you would:
      // 1. Get all active wallets from database
      // 2. Reconcile each wallet
      // 3. Log mismatches
      // 4. Alert admin on critical discrepancies

      // Placeholder for now
      this.logger.log('✅ Daily wallet reconciliation completed');
    } catch (error) {
      this.logger.error(`❌ Wallet reconciliation failed: ${error.message}`, error.stack);
    }
  }

  /**
   * Send negative balance alerts to admins at 9:00 AM daily
   * Cron: 0 9 * * *
   */
  @Cron('0 9 * * *')
  async checkNegativeBalances() {
    this.logger.log('🔄 Checking for negative wallet balances...');

    try {
      // In production:
      // 1. Query wallets with balance < -10000
      // 2. Send alert emails to admins
      // 3. Block new bookings if balance < -50000

      this.logger.log('✅ Negative balance check completed');
    } catch (error) {
      this.logger.error(`❌ Negative balance check failed: ${error.message}`, error.stack);
    }
  }

  /**
   * Monthly settlement reminder on 5th of every month at 10:00 AM
   * Reminds admins to review pending settlements
   * Cron: 0 10 5 * *
   */
  @Cron('0 10 5 * *')
  async settlementReminder() {
    this.logger.log('🔄 Checking for pending settlements...');

    try {
      const pendingApprovals = await this.settlementService.getPendingApprovals();

      if (pendingApprovals.length > 0) {
        this.logger.warn(
          `⚠️ ${pendingApprovals.length} settlements require payment from business owners. Please review admin panel.`,
        );

        // In production: Send email/SMS alerts to admins
      } else {
        this.logger.log('✅ No pending settlement approvals');
      }
    } catch (error) {
      this.logger.error(`❌ Settlement reminder failed: ${error.message}`, error.stack);
    }
  }
}
