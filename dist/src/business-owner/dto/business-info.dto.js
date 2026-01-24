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
exports.BusinessInfoResponseDto = exports.BusinessInfoDto = exports.BusinessMediaInfoDto = exports.BusinessAddressInfoDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const api_response_dto_1 = require("../../common/dto/api-response.dto");
class BusinessAddressInfoDto {
}
exports.BusinessAddressInfoDto = BusinessAddressInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BusinessAddressInfoDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BusinessAddressInfoDto.prototype, "addressType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], BusinessAddressInfoDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], BusinessAddressInfoDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BusinessAddressInfoDto.prototype, "streetAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], BusinessAddressInfoDto.prototype, "addressLine1", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], BusinessAddressInfoDto.prototype, "addressLine2", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], BusinessAddressInfoDto.prototype, "landmark", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BusinessAddressInfoDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BusinessAddressInfoDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BusinessAddressInfoDto.prototype, "postalCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BusinessAddressInfoDto.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], BusinessAddressInfoDto.prototype, "isPrimary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], BusinessAddressInfoDto.prototype, "isActive", void 0);
class BusinessMediaInfoDto {
}
exports.BusinessMediaInfoDto = BusinessMediaInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BusinessMediaInfoDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BusinessMediaInfoDto.prototype, "mediaType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BusinessMediaInfoDto.prototype, "mediaUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], BusinessMediaInfoDto.prototype, "cdnUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], BusinessMediaInfoDto.prototype, "thumbnailUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], BusinessMediaInfoDto.prototype, "fileName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Number)
], BusinessMediaInfoDto.prototype, "fileSize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], BusinessMediaInfoDto.prototype, "mimeType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], BusinessMediaInfoDto.prototype, "displayOrder", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], BusinessMediaInfoDto.prototype, "createdAt", void 0);
class BusinessInfoDto {
}
exports.BusinessInfoDto = BusinessInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BusinessInfoDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BusinessInfoDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique shop identifier with format SH-XXXXXX',
        example: 'SH-A1B2C3'
    }),
    __metadata("design:type", String)
], BusinessInfoDto.prototype, "shopId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], BusinessInfoDto.prototype, "businessName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], BusinessInfoDto.prototype, "businessDescription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Number)
], BusinessInfoDto.prototype, "operatingYears", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], BusinessInfoDto.prototype, "isApproved", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Date)
], BusinessInfoDto.prototype, "approvedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: BusinessAddressInfoDto,
        required: false,
        nullable: true,
        description: 'Business address information (single address object, not an array)'
    }),
    __metadata("design:type", BusinessAddressInfoDto)
], BusinessInfoDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [BusinessMediaInfoDto],
        required: false,
        description: 'Business media files (images/videos)'
    }),
    __metadata("design:type", Array)
], BusinessInfoDto.prototype, "media", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, nullable: true }),
    __metadata("design:type", Number)
], BusinessInfoDto.prototype, "averageRating", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0 }),
    __metadata("design:type", Number)
], BusinessInfoDto.prototype, "reviewCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], BusinessInfoDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], BusinessInfoDto.prototype, "updatedAt", void 0);
class BusinessInfoResponseDto extends api_response_dto_1.ApiResponseDto {
    constructor(code, success, message, data) {
        super(code, success, message, data);
    }
}
exports.BusinessInfoResponseDto = BusinessInfoResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], BusinessInfoResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], BusinessInfoResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Business information retrieved successfully' }),
    __metadata("design:type", String)
], BusinessInfoResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: BusinessInfoDto }),
    __metadata("design:type", BusinessInfoDto)
], BusinessInfoResponseDto.prototype, "data", void 0);
//# sourceMappingURL=business-info.dto.js.map