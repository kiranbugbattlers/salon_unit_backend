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
exports.ServiceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const enums_1 = require("../../common/enums");
const services_1 = require("../services");
const dto_1 = require("../dto");
let ServiceController = class ServiceController {
    constructor(serviceService) {
        this.serviceService = serviceService;
    }
    async create(createDto, file) {
        return this.serviceService.create(createDto, file);
    }
    async findAll(page, limit, categoryId, isActive, availableAtHome) {
        return this.serviceService.findAll(page ? +page : 1, limit ? +limit : 10, categoryId, isActive, availableAtHome);
    }
    async findServicesGroupedByCategory(page, limit, isActive, availableAtHome) {
        return this.serviceService.findServicesGroupedByCategory(page ? +page : 1, limit ? +limit : 10, isActive, availableAtHome);
    }
    async findByCategory(categoryId) {
        return this.serviceService.findByCategory(categoryId);
    }
    async findOne(id) {
        return this.serviceService.findOne(id);
    }
    async update(id, updateDto) {
        return this.serviceService.update(id, updateDto);
    }
    async toggleActive(id) {
        return this.serviceService.toggleActive(id);
    }
    async remove(id) {
        return this.serviceService.remove(id);
    }
};
exports.ServiceController = ServiceController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new service (Admin only)',
        description: 'Create a new service with optional image upload'
    }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        description: 'Service data with optional image',
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'Hair Cut' },
                description: { type: 'string', example: 'Professional hair cutting service' },
                categoryId: { type: 'string', example: 'uuid-category-id' },
                basePrice: { type: 'number', example: 25.00 },
                defaultDuration: { type: 'number', example: 30 },
                availableAtHome: { type: 'boolean', example: true },
                isActive: { type: 'boolean', example: true },
                gender: {
                    type: 'string',
                    enum: ['male', 'female', 'both'],
                    example: 'both',
                    description: 'Gender this service is available for'
                },
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Service image file (jpg, png, webp, gif)',
                },
            },
            required: ['name', 'categoryId'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Service created successfully',
        type: dto_1.ServiceResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Service category not found or inactive',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Service with this name already exists in the category',
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateServiceDto, Object]),
    __metadata("design:returntype", Promise)
], ServiceController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all services' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, example: 10 }),
    (0, swagger_1.ApiQuery)({ name: 'categoryId', required: false, description: 'Filter by category ID' }),
    (0, swagger_1.ApiQuery)({ name: 'isActive', required: false, type: Boolean }),
    (0, swagger_1.ApiQuery)({ name: 'availableAtHome', required: false, type: Boolean }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Services retrieved successfully',
        type: dto_1.ServiceListResponseDto,
    }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('categoryId')),
    __param(3, (0, common_1.Query)('isActive')),
    __param(4, (0, common_1.Query)('availableAtHome')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, Boolean, Boolean]),
    __metadata("design:returntype", Promise)
], ServiceController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('grouped-by-category'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get services grouped by categories' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, example: 10 }),
    (0, swagger_1.ApiQuery)({ name: 'isActive', required: false, type: Boolean }),
    (0, swagger_1.ApiQuery)({ name: 'availableAtHome', required: false, type: Boolean }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Services grouped by categories retrieved successfully',
        type: dto_1.ServicesGroupedByCategoryResponseDto,
    }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('isActive')),
    __param(3, (0, common_1.Query)('availableAtHome')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Boolean, Boolean]),
    __metadata("design:returntype", Promise)
], ServiceController.prototype, "findServicesGroupedByCategory", null);
__decorate([
    (0, common_1.Get)('by-category/:categoryId'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get services by category ID' }),
    (0, swagger_1.ApiParam)({ name: 'categoryId', description: 'Service category UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Services retrieved successfully',
        type: [dto_1.ServiceResponseDto],
    }),
    __param(0, (0, common_1.Param)('categoryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ServiceController.prototype, "findByCategory", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get service by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Service UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Service retrieved successfully',
        type: dto_1.ServiceResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Service not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ServiceController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({ summary: 'Update service (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Service UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Service updated successfully',
        type: dto_1.ServiceResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Service not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Service with this name already exists in the category',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateServiceDto]),
    __metadata("design:returntype", Promise)
], ServiceController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/toggle-active'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle service active status (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Service UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Service status toggled successfully',
        type: dto_1.ServiceResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Service not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ServiceController.prototype, "toggleActive", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete service (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Service UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 204,
        description: 'Service deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Service not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Cannot delete service with staff assignments',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ServiceController.prototype, "remove", null);
exports.ServiceController = ServiceController = __decorate([
    (0, swagger_1.ApiTags)('Services'),
    (0, common_1.Controller)('services'),
    __metadata("design:paramtypes", [services_1.ServiceService])
], ServiceController);
//# sourceMappingURL=service.controller.js.map