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
exports.BusinessOwnerController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const business_owner_service_1 = require("./business-owner.service");
const dto_1 = require("./dto");
const entities_1 = require("../database/entities");
const business_document_enum_1 = require("../common/enums/business-document.enum");
let BusinessOwnerController = class BusinessOwnerController {
    constructor(businessOwnerService) {
        this.businessOwnerService = businessOwnerService;
    }
    async getProfile(req) {
        return this.businessOwnerService.getBusinessOwnerProfile(req.user.userId);
    }
    async updateProfile(updateData, req) {
        return this.businessOwnerService.updateBusinessOwnerProfile(req.user.userId, updateData);
    }
    async getOnboardingStatus(req) {
        return this.businessOwnerService.getOnboardingStatus(req.user.userId);
    }
    async completeStep1(step1Data, req) {
        return this.businessOwnerService.completeOnboardingStep1(req.user.userId, step1Data);
    }
    async completeStep2(step2Data, files, req) {
        return this.businessOwnerService.completeOnboardingStep2(req.user.userId, step2Data, files);
    }
    async completeStep3(step3Data, req) {
        return this.businessOwnerService.completeOnboardingStep3(req.user.userId, step3Data);
    }
    async completeStep4(step4Data, req) {
        return this.businessOwnerService.completeOnboardingStep4(req.user.userId, step4Data);
    }
    async uploadProfilePicture(file, req) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        return this.businessOwnerService.uploadProfilePicture(req.user.userId, file);
    }
    async deleteProfilePicture(req) {
        await this.businessOwnerService.deleteProfilePicture(req.user.userId);
        return { message: 'Profile picture deleted successfully' };
    }
    async uploadBusinessMedia(files, req) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('No files provided');
        }
        return this.businessOwnerService.uploadBusinessMedia(req.user.userId, files);
    }
    async getBusinessMedia(req) {
        return this.businessOwnerService.getBusinessMedia(req.user.userId);
    }
    async getBusinessMediaById(mediaId, req) {
        return this.businessOwnerService.getBusinessMediaById(req.user.userId, mediaId);
    }
    async updateBusinessMedia(mediaId, updateData, req) {
        return this.businessOwnerService.updateBusinessMedia(req.user.userId, mediaId, updateData);
    }
    async deleteBusinessMedia(mediaId, req) {
        return this.businessOwnerService.deleteBusinessMedia(req.user.userId, mediaId);
    }
    async getBusinessInfo(req) {
        return this.businessOwnerService.getBusinessInfo(req.user.userId);
    }
    async updateBusinessInfo(updateData, req) {
        return this.businessOwnerService.updateBusinessInfo(req.user.userId, updateData);
    }
    async getBusinessServices(req) {
        return this.businessOwnerService.getBusinessServices(req.user.userId);
    }
    async updateBusinessServices(updateData, req) {
        return this.businessOwnerService.updateBusinessServices(req.user.userId, updateData);
    }
    async deleteBusinessServices(deleteData, req) {
        return this.businessOwnerService.deleteBusinessServices(req.user.userId, deleteData);
    }
    async getBusinessServicesGroupedByCategory(req, page, limit, isActive) {
        return this.businessOwnerService.getBusinessServicesGroupedByCategory(req.user.userId, page ? +page : 1, limit ? +limit : 10, isActive);
    }
    async createServicePackage(createDto, req) {
        return this.businessOwnerService.createServicePackage(req.user.userId, createDto);
    }
    async updateServicePackage(packageId, updateDto, req) {
        return this.businessOwnerService.updateServicePackage(req.user.userId, packageId, updateDto);
    }
    async deleteServicePackage(packageId, req) {
        return this.businessOwnerService.deleteServicePackage(req.user.userId, packageId);
    }
    async toggleServicePackageActive(packageId, req) {
        return this.businessOwnerService.toggleServicePackageActive(req.user.userId, packageId);
    }
    async getDeliverySettings(req) {
        return this.businessOwnerService.getDeliverySettings(req.user.businessOwnerId);
    }
    async updateDeliverySettings(req, updateDto) {
        return this.businessOwnerService.updateDeliverySettings(req.user.businessOwnerId, updateDto);
    }
    async getBusinessDocuments(req) {
        return this.businessOwnerService.getBusinessDocuments(req.user.userId);
    }
    async uploadBusinessDocument(file, documentType, req) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        if (!documentType) {
            throw new common_1.BadRequestException('Document type is required');
        }
        return this.businessOwnerService.uploadBusinessDocument(req.user.userId, documentType, file);
    }
};
exports.BusinessOwnerController = BusinessOwnerController;
__decorate([
    (0, common_1.Get)('profile'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get business owner profile',
        description: 'Retrieves the complete business owner profile including business information and onboarding status',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Business owner profile retrieved successfully',
        type: dto_1.BusinessOwnerProfileResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Business owner profile not found',
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BusinessOwnerController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Put)('profile'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update business owner profile',
        description: 'Update business owner profile information. Profile picture fields are ignored if provided - use separate profile-picture endpoints for profile picture management.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Business owner profile updated successfully',
        type: dto_1.BusinessOwnerProfileResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Invalid input data',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Business owner profile not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Conflict - Business name or referral code already exists',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.BusinessOwnerProfileUpdateDto, Object]),
    __metadata("design:returntype", Promise)
], BusinessOwnerController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Get)('onboarding/status'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get business owner onboarding status',
        description: 'Retrieves the current onboarding progress and step data for the business owner',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Onboarding status retrieved successfully',
        type: dto_1.BusinessOwnerOnboardingStatusResponseDto,
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BusinessOwnerController.prototype, "getOnboardingStatus", null);
__decorate([
    (0, common_1.Post)('onboarding/step1'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
        summary: 'Complete business owner onboarding step 1',
        description: 'Complete step 1 of business owner onboarding (personal information). This step may be automatically skipped if user already has complete profile information.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Step 1 completed successfully',
        type: dto_1.BusinessOwnerOnboardingStepResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Invalid input data or phone/email conflicts',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.BusinessOwnerOnboardingStep1Dto, Object]),
    __metadata("design:returntype", Promise)
], BusinessOwnerController.prototype, "completeStep1", null);
__decorate([
    (0, common_1.Post)('onboarding/step2'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
        summary: 'Complete business owner onboarding step 2',
        description: 'Complete step 2 of business owner onboarding (business information, address, and media files)',
    }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        description: 'Step 2 onboarding data with media files',
        schema: {
            type: 'object',
            properties: {
                businessName: { type: 'string', example: 'Elite Hair Studio' },
                businessDescription: { type: 'string', example: 'Professional hair styling and grooming services' },
                latitude: { type: 'number', example: 28.7041 },
                longitude: { type: 'number', example: 77.1025 },
                streetAddress: { type: 'string', example: '123, MG Road, Near Metro Station' },
                addressLine1: { type: 'string', example: 'Shop No. 15, Ground Floor' },
                addressLine2: { type: 'string', example: 'Connaught Place' },
                landmark: { type: 'string', example: 'Opposite City Mall' },
                city: { type: 'string', example: 'New Delhi' },
                state: { type: 'string', example: 'Delhi' },
                postalCode: { type: 'string', example: '110001' },
                country: { type: 'string', example: 'India' },
                files: {
                    type: 'array',
                    items: { type: 'string', format: 'binary' },
                    description: 'Business media files (images/videos, max 14 files)',
                },
            },
            required: ['businessName', 'businessDescription', 'latitude', 'longitude', 'streetAddress', 'city', 'state', 'postalCode'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Step 2 completed successfully',
        type: dto_1.BusinessOwnerOnboardingStepResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Invalid input data or files',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Conflict - Business name already exists',
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 14)),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.BusinessOwnerOnboardingStep2Dto, Array, Object]),
    __metadata("design:returntype", Promise)
], BusinessOwnerController.prototype, "completeStep2", null);
__decorate([
    (0, common_1.Post)('onboarding/step3'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
        summary: 'Complete business owner onboarding step 3',
        description: 'Complete step 3 of business owner onboarding (services offered, business hours, and service location type)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Step 3 completed successfully',
        type: dto_1.BusinessOwnerOnboardingStepResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Invalid input data',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.BusinessOwnerOnboardingStep3Dto, Object]),
    __metadata("design:returntype", Promise)
], BusinessOwnerController.prototype, "completeStep3", null);
__decorate([
    (0, common_1.Post)('onboarding/step4'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
        summary: 'Complete business owner onboarding step 4',
        description: 'Complete step 4 of business owner onboarding (operating experience). This completes the entire onboarding process.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Step 4 completed successfully - onboarding finished',
        type: dto_1.BusinessOwnerOnboardingCompletionResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Invalid input data',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.BusinessOwnerOnboardingStep4Dto, Object]),
    __metadata("design:returntype", Promise)
], BusinessOwnerController.prototype, "completeStep4", null);
__decorate([
    (0, common_1.Post)('profile-picture'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
        summary: 'Upload business owner profile picture',
        description: 'Upload a profile picture for the business owner. Replaces existing profile picture if one exists.',
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
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BusinessOwnerController.prototype, "uploadProfilePicture", null);
__decorate([
    (0, common_1.Delete)('profile-picture'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete business owner profile picture',
        description: 'Delete the current profile picture for the business owner.',
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
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BusinessOwnerController.prototype, "deleteProfilePicture", null);
__decorate([
    (0, common_1.Post)('business-media'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
        summary: 'Upload business media files',
        description: 'Upload multiple images or videos for the business portfolio/gallery. Supports up to 10 files at once.',
    }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        description: 'Business media files',
        schema: {
            type: 'object',
            properties: {
                files: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary',
                    },
                    description: 'Multiple media files (images/videos)',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Business media uploaded successfully',
        type: dto_1.BusinessMediaUploadResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Business owner not found',
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10)),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], BusinessOwnerController.prototype, "uploadBusinessMedia", null);
__decorate([
    (0, common_1.Get)('business-media'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get business media files',
        description: 'Retrieve all business media files (portfolio/gallery) for business owner.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Business media retrieved successfully',
        type: dto_1.BusinessMediaListResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Business owner not found',
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BusinessOwnerController.prototype, "getBusinessMedia", null);
__decorate([
    (0, common_1.Get)('business-media/:mediaId'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get business media by ID',
        description: 'Retrieve a specific business media file by ID',
    }),
    (0, swagger_1.ApiParam)({
        name: 'mediaId',
        description: 'ID of the media file to retrieve',
        example: 'uuid-media-id',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Business media retrieved successfully',
        type: dto_1.BusinessMediaListResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Business owner or media not found',
    }),
    __param(0, (0, common_1.Param)('mediaId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BusinessOwnerController.prototype, "getBusinessMediaById", null);
__decorate([
    (0, common_1.Put)('business-media/:mediaId'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update business media',
        description: 'Update a specific business media file',
    }),
    (0, swagger_1.ApiParam)({
        name: 'mediaId',
        description: 'ID of the media file to update',
        example: 'uuid-media-id',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Business media update data',
        type: 'object',
        required: true,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Business media updated successfully',
        type: dto_1.BusinessMediaListResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Business owner or media not found',
    }),
    __param(0, (0, common_1.Param)('mediaId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], BusinessOwnerController.prototype, "updateBusinessMedia", null);
__decorate([
    (0, common_1.Delete)('business-media/:mediaId'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete business media file',
        description: 'Delete a specific business media file from the portfolio/gallery.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'mediaId',
        description: 'ID of the media file to delete',
        example: 'uuid-media-id',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Business media deleted successfully',
        type: dto_1.BusinessMediaDeleteResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Business owner or media not found',
    }),
    __param(0, (0, common_1.Param)('mediaId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BusinessOwnerController.prototype, "deleteBusinessMedia", null);
__decorate([
    (0, common_1.Get)('business-info'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get business information',
        description: 'Retrieve business information including business details and addresses for the authenticated business owner. Use /business-owner/services endpoint to get service information.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Business information retrieved successfully',
        type: dto_1.BusinessInfoResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Business owner not found',
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BusinessOwnerController.prototype, "getBusinessInfo", null);
__decorate([
    (0, common_1.Put)('business-info'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update business information',
        description: 'Update business information such as business name, description, and operating years for the authenticated business owner',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Business information updated successfully',
        type: dto_1.BusinessInfoResponseDto,
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
        status: 404,
        description: 'Business owner not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Conflict - Business name already exists',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.UpdateBusinessInfoDto, Object]),
    __metadata("design:returntype", Promise)
], BusinessOwnerController.prototype, "updateBusinessInfo", null);
__decorate([
    (0, common_1.Get)('services'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get business services',
        description: 'Retrieve all services offered by the business owner with custom pricing and duration settings',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Business services retrieved successfully',
        type: dto_1.BusinessServicesResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Business owner not found',
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BusinessOwnerController.prototype, "getBusinessServices", null);
__decorate([
    (0, common_1.Put)('services'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update business services',
        description: 'Update services offered by the business owner including custom pricing, duration, and active status',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Business services updated successfully',
        type: dto_1.BusinessServicesResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Invalid input data or service IDs',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Business owner not found',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.UpdateBusinessServicesDto, Object]),
    __metadata("design:returntype", Promise)
], BusinessOwnerController.prototype, "updateBusinessServices", null);
__decorate([
    (0, common_1.Delete)('services'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete business services',
        description: 'Permanently delete one or multiple business services. Services used in active packages cannot be deleted.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'All services deleted successfully',
        type: dto_1.DeleteBusinessServicesResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 207,
        description: 'Partial success - some services deleted, some failed',
        type: dto_1.DeleteBusinessServicesResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Invalid input data or business service IDs',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Business owner not found',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.DeleteBusinessServicesDto, Object]),
    __metadata("design:returntype", Promise)
], BusinessOwnerController.prototype, "deleteBusinessServices", null);
__decorate([
    (0, common_1.Get)('services/grouped-by-category'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get business services grouped by categories',
        description: 'Retrieve business services offered by the authenticated business owner grouped by service categories with custom pricing and duration settings',
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, example: 1, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, example: 10, description: 'Number of categories per page' }),
    (0, swagger_1.ApiQuery)({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status of business services' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Business services grouped by categories retrieved successfully',
        type: dto_1.BusinessOwnerServicesGroupedByCategoryResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Business owner not found',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, Boolean]),
    __metadata("design:returntype", Promise)
], BusinessOwnerController.prototype, "getBusinessServicesGroupedByCategory", null);
__decorate([
    (0, common_1.Post)('service-packages'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new service package',
        description: 'Create a service package containing multiple business services with variable discounts',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Service package created successfully',
        type: dto_1.ServicePackageResponseWrapperDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Invalid input data or business service IDs',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Business owner not found',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateServicePackageDto, Object]),
    __metadata("design:returntype", Promise)
], BusinessOwnerController.prototype, "createServicePackage", null);
__decorate([
    (0, common_1.Put)('service-packages/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update service package',
        description: 'Update service package details and services list',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Service package UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Service package updated successfully',
        type: dto_1.ServicePackageResponseWrapperDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Invalid input data or business service IDs',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Service package not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateServicePackageDto, Object]),
    __metadata("design:returntype", Promise)
], BusinessOwnerController.prototype, "updateServicePackage", null);
__decorate([
    (0, common_1.Delete)('service-packages/:id'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete service package',
        description: 'Soft delete a service package by setting it as inactive',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Service package UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Service package deleted successfully',
        type: dto_1.ServicePackageDeleteResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Service package not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BusinessOwnerController.prototype, "deleteServicePackage", null);
__decorate([
    (0, common_1.Patch)('service-packages/:id/toggle-active'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
        summary: 'Toggle service package active status',
        description: 'Toggle the active status of a service package',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Service package UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Service package status toggled successfully',
        type: dto_1.ServicePackageResponseWrapperDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Service package not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BusinessOwnerController.prototype, "toggleServicePackageActive", null);
__decorate([
    (0, common_1.Get)('delivery-settings'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get delivery settings for at-home services',
        description: `
      Retrieve current delivery charge settings for the business owner's at-home services.

      **Authentication Required - Business Owner**

      Delivery Settings Include:
      - deliveryChargesEnabled: Enable/disable delivery charges
      - baseDeliveryCharge: Fixed base charge for all deliveries
      - perKmCharge: Additional charge per kilometer
      - freeDeliveryUptoKm: Distance up to which delivery is free
      - maxDeliveryDistanceKm: Maximum delivery distance allowed
      - freeDeliveryAboveAmount: Order amount above which delivery is free

      Default Settings (if not configured):
      - deliveryChargesEnabled: true
      - baseDeliveryCharge: ₹0
      - perKmCharge: ₹10/km
      - freeDeliveryUptoKm: 5 km
      - maxDeliveryDistanceKm: 20 km
      - freeDeliveryAboveAmount: ₹1000

      Use Cases:
      - Display current delivery pricing to business owner
      - Show delivery radius on business profile
      - Calculate estimated delivery charges for customers
    `,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Delivery settings retrieved successfully',
        type: entities_1.BusinessSettings,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Business owner not found',
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BusinessOwnerController.prototype, "getDeliverySettings", null);
__decorate([
    (0, common_1.Patch)('delivery-settings'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Update delivery settings for at-home services',
        description: `
      Update delivery charge configuration for the business owner's at-home services.

      **Authentication Required - Business Owner**

      Configurable Settings:
      - **deliveryChargesEnabled**: Enable/disable delivery charges (default: true)
      - **baseDeliveryCharge**: Fixed charge added to all deliveries (default: ₹0)
      - **perKmCharge**: Charge per kilometer beyond free distance (default: ₹10)
      - **freeDeliveryUptoKm**: Free delivery within this radius (default: 5 km)
      - **maxDeliveryDistanceKm**: Maximum service radius (default: 20 km)
      - **freeDeliveryAboveAmount**: Free delivery for orders above this amount (default: ₹1000)

      Delivery Charge Calculation:
      1. If deliveryChargesEnabled = false → No charge
      2. If distance ≤ freeDeliveryUptoKm → No charge
      3. If totalAmount ≥ freeDeliveryAboveAmount → No charge
      4. Otherwise: baseDeliveryCharge + (distance - freeDeliveryUptoKm) × perKmCharge

      Examples:
      - 3 km distance, ₹500 order → Free (within free radius)
      - 10 km distance, ₹1200 order → Free (above free amount)
      - 10 km distance, ₹500 order → ₹0 + (10-5) × ₹10 = ₹50
      - 15 km distance, ₹800 order → ₹0 + (15-5) × ₹10 = ₹100

      Use Cases:
      - Configure competitive delivery pricing
      - Expand or limit service area
      - Offer free delivery promotions
      - Adjust per-km rates for fuel costs
    `,
    }),
    (0, swagger_1.ApiBody)({
        type: dto_1.UpdateDeliverySettingsDto,
        description: 'Delivery settings to update (all fields optional)',
        examples: {
            'Enable with basic pricing': {
                value: {
                    deliveryChargesEnabled: true,
                    baseDeliveryCharge: 20,
                    perKmCharge: 8,
                    freeDeliveryUptoKm: 3,
                    maxDeliveryDistanceKm: 15
                }
            },
            'Free delivery promotion': {
                value: {
                    freeDeliveryAboveAmount: 500,
                    freeDeliveryUptoKm: 10
                }
            },
            'Disable delivery charges': {
                value: {
                    deliveryChargesEnabled: false
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Delivery settings updated successfully',
        type: entities_1.BusinessSettings,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid delivery settings values',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Business owner not found',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.UpdateDeliverySettingsDto]),
    __metadata("design:returntype", Promise)
], BusinessOwnerController.prototype, "updateDeliverySettings", null);
__decorate([
    (0, common_1.Get)('documents'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get business documents',
        description: 'Retrieve all uploaded KYC documents (Aadhar, PAN, etc.) for the business owner.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Business documents retrieved successfully',
        type: dto_1.BusinessDocumentListResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Business owner not found',
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BusinessOwnerController.prototype, "getBusinessDocuments", null);
__decorate([
    (0, common_1.Post)('documents'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
        summary: 'Upload business document',
        description: 'Upload a KYC document (Aadhar, PAN, etc.) for the business owner.',
    }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        description: 'Document file and type',
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Document file (jpg, png, webp, pdf)',
                },
                documentType: {
                    type: 'string',
                    enum: Object.values(business_document_enum_1.DocumentType),
                    description: 'Type of document being uploaded',
                },
            },
            required: ['file', 'documentType'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Document uploaded successfully',
        type: dto_1.BusinessDocumentResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Invalid file or document type',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Business owner not found',
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('documentType')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], BusinessOwnerController.prototype, "uploadBusinessDocument", null);
exports.BusinessOwnerController = BusinessOwnerController = __decorate([
    (0, swagger_1.ApiTags)('Business Owner'),
    (0, common_1.Controller)('business-owner'),
    __metadata("design:paramtypes", [business_owner_service_1.BusinessOwnerService])
], BusinessOwnerController);
//# sourceMappingURL=business-owner.controller.js.map