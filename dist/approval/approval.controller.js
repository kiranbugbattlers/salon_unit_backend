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
exports.ApprovalController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const approval_service_1 = require("./approval.service");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const enums_1 = require("../common/enums");
const entities_1 = require("../database/entities");
const dto_1 = require("./dto");
const api_response_dto_1 = require("../common/dto/api-response.dto");
let ApprovalController = class ApprovalController {
    constructor(approvalService, businessOwnerRepository) {
        this.approvalService = approvalService;
        this.businessOwnerRepository = businessOwnerRepository;
    }
    async getAgentApprovalRequests(req, page, limit, status) {
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 10;
        return this.approvalService.getAgentApprovalRequests(req.user.agentId, pageNum, limitNum, status);
    }
    async getApprovalRequest(id) {
        return this.approvalService.getApprovalRequest(id);
    }
    async approveBusiness(id, approveDto, req) {
        return this.approvalService.approveBusiness(id, req.user.agentId, approveDto);
    }
    async rejectBusiness(id, rejectDto, req) {
        return this.approvalService.rejectBusiness(id, req.user.agentId, rejectDto);
    }
    async getBusinessApprovalStatus(req) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { userId: req.user.userId },
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business not found');
        }
        return this.approvalService.getBusinessApprovalStatus(businessOwner.id);
    }
    async sendApprovalRequest(businessOwnerId) {
        return this.approvalService.sendApprovalRequestWithResponse(businessOwnerId);
    }
    async getPendingBusinessApprovals(page, limit) {
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 10;
        return this.approvalService.getAdminPendingApprovals(pageNum, limitNum);
    }
    async getAllBusinessApprovals(page, limit, status) {
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 10;
        return this.approvalService.getAdminAllApprovals(pageNum, limitNum, status);
    }
    async adminApproveBusiness(businessOwnerId, approveDto, req) {
        return this.approvalService.adminApproveBusiness(businessOwnerId, req.user.sub, approveDto);
    }
    async adminRejectBusiness(businessOwnerId, rejectDto, req) {
        return this.approvalService.adminRejectBusiness(businessOwnerId, req.user.sub, rejectDto);
    }
    async getAllBusinessesWithDetails(page, limit, status) {
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 10;
        return this.approvalService.getAllBusinessesWithDetails(pageNum, limitNum, status);
    }
    async getBusinessByIdWithDetails(businessOwnerId) {
        return this.approvalService.getBusinessByIdWithDetails(businessOwnerId);
    }
    async updateBusinessApprovalDetails(businessOwnerId, updateDto, req) {
        return this.approvalService.updateBusinessApproval(businessOwnerId, updateDto, req.user.sub);
    }
    async getApprovedBusinessOwners(page, limit) {
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 10;
        return this.approvalService.getApprovedBusinessOwners(pageNum, limitNum);
    }
    async getApprovedBusinessOwnerById(id) {
        return this.approvalService.getApprovedBusinessOwnerById(id);
    }
};
exports.ApprovalController = ApprovalController;
__decorate([
    (0, common_1.Get)('agent/requests'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.AGENT),
    (0, swagger_1.ApiOperation)({
        summary: 'Get approval requests for agent',
        description: 'Retrieves all approval requests assigned to the authenticated agent',
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: enums_1.ApprovalStatus, description: 'Filter by status' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Approval requests retrieved successfully',
        type: dto_1.ApprovalListResponseDto,
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], ApprovalController.prototype, "getAgentApprovalRequests", null);
__decorate([
    (0, common_1.Get)('agent/requests/:id'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.AGENT),
    (0, swagger_1.ApiOperation)({
        summary: 'Get approval request details',
        description: 'Get detailed information about a specific approval request',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Approval request details retrieved successfully',
        type: dto_1.ApprovalRequestDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Approval request not found or not assigned to agent',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApprovalController.prototype, "getApprovalRequest", null);
__decorate([
    (0, common_1.Post)('agent/requests/:id/approve'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.AGENT),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Approve a business',
        description: 'Approve a business registration request. This will mark the business as approved and allow it to operate on the platform.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Business approved successfully',
        type: api_response_dto_1.ApiResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Approval already processed or invalid data',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Approval request not found or not assigned to agent',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.ApproveBusinessDto, Object]),
    __metadata("design:returntype", Promise)
], ApprovalController.prototype, "approveBusiness", null);
__decorate([
    (0, common_1.Post)('agent/requests/:id/reject'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.AGENT),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Reject a business',
        description: 'Reject a business registration request with a reason. The business will not be approved to operate on the platform.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Business rejected successfully',
        type: api_response_dto_1.ApiResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Approval already processed or invalid data',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Approval request not found or not assigned to agent',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.RejectBusinessDto, Object]),
    __metadata("design:returntype", Promise)
], ApprovalController.prototype, "rejectBusiness", null);
__decorate([
    (0, common_1.Get)('business/status'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.BUSINESS_OWNER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get business approval status',
        description: 'Get the current approval status for the authenticated business owner',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Business approval status retrieved successfully',
        type: dto_1.BusinessApprovalStatusDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Business not found',
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApprovalController.prototype, "getBusinessApprovalStatus", null);
__decorate([
    (0, common_1.Post)('send-request/:businessOwnerId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.BUSINESS_OWNER, enums_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Send approval request to nearest agent',
        description: 'Creates an approval request and assigns it to the nearest available agent. If no agents are available, returns admin info for manual processing.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Approval request sent successfully',
        type: dto_1.SendApprovalRequestResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Missing business address or approval already exists',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Business owner not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Approval request already exists for this business',
    }),
    __param(0, (0, common_1.Param)('businessOwnerId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApprovalController.prototype, "sendApprovalRequest", null);
__decorate([
    (0, common_1.Get)('admin/pending-businesses'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all pending business approvals (Admin only)',
        description: 'Retrieves all business approval requests that are pending admin review',
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Pending business approvals retrieved successfully',
        type: dto_1.ApprovalListResponseDto,
    }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ApprovalController.prototype, "getPendingBusinessApprovals", null);
__decorate([
    (0, common_1.Get)('admin/all-businesses'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all business approvals (Admin only)',
        description: 'Retrieves all business approval requests with optional status filter',
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: enums_1.ApprovalStatus, description: 'Filter by approval status' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Business approvals retrieved successfully',
        type: dto_1.ApprovalListResponseDto,
    }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ApprovalController.prototype, "getAllBusinessApprovals", null);
__decorate([
    (0, common_1.Post)('admin/approve/:businessOwnerId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Approve a business (Admin only)',
        description: 'Approve a business registration request. This will mark the business as approved and allow it to operate on the platform.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Business approved successfully',
        type: api_response_dto_1.ApiResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Business already approved or invalid data',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Business not found',
    }),
    __param(0, (0, common_1.Param)('businessOwnerId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.ApproveBusinessDto, Object]),
    __metadata("design:returntype", Promise)
], ApprovalController.prototype, "adminApproveBusiness", null);
__decorate([
    (0, common_1.Post)('admin/reject/:businessOwnerId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Reject a business (Admin only)',
        description: 'Reject a business registration request with a reason. The business will not be approved to operate on the platform.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Business rejected successfully',
        type: api_response_dto_1.ApiResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Business already processed or invalid data',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Business not found',
    }),
    __param(0, (0, common_1.Param)('businessOwnerId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.RejectBusinessDto, Object]),
    __metadata("design:returntype", Promise)
], ApprovalController.prototype, "adminRejectBusiness", null);
__decorate([
    (0, common_1.Get)('admin/businesses/details'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all businesses with comprehensive details (Admin only)',
        description: 'Retrieves all businesses with media, info, owner info, documents, bank details, and reviews',
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: enums_1.ApprovalStatus, description: 'Filter by approval status' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Businesses with comprehensive details retrieved successfully',
    }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ApprovalController.prototype, "getAllBusinessesWithDetails", null);
__decorate([
    (0, common_1.Get)('admin/businesses/:businessOwnerId/details'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get business by ID with comprehensive details (Admin only)',
        description: 'Retrieves a specific business with media, info, owner info, documents, bank details, and reviews',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Business with comprehensive details retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Business not found',
    }),
    __param(0, (0, common_1.Param)('businessOwnerId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApprovalController.prototype, "getBusinessByIdWithDetails", null);
__decorate([
    (0, common_1.Put)('admin/businesses/:businessOwnerId/details'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update business approval details (Admin only)',
        description: 'Updates business details including media, info, owner info, documents, bank details. Email and mobile number cannot be changed.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Business approval details updated successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Invalid data or trying to change restricted fields',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Business not found',
    }),
    __param(0, (0, common_1.Param)('businessOwnerId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ApprovalController.prototype, "updateBusinessApprovalDetails", null);
__decorate([
    (0, common_1.Get)('admin/approved-business-owners'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all approved business owners (Admin only)',
        description: 'Retrieves all approved business owners with their details',
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Approved business owners retrieved successfully',
    }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ApprovalController.prototype, "getApprovedBusinessOwners", null);
__decorate([
    (0, common_1.Get)('admin/approved-business-owners/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get approved business owner by ID (Admin only)',
        description: 'Retrieves a specific approved business owner with their details',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Approved business owner retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Business owner not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApprovalController.prototype, "getApprovedBusinessOwnerById", null);
exports.ApprovalController = ApprovalController = __decorate([
    (0, swagger_1.ApiTags)('Business Approval'),
    (0, common_1.Controller)('approval'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.BusinessOwner)),
    __metadata("design:paramtypes", [approval_service_1.ApprovalService,
        typeorm_2.Repository])
], ApprovalController);
//# sourceMappingURL=approval.controller.js.map