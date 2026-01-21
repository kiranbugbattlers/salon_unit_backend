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
exports.AdminSettlementController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const enums_1 = require("../../common/enums");
const daily_settlement_service_1 = require("../../wallet/daily-settlement.service");
const get_daily_settlements_dto_1 = require("../dto/get-daily-settlements.dto");
const update_settlement_status_dto_1 = require("../dto/update-settlement-status.dto");
let AdminSettlementController = class AdminSettlementController {
    constructor(dailySettlementService) {
        this.dailySettlementService = dailySettlementService;
    }
    async getAllSettlements(query) {
        return this.dailySettlementService.getAllSettlements({
            date: query.date,
            startDate: query.startDate,
            endDate: query.endDate,
            page: query.page,
            limit: query.limit,
        });
    }
    async getAllHistory(page, limit, startDate, endDate, businessOwnerId) {
        return this.dailySettlementService.getAllHistory({
            page: page || 1,
            limit: limit || 50,
            startDate,
            endDate,
            businessOwnerId,
        });
    }
    async updateSettlementStatus(dto) {
        return this.dailySettlementService.updateSettlementStatusByBusinessOwner(dto.businessOwnerId, dto.date, dto.status, dto.transactionReference, dto.adminNotes);
    }
    async getSettlementDetails(businessOwnerId, date, startDate, endDate) {
        return this.dailySettlementService.getSettlementDetails({
            businessOwnerId,
            date,
            startDate,
            endDate,
        });
    }
    async generateSettlements(body) {
        return this.dailySettlementService.generateDailySettlements(body.date);
    }
};
exports.AdminSettlementController = AdminSettlementController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all businesses settlement data for a date',
        description: 'Get all approved businesses with their settlement data for a specific date',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of businesses with settlement data',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_daily_settlements_dto_1.GetDailySettlementsDto]),
    __metadata("design:returntype", Promise)
], AdminSettlementController.prototype, "getAllSettlements", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all settlement history',
        description: 'Get all completed bookings history for all businesses. Can filter on UI by date range.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'All settlement history with pagination',
    }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __param(4, (0, common_1.Query)('businessOwnerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminSettlementController.prototype, "getAllHistory", null);
__decorate([
    (0, common_1.Post)('update-status'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Update settlement status',
        description: 'Update the payment status of a business owner settlement for a specific date',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Settlement status updated' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Business owner not found' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_settlement_status_dto_1.UpdateSettlementStatusDto]),
    __metadata("design:returntype", Promise)
], AdminSettlementController.prototype, "updateSettlementStatus", null);
__decorate([
    (0, common_1.Get)('details'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get detailed settlement info for a business',
        description: 'Get owner details, business info, transaction history and settlement calculation for a specific date or date range',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Settlement details with transactions' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Business owner not found' }),
    __param(0, (0, common_1.Query)('businessOwnerId')),
    __param(1, (0, common_1.Query)('date')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminSettlementController.prototype, "getSettlementDetails", null);
__decorate([
    (0, common_1.Post)('generate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate daily settlements',
        description: 'Generate settlements for all vendors for a specific date',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Settlements generated' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminSettlementController.prototype, "generateSettlements", null);
exports.AdminSettlementController = AdminSettlementController = __decorate([
    (0, swagger_1.ApiTags)('Admin - Settlements'),
    (0, common_1.Controller)('admin/settlements'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    __metadata("design:paramtypes", [daily_settlement_service_1.DailySettlementService])
], AdminSettlementController);
//# sourceMappingURL=admin-settlement.controller.js.map