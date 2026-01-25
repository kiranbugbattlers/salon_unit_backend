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
exports.ServiceCategoryListApiResponseDto = exports.ServiceCategoryApiResponseDto = exports.ServiceCategoryListResponseDto = exports.ServiceCategoryResponseDto = exports.UpdateServiceCategoryDto = exports.CreateServiceCategoryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const api_response_dto_1 = require("../../common/dto/api-response.dto");
class CreateServiceCategoryDto {
}
exports.CreateServiceCategoryDto = CreateServiceCategoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Service category name',
        example: 'Hair Care',
        maxLength: 100,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateServiceCategoryDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Service category description',
        example: 'Professional hair care services including cutting, washing, and basic treatments',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateServiceCategoryDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Service category image URL',
        example: 'https://example.com/hair-care.jpg',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], CreateServiceCategoryDto.prototype, "image", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the category is active',
        example: true,
        required: false,
        default: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true';
        }
        return Boolean(value);
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateServiceCategoryDto.prototype, "isActive", void 0);
class UpdateServiceCategoryDto {
}
exports.UpdateServiceCategoryDto = UpdateServiceCategoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Service category name',
        example: 'Hair Care',
        maxLength: 100,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdateServiceCategoryDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Service category description',
        example: 'Professional hair care services including cutting, washing, and basic treatments',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateServiceCategoryDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Service category image URL',
        example: 'https://example.com/hair-care.jpg',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdateServiceCategoryDto.prototype, "image", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the category is active',
        example: true,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true';
        }
        return Boolean(value);
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateServiceCategoryDto.prototype, "isActive", void 0);
class ServiceCategoryResponseDto {
}
exports.ServiceCategoryResponseDto = ServiceCategoryResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ServiceCategoryResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ServiceCategoryResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], ServiceCategoryResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], ServiceCategoryResponseDto.prototype, "image", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], ServiceCategoryResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], ServiceCategoryResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], ServiceCategoryResponseDto.prototype, "updatedAt", void 0);
class ServiceCategoryListResponseDto {
}
exports.ServiceCategoryListResponseDto = ServiceCategoryListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [ServiceCategoryResponseDto] }),
    __metadata("design:type", Array)
], ServiceCategoryListResponseDto.prototype, "categories", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ServiceCategoryListResponseDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ServiceCategoryListResponseDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ServiceCategoryListResponseDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ServiceCategoryListResponseDto.prototype, "totalPages", void 0);
class ServiceCategoryApiResponseDto extends api_response_dto_1.ApiResponseDto {
    constructor(code, success, message, data) {
        super(code, success, message, data);
    }
}
exports.ServiceCategoryApiResponseDto = ServiceCategoryApiResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], ServiceCategoryApiResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], ServiceCategoryApiResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Service category retrieved successfully' }),
    __metadata("design:type", String)
], ServiceCategoryApiResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: ServiceCategoryResponseDto }),
    __metadata("design:type", ServiceCategoryResponseDto)
], ServiceCategoryApiResponseDto.prototype, "data", void 0);
class ServiceCategoryListApiResponseDto extends api_response_dto_1.ApiResponseDto {
    constructor(code, success, message, data) {
        super(code, success, message, data);
    }
}
exports.ServiceCategoryListApiResponseDto = ServiceCategoryListApiResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], ServiceCategoryListApiResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], ServiceCategoryListApiResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Service categories retrieved successfully' }),
    __metadata("design:type", String)
], ServiceCategoryListApiResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: ServiceCategoryListResponseDto }),
    __metadata("design:type", ServiceCategoryListResponseDto)
], ServiceCategoryListApiResponseDto.prototype, "data", void 0);
//# sourceMappingURL=service-category.dto.js.map