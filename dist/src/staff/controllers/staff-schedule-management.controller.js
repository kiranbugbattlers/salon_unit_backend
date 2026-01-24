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
exports.StaffScheduleManagementController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const staff_schedule_management_service_1 = require("../services/staff-schedule-management.service");
const dto_1 = require("../dto");
const guards_1 = require("../../common/guards");
const decorators_1 = require("../../common/decorators");
const enums_1 = require("../../common/enums");
let StaffScheduleManagementController = class StaffScheduleManagementController {
    constructor(staffScheduleService) {
        this.staffScheduleService = staffScheduleService;
    }
    async createScheduleOverride(req, staffId, createOverrideDto) {
        return this.staffScheduleService.createScheduleOverride(req.user.userId, staffId, createOverrideDto);
    }
    async getScheduleOverrides(req, staffId) {
        return this.staffScheduleService.getScheduleOverrides(req.user.userId, staffId);
    }
    async updateScheduleOverride(req, staffId, overrideId, updateOverrideDto) {
        return this.staffScheduleService.updateScheduleOverride(req.user.userId, staffId, overrideId, updateOverrideDto);
    }
    async deleteScheduleOverride(req, staffId, overrideId) {
        return this.staffScheduleService.deleteScheduleOverride(req.user.userId, staffId, overrideId);
    }
    async createStaffBreak(req, staffId, createBreakDto) {
        return this.staffScheduleService.createStaffBreak(req.user.userId, staffId, createBreakDto);
    }
    async getStaffBreaks(req, staffId) {
        return this.staffScheduleService.getStaffBreaks(req.user.userId, staffId);
    }
    async updateStaffBreak(req, staffId, breakId, updateBreakDto) {
        return this.staffScheduleService.updateStaffBreak(req.user.userId, staffId, breakId, updateBreakDto);
    }
    async deleteStaffBreak(req, staffId, breakId) {
        return this.staffScheduleService.deleteStaffBreak(req.user.userId, staffId, breakId);
    }
};
exports.StaffScheduleManagementController = StaffScheduleManagementController;
__decorate([
    (0, common_1.Post)('override'),
    (0, swagger_1.ApiOperation)({ summary: 'Create schedule override for staff member' }),
    (0, swagger_1.ApiParam)({ name: 'staffId', description: 'Staff ID' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Schedule override created successfully',
        type: dto_1.ScheduleOverrideResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Staff not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Override already exists for this date' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('staffId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.CreateScheduleOverrideDto]),
    __metadata("design:returntype", Promise)
], StaffScheduleManagementController.prototype, "createScheduleOverride", null);
__decorate([
    (0, common_1.Get)('override'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all schedule overrides for staff member' }),
    (0, swagger_1.ApiParam)({ name: 'staffId', description: 'Staff ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Schedule overrides retrieved successfully',
        type: dto_1.ScheduleOverrideListResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Staff not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('staffId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StaffScheduleManagementController.prototype, "getScheduleOverrides", null);
__decorate([
    (0, common_1.Patch)('override/:overrideId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update schedule override' }),
    (0, swagger_1.ApiParam)({ name: 'staffId', description: 'Staff ID' }),
    (0, swagger_1.ApiParam)({ name: 'overrideId', description: 'Override ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Schedule override updated successfully',
        type: dto_1.ScheduleOverrideResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Staff or override not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('staffId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Param)('overrideId', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, dto_1.UpdateScheduleOverrideDto]),
    __metadata("design:returntype", Promise)
], StaffScheduleManagementController.prototype, "updateScheduleOverride", null);
__decorate([
    (0, common_1.Delete)('override/:overrideId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete schedule override' }),
    (0, swagger_1.ApiParam)({ name: 'staffId', description: 'Staff ID' }),
    (0, swagger_1.ApiParam)({ name: 'overrideId', description: 'Override ID' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Schedule override deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Staff or override not found' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('staffId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Param)('overrideId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], StaffScheduleManagementController.prototype, "deleteScheduleOverride", null);
__decorate([
    (0, common_1.Post)('breaks'),
    (0, swagger_1.ApiOperation)({ summary: 'Create break schedule for staff member' }),
    (0, swagger_1.ApiParam)({ name: 'staffId', description: 'Staff ID' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Staff break created successfully',
        type: dto_1.StaffBreakResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Staff not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('staffId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.CreateStaffBreakDto]),
    __metadata("design:returntype", Promise)
], StaffScheduleManagementController.prototype, "createStaffBreak", null);
__decorate([
    (0, common_1.Get)('breaks'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all break schedules for staff member' }),
    (0, swagger_1.ApiParam)({ name: 'staffId', description: 'Staff ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Staff breaks retrieved successfully',
        type: dto_1.StaffBreakListResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Staff not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('staffId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StaffScheduleManagementController.prototype, "getStaffBreaks", null);
__decorate([
    (0, common_1.Patch)('breaks/:breakId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update staff break schedule' }),
    (0, swagger_1.ApiParam)({ name: 'staffId', description: 'Staff ID' }),
    (0, swagger_1.ApiParam)({ name: 'breakId', description: 'Break ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Staff break updated successfully',
        type: dto_1.StaffBreakResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Staff or break not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('staffId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Param)('breakId', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, dto_1.UpdateStaffBreakDto]),
    __metadata("design:returntype", Promise)
], StaffScheduleManagementController.prototype, "updateStaffBreak", null);
__decorate([
    (0, common_1.Delete)('breaks/:breakId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete staff break schedule' }),
    (0, swagger_1.ApiParam)({ name: 'staffId', description: 'Staff ID' }),
    (0, swagger_1.ApiParam)({ name: 'breakId', description: 'Break ID' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Staff break deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Staff or break not found' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('staffId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Param)('breakId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], StaffScheduleManagementController.prototype, "deleteStaffBreak", null);
exports.StaffScheduleManagementController = StaffScheduleManagementController = __decorate([
    (0, swagger_1.ApiExcludeController)(),
    (0, swagger_1.ApiTags)('Staff Schedule Management'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, guards_1.RolesGuard),
    (0, decorators_1.Roles)(enums_1.UserRole.BUSINESS_OWNER),
    (0, common_1.Controller)('staff/:staffId/schedule'),
    __metadata("design:paramtypes", [staff_schedule_management_service_1.StaffScheduleManagementService])
], StaffScheduleManagementController);
//# sourceMappingURL=staff-schedule-management.controller.js.map