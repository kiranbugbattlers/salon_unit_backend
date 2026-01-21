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
exports.BrowseController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../common/decorators/public.decorator");
const browse_service_1 = require("./browse.service");
const dto_1 = require("../business-owner/dto");
let BrowseController = class BrowseController {
    constructor(browseService) {
        this.browseService = browseService;
    }
    async browseServicePackages(shopId, page, limit, isActive) {
        return this.browseService.browseServicePackages(shopId, page ? +page : 1, limit ? +limit : 10, isActive !== undefined ? isActive : true);
    }
    async browseServicePackageById(packageId, shopId) {
        const packageData = await this.browseService.browseServicePackageById(shopId, packageId);
        return new dto_1.ServicePackageResponseWrapperDto(200, true, 'Service package retrieved successfully', packageData);
    }
};
exports.BrowseController = BrowseController;
__decorate([
    (0, common_1.Get)('service-packages'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
        summary: 'Browse service packages (Public)',
        description: 'Browse all active service packages for a business using shop ID. No authentication required. 🔓 Click the lock icon to add JWT token for enhanced features.',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'shopId',
        required: true,
        type: String,
        example: 'SH-123456',
        description: 'Shop ID of the business'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        type: Number,
        example: 1,
        description: 'Page number'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        example: 10,
        description: 'Number of packages per page'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'isActive',
        required: false,
        type: Boolean,
        example: true,
        description: 'Filter by active status (defaults to true for public access)'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Service packages retrieved successfully',
        type: dto_1.ServicePackageListResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Business not found',
    }),
    __param(0, (0, common_1.Query)('shopId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, Boolean]),
    __metadata("design:returntype", Promise)
], BrowseController.prototype, "browseServicePackages", null);
__decorate([
    (0, common_1.Get)('service-packages/:id'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
        summary: 'Browse service package by ID (Public)',
        description: 'Browse a specific active service package with all its services and pricing details. No authentication required. 🔓 Click the lock icon to add JWT token for enhanced features.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Service package UUID'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'shopId',
        required: true,
        type: String,
        example: 'SH-123456',
        description: 'Shop ID of the business'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Service package retrieved successfully',
        type: dto_1.ServicePackageResponseWrapperDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Service package not found or business not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('shopId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BrowseController.prototype, "browseServicePackageById", null);
exports.BrowseController = BrowseController = __decorate([
    (0, swagger_1.ApiTags)('Public Browse'),
    (0, common_1.Controller)('browse'),
    __metadata("design:paramtypes", [browse_service_1.BrowseService])
], BrowseController);
//# sourceMappingURL=browse.controller.js.map