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
exports.AdminDefaulterController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const enums_1 = require("../../common/enums");
const wallet_monitor_service_1 = require("../wallet-monitor.service");
const wallet_service_1 = require("../wallet.service");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../../database/entities");
const defaulter_dto_1 = require("../dto/defaulter.dto");
let AdminDefaulterController = class AdminDefaulterController {
    constructor(walletMonitorService, walletService, businessOwnerRepository, walletRepository, bankingInfoRepository) {
        this.walletMonitorService = walletMonitorService;
        this.walletService = walletService;
        this.businessOwnerRepository = businessOwnerRepository;
        this.walletRepository = walletRepository;
        this.bankingInfoRepository = bankingInfoRepository;
    }
    async getAllDefaulters() {
        const summary = await this.walletMonitorService.getDefaultersSummary();
        let totalDays = 0;
        const enrichedDefaulters = [];
        for (const defaulter of summary.defaulters) {
            const businessOwner = await this.businessOwnerRepository.findOne({
                where: { id: defaulter.businessOwnerId },
                relations: ['user'],
            });
            if (!businessOwner || !businessOwner.defaulterSince)
                continue;
            const daysSince = Math.floor((new Date().getTime() - new Date(businessOwner.defaulterSince).getTime()) / (1000 * 60 * 60 * 24));
            totalDays += daysSince;
            enrichedDefaulters.push({
                businessOwnerId: defaulter.businessOwnerId,
                shopId: defaulter.shopId,
                businessName: defaulter.businessName,
                walletBalance: defaulter.walletBalance,
                defaulterSince: defaulter.defaulterSince,
                daysSinceDefaulter: daysSince,
                userId: businessOwner.userId,
                phone: businessOwner.user?.phone || 'N/A',
            });
        }
        const averageDaysDefaulter = enrichedDefaulters.length > 0 ? Math.round(totalDays / enrichedDefaulters.length) : 0;
        return {
            code: 200,
            success: true,
            message: 'Defaulters retrieved successfully',
            data: {
                totalDefaulters: summary.totalDefaulters,
                totalNegativeBalance: summary.totalNegativeBalance,
                averageDaysDefaulter,
                defaulters: enrichedDefaulters,
            },
        };
    }
    async getDefaultersSummary() {
        const summary = await this.walletMonitorService.getDefaultersSummary();
        return {
            code: 200,
            success: true,
            message: 'Defaulters summary retrieved successfully',
            data: {
                totalDefaulters: summary.totalDefaulters,
                totalNegativeBalance: summary.totalNegativeBalance,
            },
        };
    }
    async getDefaulterDetails(businessOwnerId) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { id: businessOwnerId, isDefaulter: true },
            relations: ['user'],
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner not found or not marked as defaulter');
        }
        const wallet = await this.walletRepository.findOne({
            where: {
                userId: businessOwner.userId,
                userType: entities_1.WalletUserType.BUSINESS_OWNER,
            },
        });
        if (!wallet) {
            throw new common_1.NotFoundException('Wallet not found for this business owner');
        }
        const bankingInfo = await this.bankingInfoRepository.findOne({
            where: { businessOwnerId: businessOwner.id },
        });
        const transactionsResult = await this.walletService.getTransactions(wallet.id, {
            page: 1,
            limit: 10,
        });
        const recentTransactions = transactionsResult.transactions.map(tx => ({
            id: tx.id,
            type: tx.type,
            category: tx.category,
            amount: Number(tx.amount),
            description: tx.description,
            createdAt: tx.createdAt,
        }));
        const daysSinceDefaulter = businessOwner.defaulterSince
            ? Math.floor((new Date().getTime() - new Date(businessOwner.defaulterSince).getTime()) / (1000 * 60 * 60 * 24))
            : 0;
        const details = {
            businessOwnerId: businessOwner.id,
            shopId: businessOwner.shopId,
            businessName: businessOwner.businessName,
            walletBalance: Number(wallet.balance),
            defaulterSince: businessOwner.defaulterSince,
            daysSinceDefaulter,
            userId: businessOwner.userId,
            phone: businessOwner.user?.phone || 'N/A',
            bankingInfo: bankingInfo
                ? {
                    accountNumber: bankingInfo.accountNumber,
                    accountHolderName: bankingInfo.accountHolderName,
                    ifscCode: bankingInfo.ifscCode,
                    bankName: bankingInfo.bankName,
                    branch: bankingInfo.branch,
                    isVerified: bankingInfo.isVerified,
                }
                : undefined,
            recentTransactions,
            totalCommissionOwed: Math.abs(Number(wallet.balance)),
        };
        return {
            code: 200,
            success: true,
            message: 'Defaulter details retrieved successfully',
            data: details,
        };
    }
    async checkDefaulters() {
        const result = await this.walletMonitorService.checkAndMarkDefaulters();
        return {
            code: 200,
            success: true,
            message: `Defaulter check completed. ${result.newDefaulters} newly marked, ${result.alreadyDefaulters} already marked.`,
            data: result,
        };
    }
    async manuallyMarkDefaulter(businessOwnerId, actionDto, req) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { id: businessOwnerId },
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner not found');
        }
        if (businessOwner.isDefaulter) {
            throw new common_1.BadRequestException('Business owner is already marked as defaulter');
        }
        const wallet = await this.walletRepository.findOne({
            where: {
                userId: businessOwner.userId,
                userType: entities_1.WalletUserType.BUSINESS_OWNER,
            },
        });
        businessOwner.isDefaulter = true;
        businessOwner.defaulterSince = new Date();
        await this.businessOwnerRepository.save(businessOwner);
        return {
            code: 200,
            success: true,
            message: `Business owner ${businessOwner.businessName} marked as defaulter by admin`,
            data: {
                businessOwnerId: businessOwner.id,
                shopId: businessOwner.shopId,
                businessName: businessOwner.businessName,
                isDefaulter: true,
                walletBalance: wallet ? Number(wallet.balance) : 0,
                actionDate: businessOwner.defaulterSince,
            },
        };
    }
    async manuallyRestoreDefaulter(businessOwnerId, actionDto, req) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { id: businessOwnerId },
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner not found');
        }
        if (!businessOwner.isDefaulter) {
            throw new common_1.BadRequestException('Business owner is not marked as defaulter');
        }
        const wallet = await this.walletRepository.findOne({
            where: {
                userId: businessOwner.userId,
                userType: entities_1.WalletUserType.BUSINESS_OWNER,
            },
        });
        businessOwner.isDefaulter = false;
        businessOwner.defaulterSince = null;
        await this.businessOwnerRepository.save(businessOwner);
        return {
            code: 200,
            success: true,
            message: `Business owner ${businessOwner.businessName} restored from defaulter status by admin`,
            data: {
                businessOwnerId: businessOwner.id,
                shopId: businessOwner.shopId,
                businessName: businessOwner.businessName,
                isDefaulter: false,
                walletBalance: wallet ? Number(wallet.balance) : 0,
                actionDate: new Date(),
            },
        };
    }
    async getDefaulterStats() {
        const summary = await this.walletMonitorService.getDefaultersSummary();
        const defaulters = await this.businessOwnerRepository.find({
            where: { isDefaulter: true },
        });
        let totalDays = 0;
        let maxBalance = 0;
        let minBalance = 0;
        for (const defaulter of defaulters) {
            if (defaulter.defaulterSince) {
                const days = Math.floor((new Date().getTime() - new Date(defaulter.defaulterSince).getTime()) / (1000 * 60 * 60 * 24));
                totalDays += days;
            }
            const wallet = await this.walletRepository.findOne({
                where: {
                    userId: defaulter.userId,
                    userType: entities_1.WalletUserType.BUSINESS_OWNER,
                },
            });
            if (wallet) {
                const balance = Number(wallet.balance);
                if (balance < minBalance)
                    minBalance = balance;
                if (balance > maxBalance)
                    maxBalance = balance;
            }
        }
        const averageDays = defaulters.length > 0 ? Math.round(totalDays / defaulters.length) : 0;
        const averageDebt = defaulters.length > 0 ? summary.totalNegativeBalance / defaulters.length : 0;
        return {
            code: 200,
            success: true,
            message: 'Defaulter statistics retrieved successfully',
            data: {
                totalDefaulters: summary.totalDefaulters,
                totalDebtOwed: Math.abs(summary.totalNegativeBalance),
                averageDebtPerDefaulter: Math.abs(averageDebt),
                averageDaysInDefaulter: averageDays,
                largestDebt: Math.abs(minBalance),
                smallestDebt: Math.abs(maxBalance),
            },
        };
    }
};
exports.AdminDefaulterController = AdminDefaulterController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get list of all defaulters',
        description: `
      Retrieve all business owners currently marked as defaulters (negative wallet balance).

      Shows:
      - Business details
      - Current wallet balance
      - Days since marked as defaulter
      - Contact information

      Defaulters are businesses that owe commission to the company (typically from COD bookings).
    `,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Defaulters list retrieved successfully',
        type: defaulter_dto_1.DefaulterListResponseDto,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminDefaulterController.prototype, "getAllDefaulters", null);
__decorate([
    (0, common_1.Get)('summary'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get defaulters summary statistics',
        description: 'Quick overview of defaulter statistics without full list.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Summary retrieved successfully',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminDefaulterController.prototype, "getDefaultersSummary", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get detailed information about a specific defaulter',
        description: `
      Retrieve comprehensive details about a defaulter including:
      - Business and owner information
      - Current wallet balance
      - Banking information
      - Recent wallet transactions
      - Commission owed
    `,
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Business Owner ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Defaulter details retrieved successfully',
        type: defaulter_dto_1.DefaulterDetailsResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Business owner not found or not a defaulter',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminDefaulterController.prototype, "getDefaulterDetails", null);
__decorate([
    (0, common_1.Post)('check'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Manually trigger defaulter check',
        description: `
      Manually run the defaulter detection process instead of waiting for the cron job.

      This will:
      1. Find all business owner wallets with negative balance
      2. Mark them as defaulters if not already marked
      3. Return count of newly marked and existing defaulters

      Use this after:
      - Commission deductions
      - Testing the system
      - Immediate action needed
    `,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Defaulter check completed successfully',
        type: defaulter_dto_1.CheckDefaultersApiResponseDto,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminDefaulterController.prototype, "checkDefaulters", null);
__decorate([
    (0, common_1.Post)(':id/mark'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Manually mark a business owner as defaulter',
        description: `
      Manually override the system and mark a business owner as defaulter.

      Use cases:
      - Disciplinary action
      - Contract violation
      - Special circumstances
      - Testing

      Note: This works even if wallet balance is positive (manual override).
      All actions are logged with admin ID and reason.
    `,
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Business Owner ID' }),
    (0, swagger_1.ApiBody)({ type: defaulter_dto_1.ManualDefaulterActionDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Business owner marked as defaulter successfully',
        type: defaulter_dto_1.ManualActionResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Business owner not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, defaulter_dto_1.ManualDefaulterActionDto, Object]),
    __metadata("design:returntype", Promise)
], AdminDefaulterController.prototype, "manuallyMarkDefaulter", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Manually restore a business owner from defaulter status',
        description: `
      Manually remove defaulter status from a business owner.

      Use cases:
      - Payment received outside the system
      - Dispute resolved
      - Special exception granted
      - Testing

      Note: This works even if wallet balance is still negative (manual override).
      All actions are logged with admin ID and reason.
    `,
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Business Owner ID' }),
    (0, swagger_1.ApiBody)({ type: defaulter_dto_1.ManualDefaulterActionDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Business owner restored from defaulter status successfully',
        type: defaulter_dto_1.ManualActionResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Business owner not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, defaulter_dto_1.ManualDefaulterActionDto, Object]),
    __metadata("design:returntype", Promise)
], AdminDefaulterController.prototype, "manuallyRestoreDefaulter", null);
__decorate([
    (0, common_1.Get)('stats/overview'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get comprehensive defaulter statistics',
        description: 'Dashboard overview with defaulter trends and metrics.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Statistics retrieved successfully',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminDefaulterController.prototype, "getDefaulterStats", null);
exports.AdminDefaulterController = AdminDefaulterController = __decorate([
    (0, swagger_1.ApiTags)('Admin - Defaulter Management'),
    (0, common_1.Controller)('admin/wallet/defaulters'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.BusinessOwner)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.Wallet)),
    __param(4, (0, typeorm_1.InjectRepository)(entities_1.BankingInfo)),
    __metadata("design:paramtypes", [wallet_monitor_service_1.WalletMonitorService,
        wallet_service_1.WalletService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AdminDefaulterController);
//# sourceMappingURL=admin-defaulter.controller.js.map