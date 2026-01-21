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
exports.FavoriteActionResponseDto = exports.FavoritesResponseDto = exports.FavoritesDataDto = exports.FavoritesMetaDto = exports.FavoritesPaginationDto = exports.FavoriteBusinessItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const api_response_dto_1 = require("../../common/dto/api-response.dto");
const dto_1 = require("../../business/dto");
class FavoriteBusinessItemDto {
}
exports.FavoriteBusinessItemDto = FavoriteBusinessItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Business Owner unique identifier',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    __metadata("design:type", String)
], FavoriteBusinessItemDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Business shop ID',
        example: 'SH-123456',
    }),
    __metadata("design:type", String)
], FavoriteBusinessItemDto.prototype, "shopId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Business name',
        example: 'Premium Hair Salon',
    }),
    __metadata("design:type", String)
], FavoriteBusinessItemDto.prototype, "businessName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Business description',
        example: 'Full-service salon offering haircuts, styling, and coloring',
        required: false,
    }),
    __metadata("design:type", String)
], FavoriteBusinessItemDto.prototype, "businessDescription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Years the business has been operating',
        example: 5,
        required: false,
    }),
    __metadata("design:type", Number)
], FavoriteBusinessItemDto.prototype, "operatingYears", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Business address details',
        required: false,
    }),
    __metadata("design:type", dto_1.BusinessAddressDto)
], FavoriteBusinessItemDto.prototype, "businessAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Business media (images/videos)',
        type: [dto_1.BusinessMediaDto],
        required: false,
    }),
    __metadata("design:type", Array)
], FavoriteBusinessItemDto.prototype, "businessMedia", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Average rating from customer reviews',
        example: 4.5,
        required: false,
    }),
    __metadata("design:type", Number)
], FavoriteBusinessItemDto.prototype, "averageRating", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total number of reviews',
        example: 120,
        required: false,
    }),
    __metadata("design:type", Number)
], FavoriteBusinessItemDto.prototype, "reviewCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'When the business was favorited',
        example: '2024-01-15T10:30:00Z',
    }),
    __metadata("design:type", Date)
], FavoriteBusinessItemDto.prototype, "favoritedAt", void 0);
class FavoritesPaginationDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
    }
}
exports.FavoritesPaginationDto = FavoritesPaginationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Page number',
        example: 1,
        required: false,
        default: 1,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], FavoritesPaginationDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of items per page',
        example: 20,
        required: false,
        default: 20,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], FavoritesPaginationDto.prototype, "limit", void 0);
class FavoritesMetaDto {
}
exports.FavoritesMetaDto = FavoritesMetaDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current page number',
        example: 1,
    }),
    __metadata("design:type", Number)
], FavoritesMetaDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Items per page',
        example: 20,
    }),
    __metadata("design:type", Number)
], FavoritesMetaDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total number of favorites',
        example: 45,
    }),
    __metadata("design:type", Number)
], FavoritesMetaDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total number of pages',
        example: 3,
    }),
    __metadata("design:type", Number)
], FavoritesMetaDto.prototype, "totalPages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether there is a next page',
        example: true,
    }),
    __metadata("design:type", Boolean)
], FavoritesMetaDto.prototype, "hasNextPage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether there is a previous page',
        example: false,
    }),
    __metadata("design:type", Boolean)
], FavoritesMetaDto.prototype, "hasPreviousPage", void 0);
class FavoritesDataDto {
}
exports.FavoritesDataDto = FavoritesDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'List of favorite businesses',
        type: [FavoriteBusinessItemDto],
    }),
    __metadata("design:type", Array)
], FavoritesDataDto.prototype, "favorites", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Pagination metadata',
    }),
    __metadata("design:type", FavoritesMetaDto)
], FavoritesDataDto.prototype, "meta", void 0);
class FavoritesResponseDto extends api_response_dto_1.ApiResponseDto {
    constructor(code, success, message, data) {
        super(code, success, message, data);
    }
}
exports.FavoritesResponseDto = FavoritesResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], FavoritesResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], FavoritesResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Favorites retrieved successfully' }),
    __metadata("design:type", String)
], FavoritesResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", FavoritesDataDto)
], FavoritesResponseDto.prototype, "data", void 0);
class FavoriteActionResponseDto extends api_response_dto_1.ApiResponseDto {
    constructor(code, success, message, isFavorite) {
        super(code, success, message, { isFavorite });
    }
}
exports.FavoriteActionResponseDto = FavoriteActionResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], FavoriteActionResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], FavoriteActionResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Business added to favorites' }),
    __metadata("design:type", String)
], FavoriteActionResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: { isFavorite: true },
    }),
    __metadata("design:type", Object)
], FavoriteActionResponseDto.prototype, "data", void 0);
//# sourceMappingURL=favorites.dto.js.map