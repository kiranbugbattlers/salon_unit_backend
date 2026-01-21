import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, IsEnum, Min, IsDateString } from 'class-validator';
import {
  WalletUserType,
  WalletTransactionType,
  WalletTransactionCategory,
  WalletTransactionStatus,
} from '../../database/entities';

// === Wallet Response DTOs ===

export class WalletResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: WalletUserType })
  userType: WalletUserType;

  @ApiProperty({ description: 'Current balance in INR' })
  balance: number;

  @ApiProperty({ description: 'Total earned (lifetime credits)' })
  totalEarned: number;

  @ApiProperty({ description: 'Total spent (lifetime debits)' })
  totalSpent: number;

  @ApiProperty({ description: 'Total commission paid' })
  totalCommissionPaid: number;

  @ApiProperty({ description: 'Total commission/rewards received' })
  totalCommissionReceived: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ required: false })
  lastTransactionAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class WalletStatsResponseDto {
  @ApiProperty()
  balance: number;

  @ApiProperty()
  totalEarned: number;

  @ApiProperty()
  totalSpent: number;

  @ApiProperty()
  totalCommissionPaid: number;

  @ApiProperty()
  totalCommissionReceived: number;

  @ApiProperty()
  transactionCount: number;

  @ApiProperty({ required: false })
  lastTransactionAt: Date | null;

  // Commission summary fields
  @ApiProperty()
  totalBookings: number;

  @ApiProperty()
  totalBookingAmount: number;

  @ApiProperty()
  averageCommissionPercent: number;

  @ApiProperty()
  netEarnings: number;
}

export class WalletTransactionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  walletId: string;

  @ApiProperty({ enum: WalletTransactionType })
  type: WalletTransactionType;

  @ApiProperty({ enum: WalletTransactionCategory })
  category: WalletTransactionCategory;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  balanceBefore: number;

  @ApiProperty()
  balanceAfter: number;

  @ApiProperty({ required: false })
  bookingId?: string;

  @ApiProperty({ required: false })
  paymentId?: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: WalletTransactionStatus })
  status: WalletTransactionStatus;

  @ApiProperty()
  createdAt: Date;
}

export class WalletTransactionListResponseDto {
  @ApiProperty({ type: [WalletTransactionDto] })
  transactions: WalletTransactionDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  totalPages: number;
}

// === Commission DTOs ===

export class CreateCommissionConfigDto {
  @ApiProperty({ description: 'Business owner commission percentage (0-100)', example: 2 })
  @IsNumber()
  @Min(0)
  businessOwnerCommissionPercent: number;

  @ApiProperty({ description: 'Customer reward percentage (0-100)', example: 1 })
  @IsNumber()
  @Min(0)
  customerRewardPercent: number;

  @ApiProperty({ description: 'Date from which this config is effective', example: '2025-01-01' })
  @IsDateString()
  effectiveFrom: string;

  @ApiProperty({ description: 'Notes about this configuration change', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CommissionConfigResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  businessOwnerCommissionPercent: number;

  @ApiProperty()
  customerRewardPercent: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  effectiveFrom: Date;

  @ApiProperty({ required: false })
  effectiveUntil?: Date;

  @ApiProperty()
  createdByAdminId: string;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class CommissionTransactionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  bookingId: string;

  @ApiProperty()
  businessOwnerId: string;

  @ApiProperty()
  customerId: string;

  @ApiProperty()
  bookingAmount: number;

  @ApiProperty()
  businessOwnerCommissionPercent: number;

  @ApiProperty()
  businessOwnerCommissionAmount: number;

  @ApiProperty()
  customerRewardPercent: number;

  @ApiProperty()
  customerRewardAmount: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  calculatedAt: Date;

  @ApiProperty()
  createdAt: Date;
}

export class CommissionSummaryDto {
  @ApiProperty()
  totalBookings: number;

  @ApiProperty()
  totalBookingAmount: number;

  @ApiProperty()
  totalCommissionPaid: number;

  @ApiProperty()
  averageCommissionPercent: number;

  @ApiProperty()
  netEarnings: number;
}

// === Reward Points DTOs ===

export class RedeemPointsDto {
  @ApiProperty({ description: 'Number of points to redeem (1 point = 1 INR)', example: 100 })
  @IsNumber()
  @Min(1)
  pointsToRedeem: number;
}

export class RewardPointsResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  customerId: string;

  @ApiProperty({ description: 'Current available points' })
  totalPoints: number;

  @ApiProperty({ description: 'Lifetime points earned' })
  totalEarned: number;

  @ApiProperty({ description: 'Lifetime points redeemed' })
  totalRedeemed: number;

  @ApiProperty()
  tier: string;

  @ApiProperty()
  totalBookings: number;

  @ApiProperty({ required: false })
  lastEarnedAt?: Date;

  @ApiProperty({ required: false })
  lastRedeemedAt?: Date;
}

export class TierProgressDto {
  @ApiProperty()
  currentTier: string;

  @ApiProperty()
  totalBookings: number;

  @ApiProperty({ required: false })
  nextTier: string | null;

  @ApiProperty()
  bookingsToNextTier: number;

  @ApiProperty({ description: 'Progress percentage to next tier' })
  progress: number;
}

export class CustomerWalletOverviewDto {
  @ApiProperty({ description: 'Wallet financial statistics' })
  wallet: {
    balance: number;
    totalEarned: number;
    totalSpent: number;
    totalCommissionReceived: number;
    transactionCount: number;
    lastTransactionAt: Date | null;
  };

  @ApiProperty({ description: 'Reward points information' })
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

  @ApiProperty({ description: 'Tier progression details' })
  tierProgress: {
    currentTier: string;
    totalBookings: number;
    nextTier: string | null;
    bookingsToNextTier: number;
    progress: number;
  };
}

// === Settlement DTOs ===

export class MonthlySettlementDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  businessOwnerId: string;

  @ApiProperty({ example: '2025-01' })
  settlementMonth: string;

  @ApiProperty()
  totalBookingAmount: number;

  @ApiProperty()
  totalCommissionAmount: number;

  @ApiProperty({ description: 'Net amount payable (can be negative)' })
  netPayableToBusinessOwner: number;

  @ApiProperty()
  totalCODAmount: number;

  @ApiProperty()
  totalOnlineAmount: number;

  @ApiProperty()
  bookingCount: number;

  @ApiProperty()
  status: string;

  @ApiProperty({ required: false })
  razorpayPayoutId?: string;

  @ApiProperty({ required: false })
  payoutInitiatedAt?: Date;

  @ApiProperty({ required: false })
  payoutCompletedAt?: Date;

  @ApiProperty()
  createdAt: Date;
}

export class SettlementListResponseDto {
  @ApiProperty({ type: [MonthlySettlementDto] })
  settlements: MonthlySettlementDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  totalPages: number;
}

export class MarkPaymentReceivedDto {
  @ApiProperty({ description: 'Admin notes about the payment', required: false })
  @IsString()
  @IsOptional()
  adminNotes?: string;
}

export class SettlementStatsDto {
  @ApiProperty()
  totalSettlements: number;

  @ApiProperty()
  totalBookings: number;

  @ApiProperty()
  totalBookingAmount: number;

  @ApiProperty()
  totalCommission: number;

  @ApiProperty()
  totalPayouts: number;

  @ApiProperty()
  pendingCount: number;

  @ApiProperty()
  completedCount: number;

  @ApiProperty()
  requiresPaymentCount: number;
}

// === API Response Wrappers ===

export class ApiResponseDto<T> {
  @ApiProperty()
  code: number;

  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  data: T;
}

export class WalletApiResponseDto extends ApiResponseDto<WalletResponseDto> {
  @ApiProperty({ type: WalletResponseDto })
  data: WalletResponseDto;
}

export class WalletStatsApiResponseDto extends ApiResponseDto<WalletStatsResponseDto> {
  @ApiProperty({ type: WalletStatsResponseDto })
  data: WalletStatsResponseDto;
}

export class WalletTransactionListApiResponseDto extends ApiResponseDto<WalletTransactionListResponseDto> {
  @ApiProperty({ type: WalletTransactionListResponseDto })
  data: WalletTransactionListResponseDto;
}

export class CommissionConfigApiResponseDto extends ApiResponseDto<CommissionConfigResponseDto> {
  @ApiProperty({ type: CommissionConfigResponseDto })
  data: CommissionConfigResponseDto;
}

export class CommissionSummaryApiResponseDto extends ApiResponseDto<CommissionSummaryDto> {
  @ApiProperty({ type: CommissionSummaryDto })
  data: CommissionSummaryDto;
}

export class RewardPointsApiResponseDto extends ApiResponseDto<RewardPointsResponseDto> {
  @ApiProperty({ type: RewardPointsResponseDto })
  data: RewardPointsResponseDto;
}

export class SettlementApiResponseDto extends ApiResponseDto<MonthlySettlementDto> {
  @ApiProperty({ type: MonthlySettlementDto })
  data: MonthlySettlementDto;
}

export class SettlementListApiResponseDto extends ApiResponseDto<SettlementListResponseDto> {
  @ApiProperty({ type: SettlementListResponseDto })
  data: SettlementListResponseDto;
}

export class CustomerWalletOverviewApiResponseDto extends ApiResponseDto<CustomerWalletOverviewDto> {
  @ApiProperty({ type: CustomerWalletOverviewDto })
  data: CustomerWalletOverviewDto;
}
