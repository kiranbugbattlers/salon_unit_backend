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
exports.VendorStatusController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const enums_1 = require("../../common/enums");
const vendor_status_service_1 = require("../services/vendor-status.service");
const vendor_status_enum_1 = require("../../common/enums/vendor-status.enum");
let VendorStatusController = class VendorStatusController {
    constructor(vendorStatusService) {
        this.vendorStatusService = vendorStatusService;
    }
    async getVendorStatusStats() {
        const stats = await this.vendorStatusService.getVendorStatusStats();
        return {
            code: 200,
            success: true,
            message: 'Vendor status statistics retrieved successfully',
            data: stats,
        };
    }
    async getBusinessOwnersByVendorStatus(status, page = 1, limit = 20) {
        return {
            code: 200,
            success: true,
            message: 'Business owners retrieved successfully',
            data: {
                businessOwners: [],
                pagination: { page, limit, total: 0, totalPages: 0 },
            },
        };
    }
    async manuallyUpdateVendorStatus(businessOwnerId, updateDto) {
        const validStatuses = Object.values(vendor_status_enum_1.VendorStatus);
        if (!validStatuses.includes(updateDto.status)) {
            throw new common_1.BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }
        try {
            const updatedBusinessOwner = await this.vendorStatusService.manuallyUpdateVendorStatus(businessOwnerId, updateDto.status, updateDto.adminRemarks);
            return {
                code: 200,
                success: true,
                message: `Vendor status updated to ${updateDto.status} successfully`,
                data: {
                    businessOwnerId: updatedBusinessOwner.id,
                    businessName: updatedBusinessOwner.businessName,
                    oldStatus: updatedBusinessOwner.vendorStatus,
                    newStatus: updateDto.status,
                    adminRemarks: updateDto.adminRemarks,
                },
            };
        }
        catch (error) {
            if (error.message === 'Business owner not found') {
                throw new common_1.NotFoundException('Business owner not found');
            }
            throw error;
        }
    }
};
exports.VendorStatusController = VendorStatusController;
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get vendor status statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vendor status statistics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VendorStatusController.prototype, "getVendorStatusStats", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all business owners with their vendor status' }),
    (0, swagger_1.ApiQuery)({ name: 'status', enum: ['hold_account', 'active', 'inactive', 'suspended', 'services_hidden'], required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Business owners retrieved successfully' }),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], VendorStatusController.prototype, "getBusinessOwnersByVendorStatus", null);
__decorate([
    (0, common_1.Put)(':businessOwnerId/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Manually update vendor status (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'businessOwnerId', description: 'Business owner ID (UUID)' }),
    (0, swagger_1.ApiBody)({
        description: 'Vendor status update data',
        schema: {
            example: {
                status: 'active',
                adminRemarks: 'Business owner verified and approved for active status',
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vendor status updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Business owner not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid status value' }),
    __param(0, (0, common_1.Param)('businessOwnerId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VendorStatusController.prototype, "manuallyUpdateVendorStatus", null);
exports.VendorStatusController = VendorStatusController = __decorate([
    (0, swagger_1.ApiTags)('Admin - Vendor Status'),
    (0, common_1.Controller)('admin/vendor-status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    __metadata("design:paramtypes", [vendor_status_service_1.VendorStatusService])
], VendorStatusController);
//# sourceMappingURL=vendor-status.controller.js.map