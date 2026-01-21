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
exports.PaymentOrderResponseDto = exports.PaymentOrderDataDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const api_response_dto_1 = require("../../common/dto/api-response.dto");
class PaymentOrderDataDto {
}
exports.PaymentOrderDataDto = PaymentOrderDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Razorpay Order ID',
        example: 'order_MhIkjJHGfdsert',
    }),
    __metadata("design:type", String)
], PaymentOrderDataDto.prototype, "orderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Payment amount in smallest currency unit (paise for INR)',
        example: 50000,
    }),
    __metadata("design:type", Number)
], PaymentOrderDataDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Currency code',
        example: 'INR',
    }),
    __metadata("design:type", String)
], PaymentOrderDataDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Razorpay Key ID for frontend integration',
        example: 'rzp_test_xxxxxxxxxxxxx',
    }),
    __metadata("design:type", String)
], PaymentOrderDataDto.prototype, "razorpayKeyId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Booking Request ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], PaymentOrderDataDto.prototype, "bookingRequestId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Business name',
        example: 'Elite Hair Studio',
    }),
    __metadata("design:type", String)
], PaymentOrderDataDto.prototype, "businessName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Service description',
        example: 'Hair Cut - Professional hair cutting service',
    }),
    __metadata("design:type", String)
], PaymentOrderDataDto.prototype, "description", void 0);
class PaymentOrderResponseDto extends api_response_dto_1.ApiResponseDto {
}
exports.PaymentOrderResponseDto = PaymentOrderResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], PaymentOrderResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], PaymentOrderResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Payment order created successfully' }),
    __metadata("design:type", String)
], PaymentOrderResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: PaymentOrderDataDto }),
    __metadata("design:type", PaymentOrderDataDto)
], PaymentOrderResponseDto.prototype, "data", void 0);
//# sourceMappingURL=payment-order-response.dto.js.map