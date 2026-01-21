import { Repository, DataSource } from 'typeorm';
import { CustomerRewardPoints, RewardTier } from '../database/entities';
import { WalletService } from './wallet.service';
export declare class RewardPointsService {
    private readonly rewardPointsRepository;
    private readonly walletService;
    private readonly dataSource;
    private readonly logger;
    private readonly TIER_THRESHOLDS;
    private readonly POINTS_EXPIRY_DAYS;
    constructor(rewardPointsRepository: Repository<CustomerRewardPoints>, walletService: WalletService, dataSource: DataSource);
    getOrCreateRewardPoints(customerId: string): Promise<CustomerRewardPoints>;
    getRewardPoints(customerId: string): Promise<CustomerRewardPoints>;
    redeemPoints(customerId: string, pointsToRedeem: number): Promise<{
        rewardPoints: CustomerRewardPoints;
        walletBalance: number;
    }>;
    getTierBenefits(tier: RewardTier): {
        tier: RewardTier;
        minBookings: number;
        benefits: string[];
    };
    getTierMultiplier(tier: RewardTier): number;
    getTierProgress(customerId: string): Promise<{
        currentTier: RewardTier;
        totalBookings: number;
        nextTier: RewardTier | null;
        bookingsToNextTier: number;
        progress: number;
    }>;
    expireOldPoints(): Promise<void>;
    calculateExpiringPoints(): Promise<void>;
    getPointsHistory(customerId: string, options?: {
        page?: number;
        limit?: number;
    }): Promise<{
        totalPoints: number;
        history: any[];
    }>;
    getLeaderboard(limit?: number): Promise<CustomerRewardPoints[]>;
    getCustomerWalletOverview(customerId: string, userId: string): Promise<{
        wallet: {
            balance: number;
            totalEarned: number;
            totalSpent: number;
            totalCommissionReceived: number;
            transactionCount: number;
            lastTransactionAt: Date | null;
        };
        rewardPoints: {
            totalPoints: number;
            totalEarned: number;
            totalRedeemed: number;
            tier: string;
            totalBookings: number;
            expiringPoints: number;
            nextExpiryDate: Date | null;
            lastEarnedAt: Date | null;
            lastRedeemedAt: Date | null;
        };
        tierProgress: {
            currentTier: string;
            totalBookings: number;
            nextTier: string | null;
            bookingsToNextTier: number;
            progress: number;
        };
    }>;
}
