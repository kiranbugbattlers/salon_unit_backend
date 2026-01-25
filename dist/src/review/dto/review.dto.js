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
exports.ReviewQueryDto = exports.ReviewListResponseDto = exports.ReviewResponseDto = exports.UpdateReviewDto = exports.CreateReviewDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class CreateReviewDto {
}
exports.CreateReviewDto = CreateReviewDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the booking being reviewed' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateReviewDto.prototype, "bookingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Rating given (1-5)', minimum: 1, maximum: 5 }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Number)
], CreateReviewDto.prototype, "rating", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Review comment', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReviewDto.prototype, "comment", void 0);
class UpdateReviewDto {
}
exports.UpdateReviewDto = UpdateReviewDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Rating given (1-5)', required: false, minimum: 1, maximum: 5 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Number)
], UpdateReviewDto.prototype, "rating", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Review comment', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateReviewDto.prototype, "comment", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the review is approved to be shown publicly', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateReviewDto.prototype, "isApproved", void 0);
class ReviewResponseDto {
}
exports.ReviewResponseDto = ReviewResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique identifier of the review' }),
    __metadata("design:type", String)
], ReviewResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the booking being reviewed' }),
    __metadata("design:type", String)
], ReviewResponseDto.prototype, "bookingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the customer who wrote the review' }),
    __metadata("design:type", String)
], ReviewResponseDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the business owner being reviewed' }),
    __metadata("design:type", String)
], ReviewResponseDto.prototype, "businessOwnerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Rating given (1-5)' }),
    __metadata("design:type", Number)
], ReviewResponseDto.prototype, "rating", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Review comment', required: false }),
    __metadata("design:type", String)
], ReviewResponseDto.prototype, "comment", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the review is approved to be shown publicly' }),
    __metadata("design:type", Boolean)
], ReviewResponseDto.prototype, "isApproved", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date when the review was created' }),
    __metadata("design:type", Date)
], ReviewResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date when the review was last updated' }),
    __metadata("design:type", Date)
], ReviewResponseDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer information', required: false }),
    __metadata("design:type", Object)
], ReviewResponseDto.prototype, "customer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business owner information', required: false }),
    __metadata("design:type", Object)
], ReviewResponseDto.prototype, "businessOwner", void 0);
class ReviewListResponseDto {
}
exports.ReviewListResponseDto = ReviewListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Array of reviews' }),
    __metadata("design:type", Array)
], ReviewListResponseDto.prototype, "reviews", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of reviews' }),
    __metadata("design:type", Number)
], ReviewListResponseDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current page number' }),
    __metadata("design:type", Number)
], ReviewListResponseDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of reviews per page' }),
    __metadata("design:type", Number)
], ReviewListResponseDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of pages' }),
    __metadata("design:type", Number)
], ReviewListResponseDto.prototype, "totalPages", void 0);
class ReviewQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
    }
}
exports.ReviewQueryDto = ReviewQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Filter by business owner ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ReviewQueryDto.prototype, "businessOwnerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Filter by customer ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ReviewQueryDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Filter by rating', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Number)
], ReviewQueryDto.prototype, "rating", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Filter by approval status', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], ReviewQueryDto.prototype, "isApproved", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Page number', required: false, default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ReviewQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of reviews per page', required: false, default: 10 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ReviewQueryDto.prototype, "limit", void 0);
//# sourceMappingURL=review.dto.js.map