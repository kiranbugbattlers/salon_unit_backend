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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerWalletController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const enums_1 = require("../../common/enums");
const wallet_service_1 = require("../wallet.service");
const reward_points_service_1 = require("../reward-points.service");
const entities_1 = require("../../database/entities");
const wallet_dto_1 = require("../dto/wallet.dto");
let CustomerWalletController = class CustomerWalletController {
    constructor(walletService, rewardPointsService) {
        this.walletService = walletService;
        this.rewardPointsService = rewardPointsService;
    }
    async getWalletStats(req) {
        const userId = req.user.userId;
        const customerId = req.user.customerId;
        const overview = await this.rewardPointsService.getCustomerWalletOverview(customerId, userId);
        return {
            code: 200,
            success: true,
            message: 'Wallet overview retrieved successfully',
            data: overview,
        };
    }
    async getTransactions(req, page, limit, category) {
        const userId = req.user.userId;
        const wallet = await this.walletService.getOrCreateWallet(userId, entities_1.WalletUserType.CUSTOMER);
        const result = await this.walletService.getTransactions(wallet.id, {
            page: page ? parseInt(String(page)) : 1,
            limit: limit ? parseInt(String(limit)) : 20,
            category: category,
        });
        return {
            code: 200,
            success: true,
            message: 'Transaction history retrieved',
            data: result,
        };
    }
    async getTierBenefits(tier) {
        if (tier) {
            const benefits = this.rewardPointsService.getTierBenefits(tier);
            return {
                code: 200,
                success: true,
                message: 'Tier benefits retrieved',
                data: benefits,
            };
        }
        const allBenefits = ['bronze', 'silver', 'gold', 'platinum'].map(t => this.rewardPointsService.getTierBenefits(t));
        return {
            code: 200,
            success: true,
            message: 'All tier benefits retrieved',
            data: allBenefits,
        };
    }
    async redeemPoints(req, redeemDto) {
        const customerId = req.user.customerId;
        const result = await this.rewardPointsService.redeemPoints(customerId, redeemDto.pointsToRedeem);
        return {
            code: 200,
            success: true,
            message: `Successfully redeemed ${redeemDto.pointsToRedeem} points to ₹${redeemDto.pointsToRedeem}`,
            data: {
                pointsRedeemed: redeemDto.pointsToRedeem,
                remainingPoints: result.rewardPoints.totalPoints,
                newWalletBalance: result.walletBalance,
            },
        };
    }
};
exports.CustomerWalletController = CustomerWalletController;
__decorate([
    (0, common_1.Get)('stats'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.CUSTOMER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get comprehensive wallet statistics',
        description: `
      Get complete wallet and rewards overview in a single request.

      **This endpoint consolidates three separate calls into one:**
      - Wallet statistics (balance, earnings, spending)
      - Reward points (available, earned, redeemed, tier)
      - Tier progress (current tier, next tier, progress percentage)

      **Benefits:**
      - Reduced network overhead (1 call instead of 3)
      - Better performance
      - Easier frontend integration

      **Response includes:**
      1. **Wallet:** Balance, total earned, total spent, commission received, transaction count
      2. **Reward Points:** Points balance, tier status, bookings count, expiry info
      3. **Tier Progress:** Current tier, next tier, bookings needed, progress %

      **Use this endpoint for:**
      - Dashboard overview screens
      - Wallet summary pages
      - Quick stats display
    `,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Wallet overview retrieved successfully',
        type: wallet_dto_1.CustomerWalletOverviewApiResponseDto,
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomerWalletController.prototype, "getWalletStats", null);
__decorate([
    (0, common_1.Get)('transactions'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.CUSTOMER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get wallet transaction history',
        description: `
      View complete wallet transaction history including all money movements and reward points.

      **This endpoint consolidates all transaction types:**
      - Reward points earned from bookings
      - Reward points redeemed to wallet balance
      - Commission/rewards received
      - Refunds and adjustments
      - Payments and withdrawals

      **Each transaction shows:**
      - Type (credit/debit)
      - Category (reward_points, commission, refund, etc.)
      - Amount
      - Balance before/after
      - Description
      - Related booking/payment IDs
      - Timestamp

      **Filter by category:**
      - \`?category=reward_points\` - Points earned and redeemed (replaces /reward-points/history)
      - \`?category=commission\` - Commission/reward earnings
      - \`?category=refund\` - Refunds only
      - \`?category=adjustment\` - Manual adjustments

      **Examples:**
      - All transactions: \`GET /transactions\`
      - Reward points history: \`GET /transactions?category=reward_points\`
      - Recent refunds: \`GET /transactions?category=refund&page=1&limit=10\`
    `,
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, example: 1, description: 'Page number for pagination' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, example: 20, description: 'Items per page (max 100)' }),
    (0, swagger_1.ApiQuery)({
        name: 'category',
        required: false,
        enum: ['reward_points', 'commission', 'refund', 'adjustment', 'booking_payment', 'withdrawal'],
        description: 'Filter by transaction category. Use "reward_points" for points earned/redeemed history.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Transaction history retrieved successfully',
        type: wallet_dto_1.WalletTransactionListApiResponseDto,
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String]),
    __metadata("design:returntype", Promise)
], CustomerWalletController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Get)('reward-points/tier-benefits'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.CUSTOMER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get tier benefits',
        description: 'View benefits for all tiers to see what you can unlock.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'tier', required: false, enum: ['bronze', 'silver', 'gold', 'platinum'] }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Tier benefits retrieved',
    }),
    __param(0, (0, common_1.Query)('tier')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerWalletController.prototype, "getTierBenefits", null);
__decorate([
    (0, common_1.Post)('reward-points/redeem'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.CUSTOMER),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Redeem reward points',
        description: `
      Convert reward points to wallet balance.

      Conversion: 1 point = 1 INR

      Example:
      - You have 500 points
      - Redeem 100 points
      - Points: 500 → 400
      - Wallet balance: +₹100

      Redeemed amount can be used for bookings or withdrawn.
    `,
    }),
    (0, swagger_1.ApiBody)({ type: wallet_dto_1.RedeemPointsDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Points redeemed successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Insufficient points',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, wallet_dto_1.RedeemPointsDto]),
    __metadata("design:returntype", Promise)
], CustomerWalletController.prototype, "redeemPoints", null);
exports.CustomerWalletController = CustomerWalletController = __decorate([
    (0, swagger_1.ApiTags)('Customer - Wallet & Rewards'),
    (0, common_1.Controller)('customer/wallet'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    __metadata("design:paramtypes", [wallet_service_1.WalletService,
        reward_points_service_1.RewardPointsService])
], CustomerWalletController);
//# sourceMappingURL=customer-wallet.controller.js.map