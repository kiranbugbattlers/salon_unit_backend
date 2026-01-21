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
exports.AdvertisementController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const advertisement_service_1 = require("./advertisement.service");
const create_advertisement_dto_1 = require("./dto/create-advertisement.dto");
const update_advertisement_dto_1 = require("./dto/update-advertisement.dto");
const advertisement_query_dto_1 = require("./dto/advertisement-query.dto");
const get_active_ads_dto_1 = require("./dto/get-active-ads.dto");
const track_ad_dto_1 = require("./dto/track-ad.dto");
const admin_only_decorator_1 = require("../common/decorators/admin-only.decorator");
const public_decorator_1 = require("../common/decorators/public.decorator");
const api_response_dto_1 = require("../common/dto/api-response.dto");
let AdvertisementController = class AdvertisementController {
    constructor(advertisementService) {
        this.advertisementService = advertisementService;
    }
    async create(createDto, media, req) {
        if (!media) {
            throw new common_1.BadRequestException('Media file is required');
        }
        const allowedImageMimes = ['image/jpeg', 'image/png', 'image/webp'];
        const allowedVideoMimes = ['video/mp4', 'video/webm'];
        if (createDto.mediaType === 'image' && !allowedImageMimes.includes(media.mimetype)) {
            throw new common_1.BadRequestException('Invalid image format. Allowed: JPG, PNG, WEBP');
        }
        if (createDto.mediaType === 'video' && !allowedVideoMimes.includes(media.mimetype)) {
            throw new common_1.BadRequestException('Invalid video format. Allowed: MP4, WEBM');
        }
        const maxSize = createDto.mediaType === 'image' ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
        if (media.size > maxSize) {
            throw new common_1.BadRequestException(`File too large. Max size: ${createDto.mediaType === 'image' ? '10MB' : '50MB'}`);
        }
        const adminId = req.admin?.id || req.user?.sub;
        return await this.advertisementService.create(createDto, media, adminId);
    }
    async findAll(queryDto) {
        return await this.advertisementService.findAll(queryDto);
    }
    async getActiveAds(queryDto) {
        const advertisements = await this.advertisementService.findActiveAds(queryDto.userType, queryDto.screen);
        return new api_response_dto_1.ApiResponseDto(200, true, 'Active advertisements retrieved successfully', advertisements);
    }
    async getAnalytics() {
        return await this.advertisementService.getAnalytics();
    }
    async findOne(id) {
        return await this.advertisementService.findOne(id);
    }
    async update(id, updateDto, media) {
        const cleanedDto = {};
        for (const [key, value] of Object.entries(updateDto)) {
            if (value === '' || value === null || value === undefined) {
                continue;
            }
            if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) {
                continue;
            }
            if (Array.isArray(value) && value.length === 0) {
                continue;
            }
            cleanedDto[key] = value;
        }
        if (media) {
            const allowedImageMimes = ['image/jpeg', 'image/png', 'image/webp'];
            const allowedVideoMimes = ['video/mp4', 'video/webm'];
            if (cleanedDto.mediaType === 'image' && !allowedImageMimes.includes(media.mimetype)) {
                throw new common_1.BadRequestException('Invalid image format. Allowed: JPG, PNG, WEBP');
            }
            if (cleanedDto.mediaType === 'video' && !allowedVideoMimes.includes(media.mimetype)) {
                throw new common_1.BadRequestException('Invalid video format. Allowed: MP4, WEBM');
            }
            const maxSize = cleanedDto.mediaType === 'image' ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
            if (media.size > maxSize) {
                throw new common_1.BadRequestException(`File too large. Max size: ${cleanedDto.mediaType === 'image' ? '10MB' : '50MB'}`);
            }
        }
        return await this.advertisementService.update(id, cleanedDto, media);
    }
    async remove(id) {
        await this.advertisementService.remove(id);
        return { message: 'Advertisement deleted successfully' };
    }
    async toggleActive(id) {
        return await this.advertisementService.toggleActive(id);
    }
    async trackImpression(id, trackDto) {
        await this.advertisementService.trackImpression(id, trackDto.count || 1);
        return { message: `Impression tracked: +${trackDto.count || 1}` };
    }
    async trackClick(id, trackDto) {
        await this.advertisementService.trackClick(id, trackDto.count || 1);
        return { message: `Click tracked: +${trackDto.count || 1}` };
    }
};
exports.AdvertisementController = AdvertisementController;
__decorate([
    (0, common_1.Post)(),
    (0, admin_only_decorator_1.AdminOnly)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('media')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Create new advertisement (Admin only)' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['title', 'mediaType', 'targetUserTypes', 'targetScreens', 'media'],
            properties: {
                title: { type: 'string', example: 'Summer Sale' },
                description: { type: 'string', example: 'Get 50% off' },
                mediaType: { type: 'string', enum: ['image', 'video'] },
                linkUrl: { type: 'string', example: 'https://example.com' },
                targetUserTypes: {
                    type: 'array',
                    items: { type: 'string', enum: ['customer', 'business_owner', 'staff'] },
                },
                targetScreens: {
                    type: 'object',
                    example: { customer: ['home', 'login'] },
                },
                priority: { type: 'integer', example: 10 },
                isActive: { type: 'boolean', example: true },
                startDate: { type: 'string', format: 'date-time' },
                endDate: { type: 'string', format: 'date-time' },
                media: { type: 'string', format: 'binary' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Advertisement created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_advertisement_dto_1.CreateAdvertisementDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AdvertisementController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, admin_only_decorator_1.AdminOnly)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all advertisements with filters (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns paginated list of advertisements' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [advertisement_query_dto_1.AdvertisementQueryDto]),
    __metadata("design:returntype", Promise)
], AdvertisementController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('active'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get active advertisements for specific user type and screen' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns active advertisements wrapped in standard response structure',
        type: api_response_dto_1.ApiResponseDto
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_active_ads_dto_1.GetActiveAdsDto]),
    __metadata("design:returntype", Promise)
], AdvertisementController.prototype, "getActiveAds", null);
__decorate([
    (0, common_1.Get)('analytics'),
    (0, admin_only_decorator_1.AdminOnly)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get advertisement analytics (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns advertisement performance metrics' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdvertisementController.prototype, "getAnalytics", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, admin_only_decorator_1.AdminOnly)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get single advertisement by ID (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns advertisement details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Advertisement not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdvertisementController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, admin_only_decorator_1.AdminOnly)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('media')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Update advertisement (Admin only)' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                mediaType: { type: 'string', enum: ['image', 'video'] },
                linkUrl: { type: 'string' },
                targetUserTypes: {
                    type: 'array',
                    items: { type: 'string', enum: ['customer', 'business_owner', 'staff'] },
                },
                targetScreens: { type: 'object' },
                priority: { type: 'integer' },
                isActive: { type: 'boolean' },
                startDate: { type: 'string', format: 'date-time' },
                endDate: { type: 'string', format: 'date-time' },
                media: { type: 'string', format: 'binary', description: 'Optional: New media file' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Advertisement updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Advertisement not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_advertisement_dto_1.UpdateAdvertisementDto, Object]),
    __metadata("design:returntype", Promise)
], AdvertisementController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, admin_only_decorator_1.AdminOnly)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete advertisement (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Advertisement deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Advertisement not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdvertisementController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/toggle-active'),
    (0, admin_only_decorator_1.AdminOnly)(),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle advertisement active status (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Advertisement status toggled successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Advertisement not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdvertisementController.prototype, "toggleActive", null);
__decorate([
    (0, common_1.Post)(':id/impression'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Track advertisement impression (view)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Impression tracked successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, track_ad_dto_1.TrackAdDto]),
    __metadata("design:returntype", Promise)
], AdvertisementController.prototype, "trackImpression", null);
__decorate([
    (0, common_1.Post)(':id/click'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Track advertisement click' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Click tracked successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, track_ad_dto_1.TrackAdDto]),
    __metadata("design:returntype", Promise)
], AdvertisementController.prototype, "trackClick", null);
exports.AdvertisementController = AdvertisementController = __decorate([
    (0, swagger_1.ApiTags)('Advertisements Management System'),
    (0, common_1.Controller)('advertisements'),
    __metadata("design:paramtypes", [advertisement_service_1.AdvertisementService])
], AdvertisementController);
//# sourceMappingURL=advertisement.controller.js.map