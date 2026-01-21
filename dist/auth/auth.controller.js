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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const public_decorator_1 = require("../common/decorators/public.decorator");
const admin_only_decorator_1 = require("../common/decorators/admin-only.decorator");
const dto_1 = require("./dto");
const api_response_dto_1 = require("../common/dto/api-response.dto");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async sendOtp(sendOtpDto) {
        return this.authService.sendOtp(sendOtpDto.phone, sendOtpDto.role);
    }
    async verifyOtp(verifyOtpDto) {
        return this.authService.verifyOtpAndAuth(verifyOtpDto.phone, verifyOtpDto.otp, verifyOtpDto.role);
    }
    async googleSignIn(googleSignInDto) {
        return this.authService.googleSignIn(googleSignInDto.idToken, googleSignInDto.role);
    }
    async refreshToken(refreshTokenDto) {
        return this.authService.refreshToken(refreshTokenDto.refreshToken);
    }
    async getProfile(req) {
        return req.user;
    }
    async updateFcmToken(fcmTokenDto, req) {
        return this.authService.updateFcmToken(req.user.userId, fcmTokenDto);
    }
    async logout(req) {
        return this.authService.logout(req.user.userId);
    }
    async adminLogin(adminLoginDto) {
        return this.authService.adminLogin(adminLoginDto);
    }
    async agentLogin(agentLoginDto) {
        return this.authService.agentLogin(agentLoginDto);
    }
    async createAgent(createAgentDto, req) {
        return this.authService.createAgent(createAgentDto, req.admin.id);
    }
    async getAgents(page, limit, isActive) {
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 10;
        const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
        return this.authService.getAgents(pageNum, limitNum, isActiveBool);
    }
    async getAgent(id) {
        return this.authService.getAgent(id);
    }
    async updateAgent(id, updateAgentDto, req) {
        return this.authService.updateAgent(id, updateAgentDto, req.admin.id);
    }
    async deleteAgent(id) {
        return this.authService.deleteAgent(id);
    }
    async deleteAccount(req) {
        return this.authService.deleteAccount(req.user.userId);
    }
    async deactivateAccount(req) {
        return this.authService.deactivateAccount(req.user.userId);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('send-otp'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Send OTP to phone number for specific role',
        description: 'Sends a 6-digit OTP to the provided phone number for role-based authentication. The role is tied to the OTP for security.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'OTP sent successfully',
        type: api_response_dto_1.SendOtpResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Invalid phone number, unsupported role, or failed to send OTP',
    }),
    (0, swagger_1.ApiResponse)({
        status: 429,
        description: 'Too many requests - Rate limit exceeded',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.SendOtpDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "sendOtp", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('verify-otp'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Verify OTP and authenticate',
        description: 'Verifies the OTP and returns user data with JWT tokens. Validates that the role matches the one requested during send-otp. Creates user profile based on specified role. Works for both login and signup.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'OTP verified successfully, user authenticated',
        type: api_response_dto_1.VerifyOtpResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or expired OTP, or role mismatch',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Invalid input data or unsupported role',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.VerifyOtpDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyOtp", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('google/signin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Google Sign-In with ID token',
        description: 'Authenticates user using Google ID token from Flutter google_sign_in package. Works for both new and existing users. Similar to OTP verification flow.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Google authentication successful',
        type: api_response_dto_1.VerifyOtpResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or expired Google ID token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Invalid input data or unsupported role',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.GoogleSignInDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleSignIn", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Refresh access token',
        description: 'Generates new access and refresh tokens using a valid refresh token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Tokens refreshed successfully',
        type: dto_1.TokensDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or expired refresh token',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.RefreshTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get authenticated user profile',
        description: 'Returns the current authenticated user profile information',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User profile retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                userId: { type: 'string', format: 'uuid' },
                phone: { type: 'string' },
                email: { type: 'string' },
                roles: { type: 'array', items: { type: 'string' } },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Post)('fcm-token'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Update FCM token for push notifications',
        description: 'Updates the Firebase Cloud Messaging token for the authenticated user to enable push notifications',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'FCM token updated successfully',
        type: api_response_dto_1.ApiResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Invalid FCM token format',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.FcmTokenDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateFcmToken", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Logout user',
        description: 'Logs out the authenticated user by invalidating their refresh token. Works for all user roles (customer, business_owner, agent, admin).',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User logged out successfully',
        type: api_response_dto_1.ApiResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('admin/login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Admin login with username and password',
        description: 'Authenticates admin users using username and password. Admin role is separate and cannot have other roles.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Admin authenticated successfully',
        type: dto_1.AdminAuthResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid username or password, or admin is inactive',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Invalid input data',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.AdminLoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "adminLogin", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('agent/login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Agent login with username and password',
        description: 'Authenticates agent users using username and password. Agent role is separate from regular users.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Agent authenticated successfully',
        type: dto_1.AgentAuthResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid username or password, or agent is inactive',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Invalid input data',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.AgentLoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "agentLogin", null);
__decorate([
    (0, admin_only_decorator_1.AdminOnly)(),
    (0, common_1.Post)('admin/agents'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new agent (Admin only)',
        description: 'Creates a new agent with user account and role. Only admins can create agents.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Agent created successfully',
        type: dto_1.AgentCreateResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin access required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Conflict - User with phone or employee ID already exists',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateAgentDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "createAgent", null);
__decorate([
    (0, admin_only_decorator_1.AdminOnly)(),
    (0, common_1.Get)('admin/agents'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all agents (Admin only)',
        description: 'Retrieves a paginated list of all agents. Only admins can view agents.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Agents retrieved successfully',
        type: dto_1.AgentListResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin access required',
    }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getAgents", null);
__decorate([
    (0, admin_only_decorator_1.AdminOnly)(),
    (0, common_1.Get)('admin/agents/:id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get agent by ID (Admin only)',
        description: 'Retrieves detailed information about a specific agent. Only admins can view agent details.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Agent retrieved successfully',
        type: dto_1.AgentDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin access required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Agent not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getAgent", null);
__decorate([
    (0, admin_only_decorator_1.AdminOnly)(),
    (0, common_1.Put)('admin/agents/:id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update agent (Admin only)',
        description: 'Updates agent information and permissions. Only admins can update agents.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Agent updated successfully',
        type: dto_1.AgentDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin access required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Agent not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Conflict - Employee ID already exists',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateAgentDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateAgent", null);
__decorate([
    (0, admin_only_decorator_1.AdminOnly)(),
    (0, common_1.Delete)('admin/agents/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Deactivate agent (Admin only)',
        description: 'Deactivates an agent (soft delete). Only admins can deactivate agents.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Agent deactivated successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Agent deactivated successfully' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin access required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Agent not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "deleteAgent", null);
__decorate([
    (0, common_1.Delete)('account'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete user account permanently',
        description: 'Permanently deletes the authenticated user account and all associated data including bookings, wallet, favorites, and business information. This action cannot be undone. Works for both customers and business owners.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Account deleted successfully',
        type: api_response_dto_1.ApiResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - User not found',
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "deleteAccount", null);
__decorate([
    (0, common_1.Post)('deactivate'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Deactivate user account',
        description: 'Deactivates the authenticated user account by resetting onboarding status. The account becomes inaccessible but all data (bookings, payments, wallet) is preserved. Works for both customers and business owners. User will be logged out immediately.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Account deleted successfully',
        type: api_response_dto_1.ApiResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - User not found',
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "deactivateAccount", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map