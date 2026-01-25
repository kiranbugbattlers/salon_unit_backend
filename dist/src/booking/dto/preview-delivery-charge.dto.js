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
exports.DeliveryChargePreviewResponseDto = exports.PreviewDeliveryChargeDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class PreviewDeliveryChargeDto {
}
exports.PreviewDeliveryChargeDto = PreviewDeliveryChargeDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Business Owner ID to get delivery settings from',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PreviewDeliveryChargeDto.prototype, "businessOwnerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Customer latitude for distance calculation',
        example: 19.0760,
        minimum: -90,
        maximum: 90,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-90),
    (0, class_validator_1.Max)(90),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], PreviewDeliveryChargeDto.prototype, "customerLatitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Customer longitude for distance calculation',
        example: 72.8777,
        minimum: -180,
        maximum: 180,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-180),
    (0, class_validator_1.Max)(180),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], PreviewDeliveryChargeDto.prototype, "customerLongitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'List of business service IDs to calculate order amount',
        type: [String],
        example: ['123e4567-e89b-12d3-a456-426614174000'],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)(4, { each: true }),
    __metadata("design:type", Array)
], PreviewDeliveryChargeDto.prototype, "businessServiceIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'List of service package IDs to calculate order amount',
        type: [String],
        example: ['789e0123-e45f-67g8-h901-234567890123'],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)(4, { each: true }),
    __metadata("design:type", Array)
], PreviewDeliveryChargeDto.prototype, "servicePackageIds", void 0);
class DeliveryChargePreviewResponseDto {
}
exports.DeliveryChargePreviewResponseDto = DeliveryChargePreviewResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Distance from business to customer in kilometers',
        example: 8.5,
    }),
    __metadata("design:type", Number)
], DeliveryChargePreviewResponseDto.prototype, "distanceKm", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Base delivery charge (fixed amount)',
        example: 0,
    }),
    __metadata("design:type", Number)
], DeliveryChargePreviewResponseDto.prototype, "baseCharge", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Distance-based charge',
        example: 35.0,
    }),
    __metadata("design:type", Number)
], DeliveryChargePreviewResponseDto.prototype, "distanceCharge", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total delivery charge',
        example: 35.0,
    }),
    __metadata("design:type", Number)
], DeliveryChargePreviewResponseDto.prototype, "totalDeliveryCharge", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether delivery is free',
        example: false,
    }),
    __metadata("design:type", Boolean)
], DeliveryChargePreviewResponseDto.prototype, "isFreeDelivery", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Reason for free delivery (if applicable)',
        example: 'Order amount ≥ ₹1000',
        required: false,
    }),
    __metadata("design:type", String)
], DeliveryChargePreviewResponseDto.prototype, "freeDeliveryReason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Detailed breakdown of charges',
        example: 'Distance: 8.50 km\nChargeable distance: 3.50 km (after 5 km free)\nDistance charge: 3.50 km × ₹10/km = ₹35.00\nTotal delivery charge: ₹35.00',
    }),
    __metadata("design:type", String)
], DeliveryChargePreviewResponseDto.prototype, "breakdown", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Estimated order amount (services total)',
        example: 1200.0,
    }),
    __metadata("design:type", Number)
], DeliveryChargePreviewResponseDto.prototype, "estimatedOrderAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Final total including delivery',
        example: 1235.0,
    }),
    __metadata("design:type", Number)
], DeliveryChargePreviewResponseDto.prototype, "finalTotal", void 0);
//# sourceMappingURL=preview-delivery-charge.dto.js.map