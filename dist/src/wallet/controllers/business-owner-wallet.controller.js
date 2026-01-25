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
exports.BusinessOwnerWalletController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const enums_1 = require("../../common/enums");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const wallet_service_1 = require("../wallet.service");
const commission_service_1 = require("../commission.service");
const settlement_service_1 = require("../settlement.service");
const commission_payment_service_1 = require("../commission-payment.service");
const daily_settlement_service_1 = require("../daily-settlement.service");
const entities_1 = require("../../database/entities");
const vendor_due_payment_entity_1 = require("../../database/entities/vendor-due-payment.entity");
const wallet_dto_1 = require("../dto/wallet.dto");
const commission_payment_dto_1 = require("../dto/commission-payment.dto");
let BusinessOwnerWalletController = class BusinessOwnerWalletController {
    constructor(walletService, commissionService, settlementService, commissionPaymentService, dailySettlementService, vendorDuePaymentRepository) {
        this.walletService = walletService;
        this.commissionService = commissionService;
        this.settlementService = settlementService;
        this.commissionPaymentService = commissionPaymentService;
        this.dailySettlementService = dailySettlementService;
        this.vendorDuePaymentRepository = vendorDuePaymentRepository;
    }
    async getWalletStats(req) {
        const userId = req.user.userId;
        const businessOwnerId = req.user.businessOwnerId;
        const wallet = await this.walletService.getOrCreateWallet(userId, entities_1.WalletUserType.BUSINESS_OWNER);
        const stats = await this.walletService.getWalletStats(wallet.id);
        const commissionSummary = await this.commissionService.getBusinessOwnerCommissionSummary(businessOwnerId);
        return {
            code: 200,
            success: true,
            message: 'Wallet statistics retrieved',
            data: {
                ...stats,
                totalBookings: commissionSummary.totalBookings,
                totalBookingAmount: commissionSummary.totalBookingAmount,
                averageCommissionPercent: commissionSummary.averageCommissionPercent,
                netEarnings: commissionSummary.netEarnings,
                codAmount: commissionSummary.codAmount,
                onlineAmount: commissionSummary.onlineAmount,
                gstAmount: commissionSummary.gstAmount,
                totalDeduction: commissionSummary.totalDeduction,
            },
        };
    }
    async getDailyStats(req, date, startDate, endDate) {
        const businessOwnerId = req.user.businessOwnerId;
        const result = await this.dailySettlementService.getSettlementDetails({
            businessOwnerId,
            date,
            startDate,
            endDate,
        });
        return {
            code: 200,
            success: true,
            message: 'Daily settlement statistics retrieved',
            data: result,
        };
    }
    async getDailyHistory(req, page, limit, startDate, endDate) {
        const businessOwnerId = req.user.businessOwnerId;
        const result = await this.dailySettlementService.getAllHistory({
            page: page || 1,
            limit: limit || 10,
            startDate,
            endDate,
            businessOwnerId,
        });
        return {
            code: 200,
            success: true,
            message: 'Daily settlement history retrieved',
            data: result,
        };
    }
    async getDuePayments(req, page, limit, status) {
        const businessOwnerId = req.user.businessOwnerId;
        const pageNum = page ? parseInt(String(page)) : 1;
        const pageSize = limit ? parseInt(String(limit)) : 20;
        const skip = (pageNum - 1) * pageSize;
        const where = { businessOwnerId };
        if (status && Object.values(vendor_due_payment_entity_1.DuePaymentStatus).includes(status)) {
            where.status = status;
        }
        const [duePayments, total] = await this.vendorDuePaymentRepository.findAndCount({
            where,
            order: { dueDate: 'DESC', createdAt: 'DESC' },
            skip,
            take: pageSize,
        });
        const sanitized = duePayments.map((p) => ({
            id: p.id,
            dueAmount: Number(p.dueAmount),
            paidAmount: Number(p.paidAmount),
            remainingAmount: Number(p.remainingAmount),
            status: p.status,
            dueDate: p.dueDate,
            description: p.description,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
        }));
        return {
            code: 200,
            success: true,
            message: 'Due payments retrieved',
            data: {
                duePayments: sanitized,
                pagination: { page: pageNum, limit: pageSize, total, totalPages: Math.ceil(total / pageSize) },
            },
        };
    }
    async getDuePaymentDetails(req, id) {
        const businessOwnerId = req.user.businessOwnerId;
        const payment = await this.vendorDuePaymentRepository.findOne({
            where: { id },
        });
        if (!payment || payment.businessOwnerId !== businessOwnerId) {
            return {
                code: 404,
                success: false,
                message: 'Due payment not found',
            };
        }
        const data = {
            id: payment.id,
            businessOwnerId: payment.businessOwnerId,
            dueAmount: Number(payment.dueAmount),
            paidAmount: Number(payment.paidAmount),
            remainingAmount: Number(payment.remainingAmount),
            status: payment.status,
            dueDate: payment.dueDate,
            description: payment.description,
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt,
        };
        return {
            code: 200,
            success: true,
            message: 'Due payment details retrieved',
            data,
        };
    }
    async getTransactions(req, page, limit, category, type) {
        const userId = req.user.userId;
        const wallet = await this.walletService.getOrCreateWallet(userId, entities_1.WalletUserType.BUSINESS_OWNER);
        const result = await this.walletService.getTransactions(wallet.id, {
            page: page ? parseInt(String(page)) : 1,
            limit: limit ? parseInt(String(limit)) : 20,
            category: category,
            type: type,
        });
        return {
            code: 200,
            success: true,
            message: 'Transaction history retrieved',
            data: result,
        };
    }
    async getSettlements(req, page, limit, status) {
        const businessOwnerId = req.user.businessOwnerId;
        const result = await this.settlementService.getBusinessOwnerSettlements(businessOwnerId, {
            page: page ? parseInt(String(page)) : 1,
            limit: limit ? parseInt(String(limit)) : 12,
            status: status,
        });
        return {
            code: 200,
            success: true,
            message: 'Settlements retrieved',
            data: result,
        };
    }
    async getSettlementDetails(req, id) {
        const businessOwnerId = req.user.businessOwnerId;
        const settlement = await this.settlementService.getSettlementById(id);
        if (settlement.businessOwnerId !== businessOwnerId) {
            throw new Error('You can only view your own settlements');
        }
        return {
            code: 200,
            success: true,
            message: 'Settlement details retrieved',
            data: settlement,
        };
    }
    async getEarningsReport(req, year, month) {
        const businessOwnerId = req.user.businessOwnerId;
        const now = new Date();
        const targetYear = year || now.getFullYear();
        const targetMonth = month || now.getMonth() + 1;
        const startDate = new Date(targetYear, targetMonth - 1, 1);
        const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);
        const commissionSummary = await this.commissionService.getBusinessOwnerCommissionSummary(businessOwnerId, startDate, endDate);
        const settlementMonth = `${targetYear}-${String(targetMonth).padStart(2, '0')}`;
        const settlements = await this.settlementService.getBusinessOwnerSettlements(businessOwnerId, {
            page: 1,
            limit: 1,
        });
        const monthSettlement = settlements.settlements.find(s => s.settlementMonth === settlementMonth);
        const codAmount = commissionSummary.codAmount || monthSettlement?.totalCODAmount || 0;
        const onlineAmount = commissionSummary.onlineAmount || monthSettlement?.totalOnlineAmount || 0;
        return {
            code: 200,
            success: true,
            message: 'Earnings report generated',
            data: {
                period: settlementMonth,
                summary: commissionSummary,
                settlement: monthSettlement || null,
                breakdown: {
                    totalBookings: commissionSummary.totalBookings,
                    grossRevenue: commissionSummary.totalBookingAmount,
                    commissionPaid: commissionSummary.totalCommissionPaid,
                    netEarnings: commissionSummary.netEarnings,
                    codAmount,
                    onlineAmount,
                },
            },
        };
    }
    async createCommissionPayment(req, createPaymentDto) {
        const businessOwnerId = req.user.businessOwnerId;
        const paymentOrder = await this.commissionPaymentService.createCommissionPaymentOrder(businessOwnerId, createPaymentDto.amount, createPaymentDto.notes);
        return {
            code: 200,
            success: true,
            message: 'Payment order created successfully',
            data: paymentOrder,
        };
    }
    async verifyCommissionPayment(req, verifyDto) {
        const businessOwnerId = req.user.businessOwnerId;
        const result = await this.commissionPaymentService.verifyAndProcessPayment(businessOwnerId, verifyDto.razorpayOrderId, verifyDto.razorpayPaymentId, verifyDto.razorpaySignature);
        return {
            code: 200,
            success: true,
            message: result.defaulterStatusRemoved
                ? 'Payment successful! Your commission debt is cleared and defaulter status removed.'
                : 'Payment successful! Your wallet balance has been updated.',
            data: result,
        };
    }
    async getPaymentHistory(req, page, limit) {
        const businessOwnerId = req.user.businessOwnerId;
        const result = await this.commissionPaymentService.getPaymentHistory(businessOwnerId, {
            page: page ? parseInt(String(page)) : 1,
            limit: limit ? parseInt(String(limit)) : 20,
        });
        return {
            code: 200,
            success: true,
            message: 'Payment history retrieved',
            data: result,
        };
    }
    async getPaymentDetails(req, id) {
        const businessOwnerId = req.user.businessOwnerId;
        const payment = await this.commissionPaymentService.getPaymentById(id, businessOwnerId);
        return {
            code: 200,
            success: true,
            message: 'Payment details retrieved',
            data: payment,
        };
    }
};
exports.BusinessOwnerWalletController = BusinessOwnerWalletController;
__decorate([
    (0, common_1.Get)('stats'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.BUSINESS_OWNER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get wallet statistics and commission summary',
        description: `
      Get consolidated wallet statistics and commission summary.

      Shows:
      - Current balance (can be negative for COD commissions)
      - Total earned (lifetime)
      - Total spent (lifetime)
      - Total commission paid to company
      - Total commission received
      - Transaction count
      - Last transaction timestamp
      - Total bookings
      - Total booking amount
      - Average commission percentage
      - Net earnings (bookings - commission)
    `,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Wallet statistics retrieved',
        type: wallet_dto_1.WalletStatsApiResponseDto,
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BusinessOwnerWalletController.prototype, "getWalletStats", null);
__decorate([
    (0, common_1.Get)('daily-stats'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.BUSINESS_OWNER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get daily settlement stats for the business',
        description: 'Get total amount, cash, online, platform fee, GST and settlement amount for a specific date or date range',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('date')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], BusinessOwnerWalletController.prototype, "getDailyStats", null);
__decorate([
    (0, common_1.Get)('daily-history'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.BUSINESS_OWNER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get daily settlement history for the business',
        description: 'Get historical daily settlement records with amounts and payment status',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('startDate')),
    __param(4, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], BusinessOwnerWalletController.prototype, "getDailyHistory", null);
__decorate([
    (0, common_1.Get)('due-payments'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.BUSINESS_OWNER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get due payments',
        description: 'View your commission due payments created by admin, with status and remaining amounts.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, example: 20 }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['pending', 'overdue', 'paid', 'partially_paid'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Due payments retrieved' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String]),
    __metadata("design:returntype", Promise)
], BusinessOwnerWalletController.prototype, "getDuePayments", null);
__decorate([
    (0, common_1.Get)('due-payments/:id'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.BUSINESS_OWNER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get due payment details',
        description: 'View details of a specific due payment. Only accessible for your own records.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Due payment ID (UUID)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Due payment details retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Due payment not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BusinessOwnerWalletController.prototype, "getDuePaymentDetails", null);
__decorate([
    (0, common_1.Get)('transactions'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.BUSINESS_OWNER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get wallet transaction history',
        description: `
      View all wallet transactions (credits and debits).

      Includes:
      - Commission deductions
      - Settlement transactions
      - Manual adjustments
      - Refunds

      Transactions show before/after balance for audit trail.
    `,
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, example: 20 }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false, enum: ['commission', 'settlement', 'refund', 'adjustment'] }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, enum: ['credit', 'debit'] }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Transaction history retrieved',
        type: wallet_dto_1.WalletTransactionListApiResponseDto,
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('category')),
    __param(4, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], BusinessOwnerWalletController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Get)('settlements'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.BUSINESS_OWNER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get monthly settlements',
        description: `
      View your monthly settlement history.

      Each settlement shows:
      - Total bookings for the month
      - Total booking amount
      - Commission charged
      - COD vs Online breakdown
      - Net amount payable
      - Payout status

      Positive net amount: Company pays you
      Negative net amount: You owe commission to company
    `,
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, example: 12, description: '12 months per page' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['pending', 'processing', 'completed', 'failed', 'requires_payment'] }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Settlements retrieved',
        type: wallet_dto_1.SettlementListApiResponseDto,
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String]),
    __metadata("design:returntype", Promise)
], BusinessOwnerWalletController.prototype, "getSettlements", null);
__decorate([
    (0, common_1.Get)('settlements/:id'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.BUSINESS_OWNER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get settlement details',
        description: `
      View complete details of a specific settlement.

      Includes:
      - Summary (bookings, amounts, commission)
      - Line-by-line breakdown of all bookings
      - Payment status
      - Payout information
    `,
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Settlement ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Settlement details retrieved',
        type: wallet_dto_1.SettlementApiResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Can only view own settlements' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BusinessOwnerWalletController.prototype, "getSettlementDetails", null);
__decorate([
    (0, common_1.Get)('earnings-report'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.BUSINESS_OWNER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get earnings report',
        description: `
      Comprehensive earnings report with breakdowns.

      Shows:
      - Total bookings
      - Gross revenue
      - Commission paid
      - Net earnings
      - COD vs Online split
      - Month-over-month comparison

      Use for accounting and tax purposes.
    `,
    }),
    (0, swagger_1.ApiQuery)({ name: 'year', required: false, example: 2025 }),
    (0, swagger_1.ApiQuery)({ name: 'month', required: false, example: 1, description: '1-12' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Earnings report generated',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], BusinessOwnerWalletController.prototype, "getEarningsReport", null);
__decorate([
    (0, common_1.Post)('pay-commission'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.BUSINESS_OWNER),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Create commission payment order',
        description: `
      Pay your commission debt online via Razorpay.

      Use this when:
      - Your wallet has negative balance
      - You're marked as defaulter
      - You need to clear commission dues

      Process:
      1. Call this endpoint with amount
      2. Get Razorpay order details
      3. Show Razorpay payment page to user
      4. After payment, call verify endpoint

      The payment will:
      - Credit your wallet balance
      - Remove defaulter status (if balance becomes positive)
      - Record transaction history
    `,
    }),
    (0, swagger_1.ApiBody)({ type: commission_payment_dto_1.CreateCommissionPaymentDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Payment order created successfully',
        type: commission_payment_dto_1.CommissionPaymentResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid amount or no debt to pay',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, commission_payment_dto_1.CreateCommissionPaymentDto]),
    __metadata("design:returntype", Promise)
], BusinessOwnerWalletController.prototype, "createCommissionPayment", null);
__decorate([
    (0, common_1.Post)('pay-commission/verify'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.BUSINESS_OWNER),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Verify commission payment',
        description: `
      Verify payment after Razorpay payment is completed.

      Call this endpoint after customer completes payment on Razorpay.

      This will:
      - Verify payment signature
      - Update wallet balance
      - Remove defaulter status if applicable
      - Record transaction

      Required: razorpayOrderId, razorpayPaymentId, razorpaySignature
      (These are returned by Razorpay after successful payment)
    `,
    }),
    (0, swagger_1.ApiBody)({ type: commission_payment_dto_1.VerifyCommissionPaymentDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Payment verified and wallet updated',
        type: commission_payment_dto_1.CommissionPaymentVerificationResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Payment verification failed',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, commission_payment_dto_1.VerifyCommissionPaymentDto]),
    __metadata("design:returntype", Promise)
], BusinessOwnerWalletController.prototype, "verifyCommissionPayment", null);
__decorate([
    (0, common_1.Get)('payment-history'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.BUSINESS_OWNER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get commission payment history',
        description: `
      View history of all commission payments made.

      Shows:
      - Payment amount
      - Payment status (pending/completed/failed)
      - Razorpay transaction details
      - Balance before/after
      - Payment date
    `,
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, example: 20 }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Payment history retrieved',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], BusinessOwnerWalletController.prototype, "getPaymentHistory", null);
__decorate([
    (0, common_1.Get)('payment-history/:id'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.BUSINESS_OWNER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get payment details by ID',
        description: 'View complete details of a specific commission payment.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Payment ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Payment details retrieved',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Payment not found',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BusinessOwnerWalletController.prototype, "getPaymentDetails", null);
exports.BusinessOwnerWalletController = BusinessOwnerWalletController = __decorate([
    (0, swagger_1.ApiTags)('Business Owner - Wallet & Earnings'),
    (0, common_1.Controller)('business-owner/wallet'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    __param(5, (0, typeorm_1.InjectRepository)(entities_1.VendorDuePayment)),
    __metadata("design:paramtypes", [wallet_service_1.WalletService,
        commission_service_1.CommissionService,
        settlement_service_1.SettlementService,
        commission_payment_service_1.CommissionPaymentService,
        daily_settlement_service_1.DailySettlementService,
        typeorm_2.Repository])
], BusinessOwnerWalletController);
//# sourceMappingURL=business-owner-wallet.controller.js.map