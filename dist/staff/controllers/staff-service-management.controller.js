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
exports.StaffServiceManagementController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const staff_service_management_service_1 = require("../services/staff-service-management.service");
const dto_1 = require("../dto");
const guards_1 = require("../../common/guards");
const decorators_1 = require("../../common/decorators");
const enums_1 = require("../../common/enums");
let StaffServiceManagementController = class StaffServiceManagementController {
    constructor(staffServiceManagementService) {
        this.staffServiceManagementService = staffServiceManagementService;
    }
    async assignService(req, staffId, assignServiceDto) {
        return this.staffServiceManagementService.assignService(req.user.userId, staffId, assignServiceDto);
    }
    async getStaffServices(req, staffId) {
        return this.staffServiceManagementService.getStaffServices(req.user.userId, staffId);
    }
    async updateStaffService(req, staffId, serviceId, updateStaffServiceDto) {
        return this.staffServiceManagementService.updateStaffService(req.user.userId, staffId, serviceId, updateStaffServiceDto);
    }
    async removeStaffService(req, staffId, serviceId) {
        return this.staffServiceManagementService.removeStaffService(req.user.userId, staffId, serviceId);
    }
};
exports.StaffServiceManagementController = StaffServiceManagementController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Assign a service to staff member' }),
    (0, swagger_1.ApiParam)({ name: 'staffId', description: 'Staff ID' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Service assigned successfully',
        type: dto_1.StaffServiceResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Staff or service not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Service already assigned' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('staffId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.AssignServiceDto]),
    __metadata("design:returntype", Promise)
], StaffServiceManagementController.prototype, "assignService", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all services assigned to staff member' }),
    (0, swagger_1.ApiParam)({ name: 'staffId', description: 'Staff ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Staff services retrieved successfully',
        type: dto_1.StaffServiceListResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Staff not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('staffId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StaffServiceManagementController.prototype, "getStaffServices", null);
__decorate([
    (0, common_1.Patch)(':serviceId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update staff service assignment' }),
    (0, swagger_1.ApiParam)({ name: 'staffId', description: 'Staff ID' }),
    (0, swagger_1.ApiParam)({ name: 'serviceId', description: 'Service ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Staff service updated successfully',
        type: dto_1.StaffServiceResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Staff or service assignment not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('staffId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Param)('serviceId', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, dto_1.UpdateStaffServiceDto]),
    __metadata("design:returntype", Promise)
], StaffServiceManagementController.prototype, "updateStaffService", null);
__decorate([
    (0, common_1.Delete)(':serviceId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove service from staff member' }),
    (0, swagger_1.ApiParam)({ name: 'staffId', description: 'Staff ID' }),
    (0, swagger_1.ApiParam)({ name: 'serviceId', description: 'Service ID' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Service removed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Staff or service assignment not found' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('staffId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Param)('serviceId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], StaffServiceManagementController.prototype, "removeStaffService", null);
exports.StaffServiceManagementController = StaffServiceManagementController = __decorate([
    (0, swagger_1.ApiTags)('Staff Service Management'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, guards_1.RolesGuard),
    (0, decorators_1.Roles)(enums_1.UserRole.BUSINESS_OWNER),
    (0, common_1.Controller)('staff/:staffId/services'),
    __metadata("design:paramtypes", [staff_service_management_service_1.StaffServiceManagementService])
], StaffServiceManagementController);
//# sourceMappingURL=staff-service-management.controller.js.map