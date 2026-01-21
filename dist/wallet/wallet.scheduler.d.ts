import { SettlementService } from './settlement.service';
import { RewardPointsService } from './reward-points.service';
import { DailyPayoutService } from './daily-payout.service';
export declare class WalletScheduler {
    private readonly settlementService;
    private readonly rewardPointsService;
    private readonly dailyPayoutService;
    private readonly logger;
    constructor(settlementService: SettlementService, rewardPointsService: RewardPointsService, dailyPayoutService: DailyPayoutService);
    generateMonthlySettlements(): Promise<void>;
    processPendingPayouts(): Promise<void>;
    expireOldPoints(): Promise<void>;
    calculateExpiringPoints(): Promise<void>;
    processDailyPayouts(): Promise<void>;
    dailyWalletReconciliation(): Promise<void>;
    checkNegativeBalances(): Promise<void>;
    settlementReminder(): Promise<void>;
}
