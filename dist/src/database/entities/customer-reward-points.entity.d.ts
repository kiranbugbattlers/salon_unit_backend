import { Customer } from './customer.entity';
export declare enum RewardTier {
    BRONZE = "bronze",
    SILVER = "silver",
    GOLD = "gold",
    PLATINUM = "platinum"
}
export declare class CustomerRewardPoints {
    id: string;
    customerId: string;
    totalPoints: number;
    totalEarned: number;
    totalRedeemed: number;
    expiringPoints: number;
    nextExpiryDate?: Date;
    tier: RewardTier;
    totalBookings: number;
    lastEarnedAt?: Date;
    lastRedeemedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    customer: Customer;
}
