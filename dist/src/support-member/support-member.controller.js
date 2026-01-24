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
exports.SupportMemberController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const support_member_service_1 = require("./support-member.service");
const assignment_service_1 = require("./assignment.service");
const create_support_member_dto_1 = require("./dto/create-support-member.dto");
const update_support_member_dto_1 = require("./dto/update-support-member.dto");
const support_member_query_dto_1 = require("./dto/support-member-query.dto");
const assign_customer_dto_1 = require("./dto/assign-customer.dto");
const admin_only_decorator_1 = require("../common/decorators/admin-only.decorator");
let SupportMemberController = class SupportMemberController {
    constructor(supportMemberService, assignmentService) {
        this.supportMemberService = supportMemberService;
        this.assignmentService = assignmentService;
    }
    async create(createDto, req) {
        const adminId = req.admin?.id || req.user?.sub;
        return await this.supportMemberService.create(createDto, adminId);
    }
    async findAll(queryDto) {
        return await this.supportMemberService.findAll(queryDto);
    }
    async getAnalytics() {
        return await this.supportMemberService.getAnalytics();
    }
    async findOne(id) {
        return await this.supportMemberService.findOne(id);
    }
    async update(id, updateDto) {
        return await this.supportMemberService.update(id, updateDto);
    }
    async remove(id) {
        await this.supportMemberService.remove(id);
        return { message: 'Support member deleted successfully, customers have been reassigned' };
    }
    async toggleActive(id) {
        return await this.supportMemberService.toggleActive(id);
    }
    async uploadProfilePic(id, file) {
        if (!file) {
            throw new common_1.BadRequestException('Profile picture file is required');
        }
        const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedMimes.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Invalid image format. Allowed: JPG, PNG, WEBP');
        }
        if (file.size > 5 * 1024 * 1024) {
            throw new common_1.BadRequestException('File too large. Max size: 5MB');
        }
        return await this.supportMemberService.uploadProfilePic(id, file);
    }
    async assignCustomer(assignDto) {
        return await this.assignmentService.manualAssignCustomer(assignDto.customerId, assignDto.supportMemberId || null, assignDto.notes);
    }
    async reassignCustomer(reassignDto) {
        if (!reassignDto.newSupportMemberId) {
            return await this.assignmentService.autoAssignCustomer(reassignDto.customerId);
        }
        return await this.assignmentService.manualAssignCustomer(reassignDto.customerId, reassignDto.newSupportMemberId, reassignDto.notes);
    }
    async rebalanceAssignments() {
        return await this.assignmentService.rebalanceAssignments();
    }
    async recalculateCounts() {
        return await this.assignmentService.recalculateAllCustomerCounts();
    }
};
exports.SupportMemberController = SupportMemberController;
__decorate([
    (0, common_1.Post)(),
    (0, admin_only_decorator_1.AdminOnly)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create new support member (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Support member created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Email or phone already exists' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_support_member_dto_1.CreateSupportMemberDto, Object]),
    __metadata("design:returntype", Promise)
], SupportMemberController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, admin_only_decorator_1.AdminOnly)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all support members with filters (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns paginated list of support members' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [support_member_query_dto_1.SupportMemberQueryDto]),
    __metadata("design:returntype", Promise)
], SupportMemberController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('analytics'),
    (0, admin_only_decorator_1.AdminOnly)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get support team analytics (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns analytics and statistics' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SupportMemberController.prototype, "getAnalytics", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, admin_only_decorator_1.AdminOnly)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get support member by ID (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns support member details with assigned customers' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Support member not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SupportMemberController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, admin_only_decorator_1.AdminOnly)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update support member (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Support member updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Support member not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Email or phone already exists' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_support_member_dto_1.UpdateSupportMemberDto]),
    __metadata("design:returntype", Promise)
], SupportMemberController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, admin_only_decorator_1.AdminOnly)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete support member (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Support member deleted successfully, customers reassigned' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Support member not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SupportMemberController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/toggle-active'),
    (0, admin_only_decorator_1.AdminOnly)(),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle support member active status (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Status toggled successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Support member not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SupportMemberController.prototype, "toggleActive", null);
__decorate([
    (0, common_1.Post)(':id/upload-profile-pic'),
    (0, admin_only_decorator_1.AdminOnly)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('profilePic')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload support member profile picture (Admin only)' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['profilePic'],
            properties: {
                profilePic: { type: 'string', format: 'binary' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profile picture uploaded successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Support member not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SupportMemberController.prototype, "uploadProfilePic", null);
__decorate([
    (0, common_1.Post)('assign-customer'),
    (0, admin_only_decorator_1.AdminOnly)(),
    (0, swagger_1.ApiOperation)({ summary: 'Manually assign customer to support member (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Customer assigned successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Customer or support member not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [assign_customer_dto_1.AssignCustomerDto]),
    __metadata("design:returntype", Promise)
], SupportMemberController.prototype, "assignCustomer", null);
__decorate([
    (0, common_1.Post)('reassign-customer'),
    (0, admin_only_decorator_1.AdminOnly)(),
    (0, swagger_1.ApiOperation)({ summary: 'Reassign customer to different support member (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Customer reassigned successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Customer or support member not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [assign_customer_dto_1.ReassignCustomerDto]),
    __metadata("design:returntype", Promise)
], SupportMemberController.prototype, "reassignCustomer", null);
__decorate([
    (0, common_1.Post)('rebalance'),
    (0, admin_only_decorator_1.AdminOnly)(),
    (0, swagger_1.ApiOperation)({ summary: 'Rebalance customer assignments across all members (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Rebalancing completed' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SupportMemberController.prototype, "rebalanceAssignments", null);
__decorate([
    (0, common_1.Post)('recalculate-counts'),
    (0, admin_only_decorator_1.AdminOnly)(),
    (0, swagger_1.ApiOperation)({ summary: 'Recalculate customer counts for all members (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Customer counts recalculated' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SupportMemberController.prototype, "recalculateCounts", null);
exports.SupportMemberController = SupportMemberController = __decorate([
    (0, swagger_1.ApiTags)('Support Management System'),
    (0, common_1.Controller)('support-members'),
    __metadata("design:paramtypes", [support_member_service_1.SupportMemberService,
        assignment_service_1.AssignmentService])
], SupportMemberController);
//# sourceMappingURL=support-member.controller.js.map