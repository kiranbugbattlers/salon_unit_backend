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
exports.AdminCommissionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const enums_1 = require("../../common/enums");
const commission_service_1 = require("../commission.service");
const settlement_service_1 = require("../settlement.service");
const wallet_service_1 = require("../wallet.service");
const wallet_dto_1 = require("../dto/wallet.dto");
let AdminCommissionController = class AdminCommissionController {
    constructor(commissionService, settlementService, walletService) {
        this.commissionService = commissionService;
        this.settlementService = settlementService;
        this.walletService = walletService;
    }
    async createCommissionConfig(req, createDto) {
        const adminId = req.user.sub;
        const effectiveFrom = new Date(createDto.effectiveFrom);
        const config = await this.commissionService.createCommissionConfig(createDto.businessOwnerCommissionPercent, createDto.customerRewardPercent, effectiveFrom, adminId, createDto.notes);
        return {
            code: 201,
            success: true,
            message: 'Commission configuration created successfully',
            data: config,
        };
    }
    async getActiveCommissionConfig() {
        const config = await this.commissionService.getActiveCommissionConfig();
        return {
            code: 200,
            success: true,
            message: 'Active commission configuration retrieved',
            data: config,
        };
    }
    async getCommissionConfigHistory(limit) {
        const history = await this.commissionService.getCommissionConfigHistory(limit || 20);
        return {
            code: 200,
            success: true,
            message: 'Commission configuration history retrieved',
            data: history,
        };
    }
    async getAllSettlements(page, limit, status, month) {
        const result = await this.settlementService.getAllSettlements({
            page: page ? parseInt(String(page)) : 1,
            limit: limit ? parseInt(String(limit)) : 20,
            status: status,
            month,
        });
        return {
            code: 200,
            success: true,
            message: 'Settlements retrieved successfully',
            data: result,
        };
    }
    async getPendingApprovals() {
        const settlements = await this.settlementService.getPendingApprovals();
        return {
            code: 200,
            success: true,
            message: 'Pending payment approvals retrieved',
            data: settlements,
        };
    }
    async getSettlementStats(month) {
        const stats = await this.settlementService.getSettlementStats(month);
        return {
            code: 200,
            success: true,
            message: 'Settlement statistics retrieved',
            data: stats,
        };
    }
    async getSettlementById(id) {
        const settlement = await this.settlementService.getSettlementById(id);
        return {
            code: 200,
            success: true,
            message: 'Settlement details retrieved',
            data: settlement,
        };
    }
    async generateMonthlySettlements(month) {
        const settlements = await this.settlementService.generateAllMonthlySettlements(month);
        return {
            code: 200,
            success: true,
            message: `Generated ${settlements.length} settlements for ${month}`,
            data: {
                month,
                settlementsGenerated: settlements.length,
                settlements,
            },
        };
    }
    async processPayout(id) {
        const settlement = await this.settlementService.processPayout(id);
        return {
            code: 200,
            success: true,
            message: 'Payout processed successfully',
            data: settlement,
        };
    }
    async markPaymentReceived(id, dto) {
        const settlement = await this.settlementService.markPaymentReceived(id, dto.adminNotes);
        return {
            code: 200,
            success: true,
            message: 'Payment marked as received',
            data: settlement,
        };
    }
    async getCommissionTransactions(businessOwnerId, customerId, status, startDate, endDate, page, limit) {
        const result = await this.commissionService.getCommissionTransactions({
            businessOwnerId,
            customerId,
            status: status,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            page: page ? parseInt(String(page)) : 1,
            limit: limit ? parseInt(String(limit)) : 20,
        });
        return {
            code: 200,
            success: true,
            message: 'Commission transactions retrieved',
            data: result,
        };
    }
    async getAllWallets(userType, page, limit) {
        const pageNum = page || 1;
        const limitNum = limit || 10;
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (userType) {
            where.userType = userType;
        }
        const [wallets, total] = await this.walletService.walletRepository.findAndCount({
            where,
            skip,
            take: limitNum,
            order: {
                createdAt: 'DESC',
            },
        });
        return {
            code: 200,
            success: true,
            message: 'Wallets retrieved successfully',
            data: {
                wallets,
                total,
                page: pageNum,
                totalPages: Math.ceil(total / limitNum),
            },
        };
    }
    async adjustWallet(req, walletId, body) {
        const adminId = req.user.sub;
        const transaction = await this.walletService.adminAdjustWallet(walletId, body.amount, body.reason, adminId);
        return {
            code: 200,
            success: true,
            message: 'Wallet adjusted successfully',
            data: transaction,
        };
    }
    async reconcileWallet(walletId) {
        const result = await this.walletService.reconcileWallet(walletId);
        return {
            code: 200,
            success: true,
            message: result.isBalanced
                ? 'Wallet is balanced'
                : `Wallet has discrepancy of ₹${result.difference}`,
            data: result,
        };
    }
    async getCommissionSummaryReport(startDate, endDate) {
        return {
            code: 200,
            success: true,
            message: 'Commission summary report generated',
            data: {
                totalCommissionCollected: 0,
                totalBookings: 0,
                averageCommissionPercent: 0,
            },
        };
    }
    async getWalletSummaryReport() {
        return {
            code: 200,
            success: true,
            message: 'Wallet summary report generated',
            data: {
                totalCustomerWallets: 0,
                totalBusinessOwnerWallets: 0,
                totalCustomerBalance: 0,
                totalBusinessOwnerBalance: 0,
            },
        };
    }
};
exports.AdminCommissionController = AdminCommissionController;
__decorate([
    (0, common_1.Post)('config'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Create/Update commission configuration',
        description: `
      Set commission rates for business owners and reward rates for customers.

      Features:
      - Set business owner commission percentage (0-100%)
      - Set customer reward percentage (0-100%)
      - Specify effective date
      - Previous configs automatically deactivated
      - Full history preserved

      Default: Both percentages are 0% until explicitly set by admin.

      Example:
      - Business owner commission: 2% (company takes 2% from business owner)
      - Customer reward: 1% (customer gets 1% back as reward points)
    `,
    }),
    (0, swagger_1.ApiBody)({ type: wallet_dto_1.CreateCommissionConfigDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Commission configuration created successfully',
        type: wallet_dto_1.CommissionConfigApiResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid commission percentages' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - JWT required' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin role required' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, wallet_dto_1.CreateCommissionConfigDto]),
    __metadata("design:returntype", Promise)
], AdminCommissionController.prototype, "createCommissionConfig", null);
__decorate([
    (0, common_1.Get)('config/active'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get active commission configuration',
        description: 'Retrieve the currently active commission rates.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Active commission configuration retrieved',
        type: wallet_dto_1.CommissionConfigApiResponseDto,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminCommissionController.prototype, "getActiveCommissionConfig", null);
__decorate([
    (0, common_1.Get)('config/history'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get commission configuration history',
        description: 'View all historical commission rate changes with admin audit trail.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, example: 20 }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Commission configuration history retrieved',
    }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminCommissionController.prototype, "getCommissionConfigHistory", null);
__decorate([
    (0, common_1.Get)('settlements'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all settlements',
        description: 'View all monthly settlements across all business owners with filtering.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, example: 20 }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['pending', 'processing', 'completed', 'failed', 'requires_payment', 'payment_received'] }),
    (0, swagger_1.ApiQuery)({ name: 'month', required: false, example: '2025-01' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Settlements retrieved successfully',
        type: wallet_dto_1.SettlementListApiResponseDto,
    }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], AdminCommissionController.prototype, "getAllSettlements", null);
__decorate([
    (0, common_1.Get)('settlements/pending-approvals'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get pending payment approvals',
        description: `
      Get settlements requiring payment from business owners (negative settlements).

      These occur when:
      - Business owner collected COD payments
      - Commission on COD exceeds online payments
      - Business owner owes money to company
    `,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Pending approvals retrieved',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminCommissionController.prototype, "getPendingApprovals", null);
__decorate([
    (0, common_1.Get)('settlements/:month/stats'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get settlement statistics for a month',
        description: 'View aggregated statistics for all settlements in a given month.',
    }),
    (0, swagger_1.ApiParam)({ name: 'month', example: '2025-01' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Settlement statistics retrieved',
    }),
    __param(0, (0, common_1.Param)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminCommissionController.prototype, "getSettlementStats", null);
__decorate([
    (0, common_1.Get)('settlements/:id'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get settlement details',
        description: 'View complete details of a specific settlement including all line items.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Settlement ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Settlement details retrieved',
        type: wallet_dto_1.SettlementApiResponseDto,
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminCommissionController.prototype, "getSettlementById", null);
__decorate([
    (0, common_1.Post)('settlements/generate/:month'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate settlements for a month',
        description: `
      Manually trigger settlement generation for all business owners for a specific month.

      Normally runs automatically via cron on 1st of each month.

      This endpoint allows manual generation for:
      - Regenerating settlements
      - Historical settlement creation
      - Testing purposes
    `,
    }),
    (0, swagger_1.ApiParam)({ name: 'month', example: '2025-01', description: 'Month in YYYY-MM format' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Settlements generated successfully',
    }),
    __param(0, (0, common_1.Param)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminCommissionController.prototype, "generateMonthlySettlements", null);
__decorate([
    (0, common_1.Post)('settlements/:id/process-payout'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Process Razorpay payout for settlement',
        description: `
      Initiate Razorpay payout to business owner's bank account.

      Requirements:
      - Settlement must be in pending status
      - Net payable must be positive (company owes business owner)
      - Business owner must have valid fund account ID

      The payout is processed via Razorpay Payouts API.
    `,
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Settlement ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Payout initiated successfully',
        type: wallet_dto_1.SettlementApiResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Cannot process payout (negative settlement or already completed)',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminCommissionController.prototype, "processPayout", null);
__decorate([
    (0, common_1.Post)('settlements/:id/mark-paid'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Mark business owner payment as received',
        description: `
      Mark a negative settlement as paid when business owner sends payment to company.

      Use this for settlements where:
      - Net payable is negative (business owner owes company)
      - Business owner has transferred the commission amount
      - Admin confirms payment received
    `,
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Settlement ID' }),
    (0, swagger_1.ApiBody)({ type: wallet_dto_1.MarkPaymentReceivedDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Payment marked as received',
        type: wallet_dto_1.SettlementApiResponseDto,
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, wallet_dto_1.MarkPaymentReceivedDto]),
    __metadata("design:returntype", Promise)
], AdminCommissionController.prototype, "markPaymentReceived", null);
__decorate([
    (0, common_1.Get)('transactions'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all commission transactions',
        description: 'View all commission transactions with filtering and pagination.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'businessOwnerId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'customerId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, example: 20 }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Commission transactions retrieved',
    }),
    __param(0, (0, common_1.Query)('businessOwnerId')),
    __param(1, (0, common_1.Query)('customerId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('startDate')),
    __param(4, (0, common_1.Query)('endDate')),
    __param(5, (0, common_1.Query)('page')),
    __param(6, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], AdminCommissionController.prototype, "getCommissionTransactions", null);
__decorate([
    (0, common_1.Get)('wallets'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all wallets',
        description: 'View all customer and business owner wallets with balances.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'userType', required: false, enum: ['customer', 'business_owner'] }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, example: 20 }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Wallets retrieved successfully',
    }),
    __param(0, (0, common_1.Query)('userType')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], AdminCommissionController.prototype, "getAllWallets", null);
__decorate([
    (0, common_1.Post)('wallets/:id/adjust'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Manual wallet adjustment',
        description: `
      Manually adjust wallet balance for corrections, refunds, or special cases.

      Use cases:
      - Refund processing
      - Correction of errors
      - Special promotions
      - Compensation

      All adjustments are logged with admin ID and reason.
    `,
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Wallet ID' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                amount: { type: 'number', example: 100, description: 'Positive = credit, Negative = debit' },
                reason: { type: 'string', example: 'Refund for cancelled booking' },
            },
            required: ['amount', 'reason'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Wallet adjusted successfully',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], AdminCommissionController.prototype, "adjustWallet", null);
__decorate([
    (0, common_1.Get)('wallets/:id/reconcile'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Reconcile wallet balance',
        description: `
      Verify wallet balance matches transaction history.

      Checks:
      - Calculate expected balance from all transactions
      - Compare with actual wallet balance
      - Report any discrepancies

      Used for auditing and detecting data inconsistencies.
    `,
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Wallet ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Wallet reconciliation result',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminCommissionController.prototype, "reconcileWallet", null);
__decorate([
    (0, common_1.Get)('reports/commission-summary'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Commission summary report',
        description: 'Get aggregated commission statistics across all business owners.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Commission summary retrieved',
    }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminCommissionController.prototype, "getCommissionSummaryReport", null);
__decorate([
    (0, common_1.Get)('reports/wallet-summary'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Wallet balances summary',
        description: 'Get total wallet balances across all users.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Wallet summary retrieved',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminCommissionController.prototype, "getWalletSummaryReport", null);
exports.AdminCommissionController = AdminCommissionController = __decorate([
    (0, swagger_1.ApiTags)('Admin - Commission & Wallet Management'),
    (0, common_1.Controller)('admin/commission'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    __metadata("design:paramtypes", [commission_service_1.CommissionService,
        settlement_service_1.SettlementService,
        wallet_service_1.WalletService])
], AdminCommissionController);
//# sourceMappingURL=admin-commission.controller.js.map