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
exports.BusinessOwnerServicesGroupedByCategoryResponseDto = exports.BusinessOwnerServicesGroupedByCategoryDataDto = exports.BusinessOwnerCategoryWithServicesDto = exports.BusinessOwnerServiceInCategoryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const service_gender_enum_1 = require("../../common/enums/service-gender.enum");
const api_response_dto_1 = require("../../common/dto/api-response.dto");
class BusinessOwnerServiceInCategoryDto {
}
exports.BusinessOwnerServiceInCategoryDto = BusinessOwnerServiceInCategoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique identifier of the business service' }),
    __metadata("design:type", String)
], BusinessOwnerServiceInCategoryDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique identifier of the original service' }),
    __metadata("design:type", String)
], BusinessOwnerServiceInCategoryDto.prototype, "serviceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Name of the service' }),
    __metadata("design:type", String)
], BusinessOwnerServiceInCategoryDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Description of the service', nullable: true }),
    __metadata("design:type", String)
], BusinessOwnerServiceInCategoryDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Image URL of the service', nullable: true }),
    __metadata("design:type", String)
], BusinessOwnerServiceInCategoryDto.prototype, "image", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Base price of the service' }),
    __metadata("design:type", Number)
], BusinessOwnerServiceInCategoryDto.prototype, "defaultPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Default duration of the service in minutes' }),
    __metadata("design:type", Number)
], BusinessOwnerServiceInCategoryDto.prototype, "defaultDurationMinutes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Custom price set by the business owner for this service' }),
    __metadata("design:type", Number)
], BusinessOwnerServiceInCategoryDto.prototype, "customPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Custom duration in minutes set by the business owner for this service' }),
    __metadata("design:type", Number)
], BusinessOwnerServiceInCategoryDto.prototype, "customDurationMinutes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the service is available at home' }),
    __metadata("design:type", Boolean)
], BusinessOwnerServiceInCategoryDto.prototype, "availableAtHome", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the service is active' }),
    __metadata("design:type", Boolean)
], BusinessOwnerServiceInCategoryDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: service_gender_enum_1.ServiceGenderEnum, description: 'Gender for which the service is applicable' }),
    __metadata("design:type", String)
], BusinessOwnerServiceInCategoryDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date and time when the service was created' }),
    __metadata("design:type", Date)
], BusinessOwnerServiceInCategoryDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date and time when the service was last updated' }),
    __metadata("design:type", Date)
], BusinessOwnerServiceInCategoryDto.prototype, "updatedAt", void 0);
class BusinessOwnerCategoryWithServicesDto {
}
exports.BusinessOwnerCategoryWithServicesDto = BusinessOwnerCategoryWithServicesDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique identifier of the service category' }),
    __metadata("design:type", String)
], BusinessOwnerCategoryWithServicesDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Name of the service category' }),
    __metadata("design:type", String)
], BusinessOwnerCategoryWithServicesDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Description of the service category', nullable: true }),
    __metadata("design:type", String)
], BusinessOwnerCategoryWithServicesDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Image URL of the service category', nullable: true }),
    __metadata("design:type", String)
], BusinessOwnerCategoryWithServicesDto.prototype, "image", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the service category is active' }),
    __metadata("design:type", Boolean)
], BusinessOwnerCategoryWithServicesDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date and time when the category was created' }),
    __metadata("design:type", Date)
], BusinessOwnerCategoryWithServicesDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date and time when the category was last updated' }),
    __metadata("design:type", Date)
], BusinessOwnerCategoryWithServicesDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [BusinessOwnerServiceInCategoryDto], description: 'List of services within this category' }),
    __metadata("design:type", Array)
], BusinessOwnerCategoryWithServicesDto.prototype, "services", void 0);
class BusinessOwnerServicesGroupedByCategoryDataDto {
}
exports.BusinessOwnerServicesGroupedByCategoryDataDto = BusinessOwnerServicesGroupedByCategoryDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [BusinessOwnerCategoryWithServicesDto], description: 'List of service categories with their associated services' }),
    __metadata("design:type", Array)
], BusinessOwnerServicesGroupedByCategoryDataDto.prototype, "categories", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of categories with services' }),
    __metadata("design:type", Number)
], BusinessOwnerServicesGroupedByCategoryDataDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current page number' }),
    __metadata("design:type", Number)
], BusinessOwnerServicesGroupedByCategoryDataDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of items per page' }),
    __metadata("design:type", Number)
], BusinessOwnerServicesGroupedByCategoryDataDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of pages' }),
    __metadata("design:type", Number)
], BusinessOwnerServicesGroupedByCategoryDataDto.prototype, "totalPages", void 0);
class BusinessOwnerServicesGroupedByCategoryResponseDto extends api_response_dto_1.ApiResponseDto {
}
exports.BusinessOwnerServicesGroupedByCategoryResponseDto = BusinessOwnerServicesGroupedByCategoryResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: BusinessOwnerServicesGroupedByCategoryDataDto }),
    __metadata("design:type", BusinessOwnerServicesGroupedByCategoryDataDto)
], BusinessOwnerServicesGroupedByCategoryResponseDto.prototype, "data", void 0);
//# sourceMappingURL=business-owner-services-grouped-by-category.dto.js.map