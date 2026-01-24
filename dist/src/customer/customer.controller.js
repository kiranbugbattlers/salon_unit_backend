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
exports.CustomerController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const enums_1 = require("../common/enums");
const customer_service_1 = require("./customer.service");
const assignment_service_1 = require("../support-member/assignment.service");
const dto_1 = require("./dto");
let CustomerController = class CustomerController {
    constructor(customerService, assignmentService) {
        this.customerService = customerService;
        this.assignmentService = assignmentService;
    }
    async getProfile(user) {
        return this.customerService.getCustomerProfile(user.userId);
    }
    async getOnboardingStatus(user) {
        return this.customerService.getOnboardingStatus(user.userId);
    }
    async completeStep1(user, step1Data) {
        return this.customerService.completeOnboardingStep1(user.userId, step1Data);
    }
    async completeStep2(user, step2Data) {
        return this.customerService.completeOnboardingStep2(user.userId, step2Data);
    }
    async completeStep3(user, step3Data) {
        return this.customerService.completeOnboardingStep3(user.userId, step3Data);
    }
    async completeStep4(user, step4Data) {
        return this.customerService.completeOnboardingStep4(user.userId, step4Data);
    }
    async updateProfile(user, updateData) {
        return this.customerService.updateCustomerProfile(user.userId, updateData);
    }
    async uploadProfilePicture(file, user) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        return this.customerService.uploadProfilePicture(user.userId, file);
    }
    async deleteProfilePicture(user) {
        await this.customerService.deleteProfilePicture(user.userId);
        return { message: 'Profile picture deleted successfully' };
    }
    async getMySupportMember(user) {
        const profileResponse = await this.customerService.getCustomerProfile(user.userId);
        const customerId = profileResponse.data?.id;
        if (!customerId) {
            return {
                message: 'Customer profile not found',
                assignment: null,
            };
        }
        let assignment = await this.assignmentService.findActiveAssignment(customerId);
        if (!assignment) {
            assignment = await this.assignmentService.autoAssignCustomer(customerId);
        }
        if (assignment.supportMember) {
            return {
                type: 'support_member',
                supportMember: {
                    id: assignment.supportMember.id,
                    name: assignment.supportMember.fullName,
                    firstName: assignment.supportMember.firstName,
                    lastName: assignment.supportMember.lastName,
                    email: assignment.supportMember.email,
                    phone: assignment.supportMember.phone,
                    profilePic: assignment.supportMember.profilePic,
                },
                assignedAt: assignment.assignedAt,
            };
        }
        else if (assignment.admin) {
            return {
                type: 'admin',
                admin: {
                    id: assignment.admin.id,
                    name: assignment.admin.fullName,
                    email: assignment.admin.email,
                },
                assignedAt: assignment.assignedAt,
                note: 'Currently assigned to admin. A support member will be assigned soon.',
            };
        }
    }
    async toggleFavorite(user, businessOwnerId) {
        const profileResponse = await this.customerService.getCustomerProfile(user.userId);
        const customerId = profileResponse.data?.id;
        if (!customerId) {
            throw new common_1.BadRequestException('Customer profile not found');
        }
        return this.customerService.toggleFavorite(customerId, businessOwnerId);
    }
    async getFavorites(user, paginationDto) {
        const profileResponse = await this.customerService.getCustomerProfile(user.userId);
        const customerId = profileResponse.data?.id;
        if (!customerId) {
            throw new common_1.BadRequestException('Customer profile not found');
        }
        return this.customerService.getFavorites(customerId, paginationDto);
    }
};
exports.CustomerController = CustomerController;
__decorate([
    (0, common_1.Get)('profile'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get customer profile',
        description: 'Returns the full customer profile with onboarding status and addresses',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Customer profile retrieved successfully',
        type: dto_1.CustomerProfileResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - User is not a customer',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Customer profile not found',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)('onboarding/status'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get onboarding status',
        description: 'Returns the current onboarding progress and step data',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Onboarding status retrieved successfully',
        type: dto_1.OnboardingStatusResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "getOnboardingStatus", null);
__decorate([
    (0, common_1.Post)('onboarding/step1'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Complete onboarding step 1 - Basic Information',
        description: 'Complete the first step of onboarding with basic customer information (name, email, gender)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Step 1 completed successfully',
        type: dto_1.OnboardingStepResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Invalid input data',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.OnboardingStep1Dto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "completeStep1", null);
__decorate([
    (0, common_1.Post)('onboarding/step2'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Complete onboarding step 2 - Address Information',
        description: 'Complete the second step of onboarding with address and location data',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Step 2 completed successfully',
        type: dto_1.OnboardingStepResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Invalid input data',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.OnboardingStep2Dto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "completeStep2", null);
__decorate([
    (0, common_1.Post)('onboarding/step3'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Complete onboarding step 3 - Service Preferences',
        description: 'Complete the third step of onboarding with hair type and service preferences',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Step 3 completed successfully',
        type: dto_1.OnboardingStepResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Invalid input data',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.OnboardingStep3Dto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "completeStep3", null);
__decorate([
    (0, common_1.Post)('onboarding/step4'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Complete onboarding step 4 - Timing Preferences',
        description: 'Complete the final step of onboarding with timing preferences and finish the onboarding process',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Onboarding completed successfully',
        type: dto_1.OnboardingCompletionResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Invalid input data',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.OnboardingStep4Dto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "completeStep4", null);
__decorate([
    (0, common_1.Put)('profile'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Update customer profile',
        description: 'Update customer profile information. Note: Phone number, email, and profilePic cannot be changed via this endpoint to maintain signup method integrity. Use dedicated endpoints for profile picture management.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Customer profile updated successfully',
        type: dto_1.UpdateProfileResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Invalid input data',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - User is not a customer',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Customer profile not found',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.UpdateCustomerProfileDto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Post)('profile-picture'),
    (0, swagger_1.ApiOperation)({
        summary: 'Upload customer profile picture',
        description: 'Upload a profile picture for the customer. Replaces existing profile picture if one exists.',
    }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        description: 'Profile picture file',
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Image file (jpg, png, webp, gif)',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Profile picture uploaded successfully',
        schema: {
            type: 'object',
            properties: {
                profilePic: { type: 'string', description: 'Direct S3 URL' },
                profilePicCdnUrl: { type: 'string', description: 'CDN URL (recommended for faster loading)' },
                profilePicS3Key: { type: 'string', description: 'S3 key for management' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Invalid file or no file provided',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'User not found',
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "uploadProfilePicture", null);
__decorate([
    (0, common_1.Delete)('profile-picture'),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete customer profile picture',
        description: 'Delete the current profile picture for the customer.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Profile picture deleted successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Profile picture deleted successfully' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - No profile picture to delete',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'User not found',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "deleteProfilePicture", null);
__decorate([
    (0, common_1.Get)('my-support'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get my assigned support member',
        description: 'Returns the support member assigned to the current customer, or admin if no support member is assigned',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns assigned support member or admin details',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'No support assignment found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "getMySupportMember", null);
__decorate([
    (0, common_1.Post)('favorites/:businessOwnerId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Toggle favorite status for a business',
        description: `Toggle a business in the customer's favorites list. If the business is already favorited, it will be removed. If not favorited, it will be added. This is a smart toggle endpoint that handles both add and remove operations.`,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Favorite status toggled successfully. Check data.isFavorite to see current state (true = favorited, false = unfavorited)',
        type: dto_1.FavoriteActionResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Business not found or not approved',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('businessOwnerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "toggleFavorite", null);
__decorate([
    (0, common_1.Get)('favorites'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all favorite businesses',
        description: 'Returns a paginated list of all businesses favorited by the customer, ordered by most recently added first.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Favorites retrieved successfully',
        type: dto_1.FavoritesResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.FavoritesPaginationDto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "getFavorites", null);
exports.CustomerController = CustomerController = __decorate([
    (0, swagger_1.ApiTags)('Customer'),
    (0, common_1.Controller)('customer'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.CUSTOMER),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    __metadata("design:paramtypes", [customer_service_1.CustomerService,
        assignment_service_1.AssignmentService])
], CustomerController);
//# sourceMappingURL=customer.controller.js.map