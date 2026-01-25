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
exports.ServicesResponseDto = exports.ServicesDataDto = exports.ServicesMetaDto = exports.ServiceItemDto = exports.BusinessAddressDto = exports.BusinessOwnerInfoDto = exports.ServiceCategoryResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const api_response_dto_1 = require("../../common/dto/api-response.dto");
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
class BusinessOwnerInfoDto {
}
exports.BusinessOwnerInfoDto = BusinessOwnerInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BusinessOwnerInfoDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BusinessOwnerInfoDto.prototype, "shopId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], BusinessOwnerInfoDto.prototype, "businessName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], BusinessOwnerInfoDto.prototype, "businessDescription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], BusinessOwnerInfoDto.prototype, "isApproved", void 0);
class BusinessAddressDto {
}
exports.BusinessAddressDto = BusinessAddressDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BusinessAddressDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BusinessAddressDto.prototype, "streetAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], BusinessAddressDto.prototype, "addressLine1", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], BusinessAddressDto.prototype, "addressLine2", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], BusinessAddressDto.prototype, "landmark", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BusinessAddressDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BusinessAddressDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BusinessAddressDto.prototype, "postalCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BusinessAddressDto.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Number)
], BusinessAddressDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Number)
], BusinessAddressDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Distance from user location in km', required: false }),
    __metadata("design:type", Number)
], BusinessAddressDto.prototype, "distance", void 0);
class ServiceItemDto {
}
exports.ServiceItemDto = ServiceItemDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ServiceItemDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ServiceItemDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], ServiceItemDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Number)
], ServiceItemDto.prototype, "basePrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ServiceItemDto.prototype, "customPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Number)
], ServiceItemDto.prototype, "defaultDuration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ServiceItemDto.prototype, "customDurationMinutes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], ServiceItemDto.prototype, "availableAtHome", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], ServiceItemDto.prototype, "image", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], ServiceItemDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", ServiceCategoryResponseDto)
], ServiceItemDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", BusinessOwnerInfoDto)
], ServiceItemDto.prototype, "businessOwner", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", BusinessAddressDto)
], ServiceItemDto.prototype, "businessAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User-specific data like isFavorite', required: false }),
    __metadata("design:type", Object)
], ServiceItemDto.prototype, "userSpecific", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], ServiceItemDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], ServiceItemDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], ServiceItemDto.prototype, "updatedAt", void 0);
class ServicesMetaDto {
}
exports.ServicesMetaDto = ServicesMetaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current page number' }),
    __metadata("design:type", Number)
], ServicesMetaDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Items per page' }),
    __metadata("design:type", Number)
], ServicesMetaDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of services' }),
    __metadata("design:type", Number)
], ServicesMetaDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of pages' }),
    __metadata("design:type", Number)
], ServicesMetaDto.prototype, "totalPages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether there is a next page' }),
    __metadata("design:type", Boolean)
], ServicesMetaDto.prototype, "hasNextPage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether there is a previous page' }),
    __metadata("design:type", Boolean)
], ServicesMetaDto.prototype, "hasPreviousPage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Applied filters summary', required: false }),
    __metadata("design:type", Object)
], ServicesMetaDto.prototype, "filters", void 0);
class ServicesDataDto {
}
exports.ServicesDataDto = ServicesDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [ServiceItemDto] }),
    __metadata("design:type", Array)
], ServicesDataDto.prototype, "services", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", ServicesMetaDto)
], ServicesDataDto.prototype, "meta", void 0);
class ServicesResponseDto extends api_response_dto_1.ApiResponseDto {
    constructor(code, success, message, data) {
        super(code, success, message, data);
    }
}
exports.ServicesResponseDto = ServicesResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], ServicesResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], ServicesResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Services retrieved successfully' }),
    __metadata("design:type", String)
], ServicesResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", ServicesDataDto)
], ServicesResponseDto.prototype, "data", void 0);
//# sourceMappingURL=service-response.dto.js.map