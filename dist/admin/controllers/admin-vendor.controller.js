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
exports.AdminVendorController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const enums_1 = require("../../common/enums");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../../database/entities");
const update_vendor_status_dto_1 = require("../dto/update-vendor-status.dto");
const vendor_credit_management_dto_1 = require("../dto/vendor-credit-management.dto");
const vendor_credit_management_service_1 = require("../services/vendor-credit-management.service");
let AdminVendorController = class AdminVendorController {
    constructor(businessOwnerRepository, vendorCreditManagementService) {
        this.businessOwnerRepository = businessOwnerRepository;
        this.vendorCreditManagementService = vendorCreditManagementService;
    }
    async searchVendors(query, page = 1, limit = 20) {
        if (!query || query.trim().length === 0) {
            throw new common_1.BadRequestException('Search query is required');
        }
        const searchTerm = query.trim();
        const skip = (page - 1) * limit;
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(searchTerm);
        let whereConditions;
        if (isUUID) {
            whereConditions = { id: searchTerm };
        }
        else {
            whereConditions = [
                { businessName: (0, typeorm_2.Like)(`%${searchTerm}%`) },
                { shopId: (0, typeorm_2.Like)(`%${searchTerm}%`) },
                { firstName: (0, typeorm_2.Like)(`%${searchTerm}%`) },
                { lastName: (0, typeorm_2.Like)(`%${searchTerm}%`) },
            ];
        }
        const [vendors, total] = await this.businessOwnerRepository.findAndCount({
            where: whereConditions,
            relations: ['user'],
            select: {
                id: true,
                shopId: true,
                businessName: true,
                firstName: true,
                lastName: true,
                isApproved: true,
                isActive: true,
                isDefaulter: true,
                vendorStatus: true,
                createdAt: true,
                user: {
                    id: true,
                    phone: true,
                    email: true,
                },
            },
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });
        const enrichedVendors = vendors.map(vendor => ({
            id: vendor.id,
            shopId: vendor.shopId,
            businessName: vendor.businessName || 'N/A',
            ownerName: vendor.firstName && vendor.lastName
                ? `${vendor.firstName} ${vendor.lastName}`.trim()
                : vendor.businessName || 'N/A',
            phone: vendor.user?.phone || 'N/A',
            email: vendor.user?.email || 'N/A',
            vendorStatus: vendor.vendorStatus,
            isApproved: vendor.isApproved,
            isActive: vendor.isActive,
            isDefaulter: vendor.isDefaulter,
            createdAt: vendor.createdAt,
        }));
        return {
            code: 200,
            success: true,
            message: 'Vendors retrieved successfully',
            data: {
                vendors: enrichedVendors,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        };
    }
    async updateVendorStatus(businessOwnerId, updateDto) {
        const vendor = await this.businessOwnerRepository.findOne({
            where: { id: businessOwnerId },
            relations: ['user'],
        });
        if (!vendor) {
            throw new common_1.NotFoundException('Vendor not found');
        }
        const previousStatus = vendor.vendorStatus;
        vendor.vendorStatus = updateDto.vendorStatus;
        const updatedVendor = await this.businessOwnerRepository.save(vendor);
        return {
            code: 200,
            success: true,
            message: `Vendor status updated from ${previousStatus} to ${updateDto.vendorStatus}`,
            data: {
                id: updatedVendor.id,
                shopId: updatedVendor.shopId,
                businessName: updatedVendor.businessName,
                ownerName: updatedVendor.firstName && updatedVendor.lastName
                    ? `${updatedVendor.firstName} ${updatedVendor.lastName}`.trim()
                    : updatedVendor.businessName || 'N/A',
                phone: vendor.user?.phone || 'N/A',
                previousStatus,
                currentStatus: updatedVendor.vendorStatus,
                updatedAt: updatedVendor.updatedAt,
            },
        };
    }
    async addVendorCredit(businessOwnerId, addCreditDto) {
        const result = await this.vendorCreditManagementService.addCreditToVendor(businessOwnerId, addCreditDto);
        return {
            code: 200,
            success: true,
            message: `Successfully added ${addCreditDto.creditPoints} credit points and activated vendor account`,
            data: result,
        };
    }
    async getVendorCreditInfo(businessOwnerId) {
        const result = await this.vendorCreditManagementService.getVendorCreditInfo(businessOwnerId);
        return {
            code: 200,
            success: true,
            message: 'Vendor credit information retrieved successfully',
            data: result,
        };
    }
    async updateVendorCreditStatus(businessOwnerId, statusDto) {
        const result = await this.vendorCreditManagementService.updateVendorCreditStatus(businessOwnerId, statusDto);
        return {
            code: 200,
            success: true,
            message: `Vendor credit status updated to ${statusDto.status}`,
            data: result,
        };
    }
    async checkOverdueVendors() {
        const result = await this.vendorCreditManagementService.checkAndUpdateOverdueVendors();
        return {
            code: 200,
            success: true,
            message: `Processed ${result.totalOverdue} overdue vendors`,
            data: result,
        };
    }
    async getAllVendorsCreditStatus() {
        const vendors = await this.vendorCreditManagementService.getAllVendorsCreditStatus();
        return {
            code: 200,
            success: true,
            message: 'All vendors credit status retrieved successfully',
            data: {
                vendors,
                total: vendors.length,
                overdueCount: vendors.filter(v => v.isOverdue).length,
                activeCount: vendors.filter(v => v.creditStatus === 'active').length,
                suspendedCount: vendors.filter(v => v.creditStatus === 'suspended').length,
            },
        };
    }
};
exports.AdminVendorController = AdminVendorController;
__decorate([
    (0, common_1.Get)('search'),
    (0, swagger_1.ApiOperation)({
        summary: 'Search vendors by name, shop ID, or business owner ID',
        description: 'Search for vendors using name, shop ID, or business owner ID with pagination support.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'query', description: 'Search term (business name, shop ID, or business owner ID)', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'page', description: 'Page number', required: false, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', description: 'Items per page', required: false, example: 20 }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vendors retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid search query' }),
    __param(0, (0, common_1.Query)('query')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], AdminVendorController.prototype, "searchVendors", null);
__decorate([
    (0, common_1.Put)(':businessOwnerId/status'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update vendor account status',
        description: 'Allow admins to manually change vendor account status (hold/unhold)',
    }),
    (0, swagger_1.ApiParam)({ name: 'businessOwnerId', description: 'Business owner ID (UUID)' }),
    (0, swagger_1.ApiBody)({ type: update_vendor_status_dto_1.UpdateVendorStatusDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vendor status updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Vendor not found' }),
    __param(0, (0, common_1.Param)('businessOwnerId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_vendor_status_dto_1.UpdateVendorStatusDto]),
    __metadata("design:returntype", Promise)
], AdminVendorController.prototype, "updateVendorStatus", null);
__decorate([
    (0, common_1.Post)(':businessOwnerId/credit'),
    (0, swagger_1.ApiOperation)({
        summary: 'Add credit points and activate vendor account',
        description: 'Add credit points to approved vendor and automatically activate their account',
    }),
    (0, swagger_1.ApiParam)({ name: 'businessOwnerId', description: 'Business owner ID (UUID)' }),
    (0, swagger_1.ApiBody)({ type: vendor_credit_management_dto_1.AddVendorCreditDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Credit points added and account activated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Vendor not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Vendor must be approved to add credit points' }),
    __param(0, (0, common_1.Param)('businessOwnerId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, vendor_credit_management_dto_1.AddVendorCreditDto]),
    __metadata("design:returntype", Promise)
], AdminVendorController.prototype, "addVendorCredit", null);
__decorate([
    (0, common_1.Get)(':businessOwnerId/credit'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get vendor credit information and status',
        description: 'Get credit limit, approval status, and account status for a specific vendor',
    }),
    (0, swagger_1.ApiParam)({ name: 'businessOwnerId', description: 'Business owner ID (UUID)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vendor credit information retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Vendor not found' }),
    __param(0, (0, common_1.Param)('businessOwnerId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminVendorController.prototype, "getVendorCreditInfo", null);
__decorate([
    (0, common_1.Put)(':businessOwnerId/credit-status'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update vendor credit status',
        description: 'Manually update vendor credit status (active, overdue, suspended)',
    }),
    (0, swagger_1.ApiParam)({ name: 'businessOwnerId', description: 'Business owner ID (UUID)' }),
    (0, swagger_1.ApiBody)({ type: vendor_credit_management_dto_1.VendorCreditStatusDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vendor credit status updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Vendor not found' }),
    __param(0, (0, common_1.Param)('businessOwnerId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, vendor_credit_management_dto_1.VendorCreditStatusDto]),
    __metadata("design:returntype", Promise)
], AdminVendorController.prototype, "updateVendorCreditStatus", null);
__decorate([
    (0, common_1.Post)('check-overdue'),
    (0, swagger_1.ApiOperation)({
        summary: 'Check and mark overdue vendors',
        description: 'Find vendors with 0 or negative credit and mark them as overdue',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Overdue vendors processed successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminVendorController.prototype, "checkOverdueVendors", null);
__decorate([
    (0, common_1.Get)('credit-status/all'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all vendors credit status',
        description: 'Get credit status for all vendors with overdue indicators',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All vendors credit status retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminVendorController.prototype, "getAllVendorsCreditStatus", null);
exports.AdminVendorController = AdminVendorController = __decorate([
    (0, swagger_1.ApiTags)('Admin - Vendor Management'),
    (0, common_1.Controller)('admin/vendors'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.BusinessOwner)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        vendor_credit_management_service_1.VendorCreditManagementService])
], AdminVendorController);
//# sourceMappingURL=admin-vendor.controller.js.map