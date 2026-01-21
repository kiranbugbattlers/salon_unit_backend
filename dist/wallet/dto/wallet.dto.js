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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerWalletOverviewApiResponseDto = exports.SettlementListApiResponseDto = exports.SettlementApiResponseDto = exports.RewardPointsApiResponseDto = exports.CommissionSummaryApiResponseDto = exports.CommissionConfigApiResponseDto = exports.WalletTransactionListApiResponseDto = exports.WalletStatsApiResponseDto = exports.WalletApiResponseDto = exports.ApiResponseDto = exports.SettlementStatsDto = exports.MarkPaymentReceivedDto = exports.SettlementListResponseDto = exports.MonthlySettlementDto = exports.CustomerWalletOverviewDto = exports.TierProgressDto = exports.RewardPointsResponseDto = exports.RedeemPointsDto = exports.CommissionSummaryDto = exports.CommissionTransactionDto = exports.CommissionConfigResponseDto = exports.CreateCommissionConfigDto = exports.WalletTransactionListResponseDto = exports.WalletTransactionDto = exports.WalletStatsResponseDto = exports.WalletResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const entities_1 = require("../../database/entities");
class WalletResponseDto {
}
exports.WalletResponseDto = WalletResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], WalletResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], WalletResponseDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: entities_1.WalletUserType }),
    __metadata("design:type", String)
], WalletResponseDto.prototype, "userType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current balance in INR' }),
    __metadata("design:type", Number)
], WalletResponseDto.prototype, "balance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total earned (lifetime credits)' }),
    __metadata("design:type", Number)
], WalletResponseDto.prototype, "totalEarned", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total spent (lifetime debits)' }),
    __metadata("design:type", Number)
], WalletResponseDto.prototype, "totalSpent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total commission paid' }),
    __metadata("design:type", Number)
], WalletResponseDto.prototype, "totalCommissionPaid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total commission/rewards received' }),
    __metadata("design:type", Number)
], WalletResponseDto.prototype, "totalCommissionReceived", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], WalletResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Date)
], WalletResponseDto.prototype, "lastTransactionAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], WalletResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], WalletResponseDto.prototype, "updatedAt", void 0);
class WalletStatsResponseDto {
}
exports.WalletStatsResponseDto = WalletStatsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], WalletStatsResponseDto.prototype, "balance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], WalletStatsResponseDto.prototype, "totalEarned", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], WalletStatsResponseDto.prototype, "totalSpent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], WalletStatsResponseDto.prototype, "totalCommissionPaid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], WalletStatsResponseDto.prototype, "totalCommissionReceived", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], WalletStatsResponseDto.prototype, "transactionCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Date)
], WalletStatsResponseDto.prototype, "lastTransactionAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], WalletStatsResponseDto.prototype, "totalBookings", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], WalletStatsResponseDto.prototype, "totalBookingAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], WalletStatsResponseDto.prototype, "averageCommissionPercent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], WalletStatsResponseDto.prototype, "netEarnings", void 0);
class WalletTransactionDto {
}
exports.WalletTransactionDto = WalletTransactionDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], WalletTransactionDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], WalletTransactionDto.prototype, "walletId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: entities_1.WalletTransactionType }),
    __metadata("design:type", String)
], WalletTransactionDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: entities_1.WalletTransactionCategory }),
    __metadata("design:type", String)
], WalletTransactionDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], WalletTransactionDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], WalletTransactionDto.prototype, "balanceBefore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], WalletTransactionDto.prototype, "balanceAfter", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], WalletTransactionDto.prototype, "bookingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], WalletTransactionDto.prototype, "paymentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], WalletTransactionDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: entities_1.WalletTransactionStatus }),
    __metadata("design:type", String)
], WalletTransactionDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], WalletTransactionDto.prototype, "createdAt", void 0);
class WalletTransactionListResponseDto {
}
exports.WalletTransactionListResponseDto = WalletTransactionListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [WalletTransactionDto] }),
    __metadata("design:type", Array)
], WalletTransactionListResponseDto.prototype, "transactions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], WalletTransactionListResponseDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], WalletTransactionListResponseDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], WalletTransactionListResponseDto.prototype, "totalPages", void 0);
class CreateCommissionConfigDto {
}
exports.CreateCommissionConfigDto = CreateCommissionConfigDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business owner commission percentage (0-100)', example: 2 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateCommissionConfigDto.prototype, "businessOwnerCommissionPercent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer reward percentage (0-100)', example: 1 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateCommissionConfigDto.prototype, "customerRewardPercent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date from which this config is effective', example: '2025-01-01' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateCommissionConfigDto.prototype, "effectiveFrom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notes about this configuration change', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCommissionConfigDto.prototype, "notes", void 0);
class CommissionConfigResponseDto {
}
exports.CommissionConfigResponseDto = CommissionConfigResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CommissionConfigResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CommissionConfigResponseDto.prototype, "businessOwnerCommissionPercent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CommissionConfigResponseDto.prototype, "customerRewardPercent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], CommissionConfigResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], CommissionConfigResponseDto.prototype, "effectiveFrom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Date)
], CommissionConfigResponseDto.prototype, "effectiveUntil", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CommissionConfigResponseDto.prototype, "createdByAdminId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], CommissionConfigResponseDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], CommissionConfigResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], CommissionConfigResponseDto.prototype, "updatedAt", void 0);
class CommissionTransactionDto {
}
exports.CommissionTransactionDto = CommissionTransactionDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CommissionTransactionDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CommissionTransactionDto.prototype, "bookingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CommissionTransactionDto.prototype, "businessOwnerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CommissionTransactionDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CommissionTransactionDto.prototype, "bookingAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CommissionTransactionDto.prototype, "businessOwnerCommissionPercent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CommissionTransactionDto.prototype, "businessOwnerCommissionAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CommissionTransactionDto.prototype, "customerRewardPercent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CommissionTransactionDto.prototype, "customerRewardAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CommissionTransactionDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], CommissionTransactionDto.prototype, "calculatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], CommissionTransactionDto.prototype, "createdAt", void 0);
class CommissionSummaryDto {
}
exports.CommissionSummaryDto = CommissionSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CommissionSummaryDto.prototype, "totalBookings", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CommissionSummaryDto.prototype, "totalBookingAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CommissionSummaryDto.prototype, "totalCommissionPaid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CommissionSummaryDto.prototype, "averageCommissionPercent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CommissionSummaryDto.prototype, "netEarnings", void 0);
class RedeemPointsDto {
}
exports.RedeemPointsDto = RedeemPointsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of points to redeem (1 point = 1 INR)', example: 100 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], RedeemPointsDto.prototype, "pointsToRedeem", void 0);
class RewardPointsResponseDto {
}
exports.RewardPointsResponseDto = RewardPointsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RewardPointsResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RewardPointsResponseDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current available points' }),
    __metadata("design:type", Number)
], RewardPointsResponseDto.prototype, "totalPoints", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lifetime points earned' }),
    __metadata("design:type", Number)
], RewardPointsResponseDto.prototype, "totalEarned", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lifetime points redeemed' }),
    __metadata("design:type", Number)
], RewardPointsResponseDto.prototype, "totalRedeemed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], RewardPointsResponseDto.prototype, "tier", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], RewardPointsResponseDto.prototype, "totalBookings", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Date)
], RewardPointsResponseDto.prototype, "lastEarnedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Date)
], RewardPointsResponseDto.prototype, "lastRedeemedAt", void 0);
class TierProgressDto {
}
exports.TierProgressDto = TierProgressDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], TierProgressDto.prototype, "currentTier", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], TierProgressDto.prototype, "totalBookings", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], TierProgressDto.prototype, "nextTier", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], TierProgressDto.prototype, "bookingsToNextTier", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Progress percentage to next tier' }),
    __metadata("design:type", Number)
], TierProgressDto.prototype, "progress", void 0);
class CustomerWalletOverviewDto {
}
exports.CustomerWalletOverviewDto = CustomerWalletOverviewDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Wallet financial statistics' }),
    __metadata("design:type", Object)
], CustomerWalletOverviewDto.prototype, "wallet", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reward points information' }),
    __metadata("design:type", Object)
], CustomerWalletOverviewDto.prototype, "rewardPoints", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tier progression details' }),
    __metadata("design:type", Object)
], CustomerWalletOverviewDto.prototype, "tierProgress", void 0);
class MonthlySettlementDto {
}
exports.MonthlySettlementDto = MonthlySettlementDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MonthlySettlementDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MonthlySettlementDto.prototype, "businessOwnerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-01' }),
    __metadata("design:type", String)
], MonthlySettlementDto.prototype, "settlementMonth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], MonthlySettlementDto.prototype, "totalBookingAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], MonthlySettlementDto.prototype, "totalCommissionAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Net amount payable (can be negative)' }),
    __metadata("design:type", Number)
], MonthlySettlementDto.prototype, "netPayableToBusinessOwner", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], MonthlySettlementDto.prototype, "totalCODAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], MonthlySettlementDto.prototype, "totalOnlineAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], MonthlySettlementDto.prototype, "bookingCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MonthlySettlementDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], MonthlySettlementDto.prototype, "razorpayPayoutId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Date)
], MonthlySettlementDto.prototype, "payoutInitiatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Date)
], MonthlySettlementDto.prototype, "payoutCompletedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], MonthlySettlementDto.prototype, "createdAt", void 0);
class SettlementListResponseDto {
}
exports.SettlementListResponseDto = SettlementListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [MonthlySettlementDto] }),
    __metadata("design:type", Array)
], SettlementListResponseDto.prototype, "settlements", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SettlementListResponseDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SettlementListResponseDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SettlementListResponseDto.prototype, "totalPages", void 0);
class MarkPaymentReceivedDto {
}
exports.MarkPaymentReceivedDto = MarkPaymentReceivedDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Admin notes about the payment', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MarkPaymentReceivedDto.prototype, "adminNotes", void 0);
class SettlementStatsDto {
}
exports.SettlementStatsDto = SettlementStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SettlementStatsDto.prototype, "totalSettlements", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SettlementStatsDto.prototype, "totalBookings", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SettlementStatsDto.prototype, "totalBookingAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SettlementStatsDto.prototype, "totalCommission", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SettlementStatsDto.prototype, "totalPayouts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SettlementStatsDto.prototype, "pendingCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SettlementStatsDto.prototype, "completedCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SettlementStatsDto.prototype, "requiresPaymentCount", void 0);
class ApiResponseDto {
}
exports.ApiResponseDto = ApiResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ApiResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], ApiResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ApiResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], ApiResponseDto.prototype, "data", void 0);
class WalletApiResponseDto extends ApiResponseDto {
}
exports.WalletApiResponseDto = WalletApiResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: WalletResponseDto }),
    __metadata("design:type", WalletResponseDto)
], WalletApiResponseDto.prototype, "data", void 0);
class WalletStatsApiResponseDto extends ApiResponseDto {
}
exports.WalletStatsApiResponseDto = WalletStatsApiResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: WalletStatsResponseDto }),
    __metadata("design:type", WalletStatsResponseDto)
], WalletStatsApiResponseDto.prototype, "data", void 0);
class WalletTransactionListApiResponseDto extends ApiResponseDto {
}
exports.WalletTransactionListApiResponseDto = WalletTransactionListApiResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: WalletTransactionListResponseDto }),
    __metadata("design:type", WalletTransactionListResponseDto)
], WalletTransactionListApiResponseDto.prototype, "data", void 0);
class CommissionConfigApiResponseDto extends ApiResponseDto {
}
exports.CommissionConfigApiResponseDto = CommissionConfigApiResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: CommissionConfigResponseDto }),
    __metadata("design:type", CommissionConfigResponseDto)
], CommissionConfigApiResponseDto.prototype, "data", void 0);
class CommissionSummaryApiResponseDto extends ApiResponseDto {
}
exports.CommissionSummaryApiResponseDto = CommissionSummaryApiResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: CommissionSummaryDto }),
    __metadata("design:type", CommissionSummaryDto)
], CommissionSummaryApiResponseDto.prototype, "data", void 0);
class RewardPointsApiResponseDto extends ApiResponseDto {
}
exports.RewardPointsApiResponseDto = RewardPointsApiResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: RewardPointsResponseDto }),
    __metadata("design:type", RewardPointsResponseDto)
], RewardPointsApiResponseDto.prototype, "data", void 0);
class SettlementApiResponseDto extends ApiResponseDto {
}
exports.SettlementApiResponseDto = SettlementApiResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: MonthlySettlementDto }),
    __metadata("design:type", MonthlySettlementDto)
], SettlementApiResponseDto.prototype, "data", void 0);
class SettlementListApiResponseDto extends ApiResponseDto {
}
exports.SettlementListApiResponseDto = SettlementListApiResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: SettlementListResponseDto }),
    __metadata("design:type", SettlementListResponseDto)
], SettlementListApiResponseDto.prototype, "data", void 0);
class CustomerWalletOverviewApiResponseDto extends ApiResponseDto {
}
exports.CustomerWalletOverviewApiResponseDto = CustomerWalletOverviewApiResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: CustomerWalletOverviewDto }),
    __metadata("design:type", CustomerWalletOverviewDto)
], CustomerWalletOverviewApiResponseDto.prototype, "data", void 0);
//# sourceMappingURL=wallet.dto.js.map