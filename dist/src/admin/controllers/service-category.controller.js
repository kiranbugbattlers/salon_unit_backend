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
exports.ServiceCategoryController = void 0;
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
let ServiceCategoryController = class ServiceCategoryController {
    constructor(serviceCategoryService) {
        this.serviceCategoryService = serviceCategoryService;
    }
    async create(createDto, file) {
        return this.serviceCategoryService.create(createDto, file);
    }
    async findAll(page, limit, isActive) {
        return this.serviceCategoryService.findAll(page ? +page : 1, limit ? +limit : 10, isActive);
    }
    async findOne(id) {
        return this.serviceCategoryService.findOne(id);
    }
    async update(id, updateDto) {
        return this.serviceCategoryService.update(id, updateDto);
    }
    async toggleActive(id) {
        return this.serviceCategoryService.toggleActive(id);
    }
    async remove(id) {
        return this.serviceCategoryService.remove(id);
    }
};
exports.ServiceCategoryController = ServiceCategoryController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new service category (Admin only)',
        description: 'Create a new service category with optional image upload'
    }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        description: 'Service category data with optional image',
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'Hair Care' },
                description: { type: 'string', example: 'Professional hair care services' },
                isActive: { type: 'boolean', example: true },
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Category image file (jpg, png, webp, gif)',
                },
            },
            required: ['name'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Service category created successfully',
        type: dto_1.ServiceCategoryApiResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Service category with this name already exists',
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateServiceCategoryDto, Object]),
    __metadata("design:returntype", Promise)
], ServiceCategoryController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all service categories' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, example: 10 }),
    (0, swagger_1.ApiQuery)({ name: 'isActive', required: false, type: Boolean }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Service categories retrieved successfully',
        type: dto_1.ServiceCategoryListApiResponseDto,
    }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Boolean]),
    __metadata("design:returntype", Promise)
], ServiceCategoryController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get service category by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Service category UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Service category retrieved successfully',
        type: dto_1.ServiceCategoryApiResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Service category not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ServiceCategoryController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({ summary: 'Update service category (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Service category UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Service category updated successfully',
        type: dto_1.ServiceCategoryApiResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Service category not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Service category with this name already exists',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateServiceCategoryDto]),
    __metadata("design:returntype", Promise)
], ServiceCategoryController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/toggle-active'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle service category active status (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Service category UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Service category status toggled successfully',
        type: dto_1.ServiceCategoryApiResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Service category not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ServiceCategoryController.prototype, "toggleActive", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete service category (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Service category UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 204,
        description: 'Service category deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Service category not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Cannot delete category with associated services',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ServiceCategoryController.prototype, "remove", null);
exports.ServiceCategoryController = ServiceCategoryController = __decorate([
    (0, swagger_1.ApiTags)('Service Categories'),
    (0, common_1.Controller)('service-categories'),
    __metadata("design:paramtypes", [services_1.ServiceCategoryService])
], ServiceCategoryController);
//# sourceMappingURL=service-category.controller.js.map