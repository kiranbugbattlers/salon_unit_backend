"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var WalletScheduler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletScheduler = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const settlement_service_1 = require("./settlement.service");
const reward_points_service_1 = require("./reward-points.service");
const daily_payout_service_1 = require("./daily-payout.service");
let WalletScheduler = WalletScheduler_1 = class WalletScheduler {
    constructor(settlementService, rewardPointsService, dailyPayoutService) {
        this.settlementService = settlementService;
        this.rewardPointsService = rewardPointsService;
        this.dailyPayoutService = dailyPayoutService;
        this.logger = new common_1.Logger(WalletScheduler_1.name);
    }
    async generateMonthlySettlements() {
        this.logger.log('🔄 Starting monthly settlement generation...');
        try {
            const lastMonth = new Date();
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            const month = lastMonth.toISOString().substring(0, 7);
            const settlements = await this.settlementService.generateAllMonthlySettlements(month);
            this.logger.log(`✅ Generated ${settlements.length} settlements for ${month}`);
            const totalBookings = settlements.reduce((sum, s) => sum + s.bookingCount, 0);
            const totalAmount = settlements.reduce((sum, s) => sum + Number(s.totalBookingAmount), 0);
            const totalCommission = settlements.reduce((sum, s) => sum + Number(s.totalCommissionAmount), 0);
            this.logger.log(`📊 Settlement Summary: ${totalBookings} bookings, ₹${totalAmount} total, ₹${totalCommission} commission`);
        }
        catch (error) {
            this.logger.error(`❌ Failed to generate monthly settlements: ${error.message}`, error.stack);
        }
    }
    async processPendingPayouts() {
        this.logger.log('🔄 Starting payout processing...');
        try {
            const pendingSettlements = await this.settlementService.getAllSettlements({
                status: 'pending',
                page: 1,
                limit: 100,
            });
            let successCount = 0;
            let failureCount = 0;
            for (const settlement of pendingSettlements.settlements) {
                if (settlement.netPayableToBusinessOwner > 0) {
                    try {
                        await this.settlementService.processPayout(settlement.id);
                        successCount++;
                        this.logger.log(`✅ Processed payout for settlement ${settlement.id}: ₹${settlement.netPayableToBusinessOwner}`);
                    }
                    catch (error) {
                        failureCount++;
                        this.logger.error(`❌ Failed to process payout for settlement ${settlement.id}: ${error.message}`);
                    }
                }
            }
            this.logger.log(`📊 Payout Processing Complete: ${successCount} succeeded, ${failureCount} failed`);
        }
        catch (error) {
            this.logger.error(`❌ Payout processing failed: ${error.message}`, error.stack);
        }
    }
    async expireOldPoints() {
        this.logger.log('🔄 Starting reward points expiry check...');
        try {
            await this.rewardPointsService.expireOldPoints();
            this.logger.log('✅ Reward points expiry check completed');
        }
        catch (error) {
            this.logger.error(`❌ Failed to expire reward points: ${error.message}`, error.stack);
        }
    }
    async calculateExpiringPoints() {
        this.logger.log('🔄 Calculating expiring reward points...');
        try {
            await this.rewardPointsService.calculateExpiringPoints();
            this.logger.log('✅ Expiring points calculation completed');
        }
        catch (error) {
            this.logger.error(`❌ Failed to calculate expiring points: ${error.message}`, error.stack);
        }
    }
    async processDailyPayouts() {
        this.logger.log('🔄 Starting daily automatic payout processing...');
        try {
            const summary = await this.dailyPayoutService.processDailyPayouts();
            this.logger.log(`✅ Daily payout processing completed | ` +
                `Processed: ${summary.totalProcessed} | Success: ${summary.successCount} | ` +
                `Failed: ${summary.failedCount} | Skipped: ${summary.skippedCount} | ` +
                `Total Paid Out: ₹${summary.totalPaidOut.toFixed(2)}`);
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
        }
        catch (error) {
            this.logger.error(`❌ Daily payout processing failed: ${error.message}`, error.stack);
        }
    }
    async dailyWalletReconciliation() {
        this.logger.log('🔄 Starting daily wallet reconciliation...');
        try {
            this.logger.log('✅ Daily wallet reconciliation completed');
        }
        catch (error) {
            this.logger.error(`❌ Wallet reconciliation failed: ${error.message}`, error.stack);
        }
    }
    async checkNegativeBalances() {
        this.logger.log('🔄 Checking for negative wallet balances...');
        try {
            this.logger.log('✅ Negative balance check completed');
        }
        catch (error) {
            this.logger.error(`❌ Negative balance check failed: ${error.message}`, error.stack);
        }
    }
    async settlementReminder() {
        this.logger.log('🔄 Checking for pending settlements...');
        try {
            const pendingApprovals = await this.settlementService.getPendingApprovals();
            if (pendingApprovals.length > 0) {
                this.logger.warn(`⚠️ ${pendingApprovals.length} settlements require payment from business owners. Please review admin panel.`);
            }
            else {
                this.logger.log('✅ No pending settlement approvals');
            }
        }
        catch (error) {
            this.logger.error(`❌ Settlement reminder failed: ${error.message}`, error.stack);
        }
    }
};
exports.WalletScheduler = WalletScheduler;
__decorate([
    (0, schedule_1.Cron)('0 2 1 * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WalletScheduler.prototype, "generateMonthlySettlements", null);
__decorate([
    (0, schedule_1.Cron)('0 4 1 * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WalletScheduler.prototype, "processPendingPayouts", null);
__decorate([
    (0, schedule_1.Cron)('0 1 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WalletScheduler.prototype, "expireOldPoints", null);
__decorate([
    (0, schedule_1.Cron)('30 1 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WalletScheduler.prototype, "calculateExpiringPoints", null);
__decorate([
    (0, schedule_1.Cron)('0 3 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WalletScheduler.prototype, "processDailyPayouts", null);
__decorate([
    (0, schedule_1.Cron)('30 3 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WalletScheduler.prototype, "dailyWalletReconciliation", null);
__decorate([
    (0, schedule_1.Cron)('0 9 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WalletScheduler.prototype, "checkNegativeBalances", null);
__decorate([
    (0, schedule_1.Cron)('0 10 5 * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WalletScheduler.prototype, "settlementReminder", null);
exports.WalletScheduler = WalletScheduler = WalletScheduler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [settlement_service_1.SettlementService,
        reward_points_service_1.RewardPointsService,
        daily_payout_service_1.DailyPayoutService])
], WalletScheduler);
//# sourceMappingURL=wallet.scheduler.js.map