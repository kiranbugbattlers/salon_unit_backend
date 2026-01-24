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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicePackageDeleteResponseDto = exports.ServicePackageResponseWrapperDto = exports.ServicePackageListResponseDto = exports.ServicePackageListDataDto = exports.ServicePackageResponseDto = exports.ServicePackageItemResponseDto = exports.UpdateServicePackageDto = exports.CreateServicePackageDto = exports.ServicePackageItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const api_response_dto_1 = require("../../common/dto/api-response.dto");
class ServicePackageItemDto {
}
exports.ServicePackageItemDto = ServicePackageItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Business service ID to include in the package',
        example: 'uuid-business-service-id',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(4),
    __metadata("design:type", String)
], ServicePackageItemDto.prototype, "businessServiceId", void 0);
class CreateServicePackageDto {
}
exports.CreateServicePackageDto = CreateServicePackageDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Package name',
        example: 'Hair & Beauty Combo',
        maxLength: 255,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateServicePackageDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Package description',
        example: 'Complete hair styling and beauty treatment package',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateServicePackageDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Overall package discount percentage (0-100)',
        example: 15.0,
        minimum: 0,
        maximum: 100,
    }),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    (0, class_transformer_1.Transform)(({ value }) => parseFloat(value)),
    __metadata("design:type", Number)
], CreateServicePackageDto.prototype, "discountPercentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of services to include in the package',
        type: [ServicePackageItemDto],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ServicePackageItemDto),
    __metadata("design:type", Array)
], CreateServicePackageDto.prototype, "services", void 0);
class UpdateServicePackageDto {
}
exports.UpdateServicePackageDto = UpdateServicePackageDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Package name',
        example: 'Hair & Beauty Combo',
        maxLength: 255,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], UpdateServicePackageDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Package description',
        example: 'Complete hair styling and beauty treatment package',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateServicePackageDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Overall package discount percentage (0-100)',
        example: 15.0,
        minimum: 0,
        maximum: 100,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    (0, class_transformer_1.Transform)(({ value }) => parseFloat(value)),
    __metadata("design:type", Number)
], UpdateServicePackageDto.prototype, "discountPercentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of services to include in the package',
        type: [ServicePackageItemDto],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ServicePackageItemDto),
    __metadata("design:type", Array)
], UpdateServicePackageDto.prototype, "services", void 0);
class ServicePackageItemResponseDto {
}
exports.ServicePackageItemResponseDto = ServicePackageItemResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ServicePackageItemResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ServicePackageItemResponseDto.prototype, "businessServiceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ServicePackageItemResponseDto.prototype, "serviceName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ServicePackageItemResponseDto.prototype, "serviceDescription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ServicePackageItemResponseDto.prototype, "serviceCategoryName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ServicePackageItemResponseDto.prototype, "defaultPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ServicePackageItemResponseDto.prototype, "customPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ServicePackageItemResponseDto.prototype, "defaultDurationMinutes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ServicePackageItemResponseDto.prototype, "customDurationMinutes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Effective duration in minutes (uses customDurationMinutes or falls back to defaultDurationMinutes)',
    }),
    __metadata("design:type", Number)
], ServicePackageItemResponseDto.prototype, "effectiveDurationMinutes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ServicePackageItemResponseDto.prototype, "finalPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], ServicePackageItemResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], ServicePackageItemResponseDto.prototype, "updatedAt", void 0);
class ServicePackageResponseDto {
}
exports.ServicePackageResponseDto = ServicePackageResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ServicePackageResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ServicePackageResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], ServicePackageResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ServicePackageResponseDto.prototype, "discountPercentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ServicePackageResponseDto.prototype, "totalOriginalPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ServicePackageResponseDto.prototype, "totalDiscountedPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ServicePackageResponseDto.prototype, "totalSavings", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ServicePackageResponseDto.prototype, "totalDurationMinutes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ServicePackageResponseDto.prototype, "serviceCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], ServicePackageResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [ServicePackageItemResponseDto] }),
    __metadata("design:type", Array)
], ServicePackageResponseDto.prototype, "services", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], ServicePackageResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], ServicePackageResponseDto.prototype, "updatedAt", void 0);
class ServicePackageListDataDto {
}
exports.ServicePackageListDataDto = ServicePackageListDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [ServicePackageResponseDto] }),
    __metadata("design:type", Array)
], ServicePackageListDataDto.prototype, "packages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ServicePackageListDataDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ServicePackageListDataDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ServicePackageListDataDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ServicePackageListDataDto.prototype, "totalPages", void 0);
class ServicePackageListResponseDto extends api_response_dto_1.ApiResponseDto {
    constructor(code = 200, success = true, message = 'Service packages retrieved successfully', data) {
        super(code, success, message, data);
    }
}
exports.ServicePackageListResponseDto = ServicePackageListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], ServicePackageListResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], ServicePackageListResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Service packages retrieved successfully' }),
    __metadata("design:type", String)
], ServicePackageListResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: ServicePackageListDataDto }),
    __metadata("design:type", ServicePackageListDataDto)
], ServicePackageListResponseDto.prototype, "data", void 0);
class ServicePackageResponseWrapperDto extends api_response_dto_1.ApiResponseDto {
    constructor(code = 200, success = true, message = 'Service package retrieved successfully', data) {
        super(code, success, message, data);
    }
}
exports.ServicePackageResponseWrapperDto = ServicePackageResponseWrapperDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], ServicePackageResponseWrapperDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], ServicePackageResponseWrapperDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Service package retrieved successfully' }),
    __metadata("design:type", String)
], ServicePackageResponseWrapperDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: ServicePackageResponseDto }),
    __metadata("design:type", ServicePackageResponseDto)
], ServicePackageResponseWrapperDto.prototype, "data", void 0);
class ServicePackageDeleteResponseDto extends api_response_dto_1.ApiResponseDto {
    constructor(code = 200, success = true, message = 'Service package deleted successfully') {
        super(code, success, message);
    }
}
exports.ServicePackageDeleteResponseDto = ServicePackageDeleteResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], ServicePackageDeleteResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], ServicePackageDeleteResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Service package deleted successfully' }),
    __metadata("design:type", String)
], ServicePackageDeleteResponseDto.prototype, "message", void 0);
//# sourceMappingURL=service-package.dto.js.map