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
exports.SettlementController = void 0;
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const settlement_service_1 = require("./settlement.service");
let SettlementController = class SettlementController {
    constructor(settlementService) {
        this.settlementService = settlementService;
    }
    async test() {
        return {
            code: 200,
            success: true,
            message: 'Settlement controller is working',
            data: null,
        };
    }
    async getBusinessOwnerSettlementHistory(businessOwnerId, req) {
        return this.settlementService.getBusinessOwnerSettlementHistory(businessOwnerId, req.user);
    }
    async debugUserInfo(req) {
        return {
            code: 200,
            success: true,
            message: 'User info retrieved',
            data: {
                user: req.user,
                userKeys: Object.keys(req.user || {}),
                userRole: req.user?.role || req.user?.userRole || req.user?.user?.role,
                userId: req.user?.sub || req.user?.id || req.user?.userId || req.user?.user?.id,
                headers: req.headers,
            },
        };
    }
    async getMySettlementHistory(req) {
        return this.settlementService.getBusinessOwnerSettlementHistory(req.user.sub, req.user);
    }
};
exports.SettlementController = SettlementController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Test endpoint',
        description: 'Simple test to verify settlement controller is working',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SettlementController.prototype, "test", null);
__decorate([
    (0, common_1.Get)('business-owner/:businessOwnerId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get settlement history for a business owner',
        description: 'Retrieves all settlement records for a specific business owner',
    }),
    (0, swagger_1.ApiParam)({
        name: 'businessOwnerId',
        description: 'ID of the business owner',
        type: 'string',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Settlement history retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Business owner not found',
    }),
    __param(0, (0, common_1.Param)('businessOwnerId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SettlementController.prototype, "getBusinessOwnerSettlementHistory", null);
__decorate([
    (0, common_1.Get)('debug/user-info'),
    (0, swagger_1.ApiOperation)({
        summary: 'Debug endpoint to check user info',
        description: 'Returns current user information for debugging',
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SettlementController.prototype, "debugUserInfo", null);
__decorate([
    (0, common_1.Get)('my-settlements'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Get current business owner settlement history',
        description: 'Retrieves settlement history for the currently authenticated business owner',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Settlement history retrieved successfully',
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SettlementController.prototype, "getMySettlementHistory", null);
exports.SettlementController = SettlementController = __decorate([
    (0, swagger_1.ApiTags)('settlements'),
    (0, common_1.Controller)('settlements'),
    __metadata("design:paramtypes", [settlement_service_1.SettlementService])
], SettlementController);
//# sourceMappingURL=settlement.controller.js.map