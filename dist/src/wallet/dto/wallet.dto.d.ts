import { WalletUserType, WalletTransactionType, WalletTransactionCategory, WalletTransactionStatus } from '../../database/entities';
export declare class WalletResponseDto {
    id: string;
    userId: string;
    userType: WalletUserType;
    balance: number;
    totalEarned: number;
    totalSpent: number;
    totalCommissionPaid: number;
    totalCommissionReceived: number;
    isActive: boolean;
    lastTransactionAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare class WalletStatsResponseDto {
    balance: number;
    totalEarned: number;
    totalSpent: number;
    totalCommissionPaid: number;
    totalCommissionReceived: number;
    transactionCount: number;
    lastTransactionAt: Date | null;
    totalBookings: number;
    totalBookingAmount: number;
    averageCommissionPercent: number;
    netEarnings: number;
}
export declare class WalletTransactionDto {
    id: string;
    walletId: string;
    type: WalletTransactionType;
    category: WalletTransactionCategory;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    bookingId?: string;
    paymentId?: string;
    description: string;
    status: WalletTransactionStatus;
    createdAt: Date;
}
export declare class WalletTransactionListResponseDto {
    transactions: WalletTransactionDto[];
    total: number;
    page: number;
    totalPages: number;
}
export declare class CreateCommissionConfigDto {
    businessOwnerCommissionPercent: number;
    customerRewardPercent: number;
    effectiveFrom: string;
    notes?: string;
}
export declare class CommissionConfigResponseDto {
    id: string;
    businessOwnerCommissionPercent: number;
    customerRewardPercent: number;
    isActive: boolean;
    effectiveFrom: Date;
    effectiveUntil?: Date;
    createdByAdminId: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class CommissionTransactionDto {
    id: string;
    bookingId: string;
    businessOwnerId: string;
    customerId: string;
    bookingAmount: number;
    businessOwnerCommissionPercent: number;
    businessOwnerCommissionAmount: number;
    customerRewardPercent: number;
    customerRewardAmount: number;
    status: string;
    calculatedAt: Date;
    createdAt: Date;
}
export declare class CommissionSummaryDto {
    totalBookings: number;
    totalBookingAmount: number;
    totalCommissionPaid: number;
    averageCommissionPercent: number;
    netEarnings: number;
}
export declare class RedeemPointsDto {
    pointsToRedeem: number;
}
export declare class RewardPointsResponseDto {
    id: string;
    customerId: string;
    totalPoints: number;
    totalEarned: number;
    totalRedeemed: number;
    tier: string;
    totalBookings: number;
    lastEarnedAt?: Date;
    lastRedeemedAt?: Date;
}
export declare class TierProgressDto {
    currentTier: string;
    totalBookings: number;
    nextTier: string | null;
    bookingsToNextTier: number;
    progress: number;
}
export declare class CustomerWalletOverviewDto {
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
}
export declare class MonthlySettlementDto {
    id: string;
    businessOwnerId: string;
    settlementMonth: string;
    totalBookingAmount: number;
    totalCommissionAmount: number;
    netPayableToBusinessOwner: number;
    totalCODAmount: number;
    totalOnlineAmount: number;
    bookingCount: number;
    status: string;
    razorpayPayoutId?: string;
    payoutInitiatedAt?: Date;
    payoutCompletedAt?: Date;
    createdAt: Date;
}
export declare class SettlementListResponseDto {
    settlements: MonthlySettlementDto[];
    total: number;
    page: number;
    totalPages: number;
}
export declare class MarkPaymentReceivedDto {
    adminNotes?: string;
}
export declare class SettlementStatsDto {
    totalSettlements: number;
    totalBookings: number;
    totalBookingAmount: number;
    totalCommission: number;
    totalPayouts: number;
    pendingCount: number;
    completedCount: number;
    requiresPaymentCount: number;
}
export declare class ApiResponseDto<T> {
    code: number;
    success: boolean;
    message: string;
    data: T;
}
export declare class WalletApiResponseDto extends ApiResponseDto<WalletResponseDto> {
    data: WalletResponseDto;
}
export declare class WalletStatsApiResponseDto extends ApiResponseDto<WalletStatsResponseDto> {
    data: WalletStatsResponseDto;
}
export declare class WalletTransactionListApiResponseDto extends ApiResponseDto<WalletTransactionListResponseDto> {
    data: WalletTransactionListResponseDto;
}
export declare class CommissionConfigApiResponseDto extends ApiResponseDto<CommissionConfigResponseDto> {
    data: CommissionConfigResponseDto;
}
export declare class CommissionSummaryApiResponseDto extends ApiResponseDto<CommissionSummaryDto> {
    data: CommissionSummaryDto;
}
export declare class RewardPointsApiResponseDto extends ApiResponseDto<RewardPointsResponseDto> {
    data: RewardPointsResponseDto;
}
export declare class SettlementApiResponseDto extends ApiResponseDto<MonthlySettlementDto> {
    data: MonthlySettlementDto;
}
export declare class SettlementListApiResponseDto extends ApiResponseDto<SettlementListResponseDto> {
    data: SettlementListResponseDto;
}
export declare class CustomerWalletOverviewApiResponseDto extends ApiResponseDto<CustomerWalletOverviewDto> {
    data: CustomerWalletOverviewDto;
}
