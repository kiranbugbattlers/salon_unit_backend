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
exports.BusinessResponseDto = exports.BusinessDataDto = exports.BusinessMetaDto = exports.BusinessItemDto = exports.BusinessMediaDto = exports.BusinessAddressDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const api_response_dto_1 = require("../../common/dto/api-response.dto");
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
class BusinessMediaDto {
}
exports.BusinessMediaDto = BusinessMediaDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BusinessMediaDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BusinessMediaDto.prototype, "mediaUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], BusinessMediaDto.prototype, "mediaCdnUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BusinessMediaDto.prototype, "mediaType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], BusinessMediaDto.prototype, "description", void 0);
class BusinessItemDto {
}
exports.BusinessItemDto = BusinessItemDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BusinessItemDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BusinessItemDto.prototype, "shopId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], BusinessItemDto.prototype, "businessName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], BusinessItemDto.prototype, "businessDescription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Number)
], BusinessItemDto.prototype, "operatingYears", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], BusinessItemDto.prototype, "isApproved", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Date)
], BusinessItemDto.prototype, "approvedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", BusinessAddressDto)
], BusinessItemDto.prototype, "businessAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [BusinessMediaDto], required: false }),
    __metadata("design:type", Array)
], BusinessItemDto.prototype, "businessMedia", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Average rating from customer reviews', required: false }),
    __metadata("design:type", Number)
], BusinessItemDto.prototype, "averageRating", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of reviews', required: false }),
    __metadata("design:type", Number)
], BusinessItemDto.prototype, "reviewCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User-specific data like isFavorite', required: false }),
    __metadata("design:type", Object)
], BusinessItemDto.prototype, "userSpecific", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], BusinessItemDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], BusinessItemDto.prototype, "updatedAt", void 0);
class BusinessMetaDto {
}
exports.BusinessMetaDto = BusinessMetaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current page number' }),
    __metadata("design:type", Number)
], BusinessMetaDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Items per page' }),
    __metadata("design:type", Number)
], BusinessMetaDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of businesses' }),
    __metadata("design:type", Number)
], BusinessMetaDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of pages' }),
    __metadata("design:type", Number)
], BusinessMetaDto.prototype, "totalPages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether there is a next page' }),
    __metadata("design:type", Boolean)
], BusinessMetaDto.prototype, "hasNextPage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether there is a previous page' }),
    __metadata("design:type", Boolean)
], BusinessMetaDto.prototype, "hasPreviousPage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Applied filters summary', required: false }),
    __metadata("design:type", Object)
], BusinessMetaDto.prototype, "filters", void 0);
class BusinessDataDto {
}
exports.BusinessDataDto = BusinessDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [BusinessItemDto] }),
    __metadata("design:type", Array)
], BusinessDataDto.prototype, "businesses", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", BusinessMetaDto)
], BusinessDataDto.prototype, "meta", void 0);
class BusinessResponseDto extends api_response_dto_1.ApiResponseDto {
    constructor(code, success, message, data) {
        super(code, success, message, data);
    }
}
exports.BusinessResponseDto = BusinessResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], BusinessResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], BusinessResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Businesses retrieved successfully' }),
    __metadata("design:type", String)
], BusinessResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", BusinessDataDto)
], BusinessResponseDto.prototype, "data", void 0);
//# sourceMappingURL=business-response.dto.js.map