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
exports.CommissionPaymentVerificationResponseDto = exports.VerifyCommissionPaymentDto = exports.CommissionPaymentResponseDto = exports.CreateCommissionPaymentDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateCommissionPaymentDto {
}
exports.CreateCommissionPaymentDto = CreateCommissionPaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Amount to pay towards commission debt',
        example: 500.00,
        minimum: 1,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateCommissionPaymentDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional notes for the payment',
        example: 'Payment for October commission',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCommissionPaymentDto.prototype, "notes", void 0);
class CommissionPaymentResponseDto {
}
exports.CommissionPaymentResponseDto = CommissionPaymentResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Razorpay order ID',
        example: 'order_MHbKuWMR7f8CZo',
    }),
    __metadata("design:type", String)
], CommissionPaymentResponseDto.prototype, "orderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Amount in paise (INR)',
        example: 50000,
    }),
    __metadata("design:type", Number)
], CommissionPaymentResponseDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Currency',
        example: 'INR',
    }),
    __metadata("design:type", String)
], CommissionPaymentResponseDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Razorpay key for frontend',
        example: 'rzp_test_xxxxx',
    }),
    __metadata("design:type", String)
], CommissionPaymentResponseDto.prototype, "razorpayKey", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Payment description',
        example: 'Commission payment for Test Salon',
    }),
    __metadata("design:type", String)
], CommissionPaymentResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Business owner name',
        example: 'John Doe',
    }),
    __metadata("design:type", String)
], CommissionPaymentResponseDto.prototype, "businessOwnerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Business owner phone',
        example: '9876543210',
    }),
    __metadata("design:type", String)
], CommissionPaymentResponseDto.prototype, "businessOwnerPhone", void 0);
class VerifyCommissionPaymentDto {
}
exports.VerifyCommissionPaymentDto = VerifyCommissionPaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Razorpay order ID',
        example: 'order_MHbKuWMR7f8CZo',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifyCommissionPaymentDto.prototype, "razorpayOrderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Razorpay payment ID',
        example: 'pay_MHbKuWMR7f8CZo',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifyCommissionPaymentDto.prototype, "razorpayPaymentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Razorpay signature for verification',
        example: 'signature_here',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifyCommissionPaymentDto.prototype, "razorpaySignature", void 0);
class CommissionPaymentVerificationResponseDto {
}
exports.CommissionPaymentVerificationResponseDto = CommissionPaymentVerificationResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Payment verification status',
        example: true,
    }),
    __metadata("design:type", Boolean)
], CommissionPaymentVerificationResponseDto.prototype, "verified", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Payment amount',
        example: 500.00,
    }),
    __metadata("design:type", Number)
], CommissionPaymentVerificationResponseDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'New wallet balance after payment',
        example: 0.00,
    }),
    __metadata("design:type", Number)
], CommissionPaymentVerificationResponseDto.prototype, "newBalance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Is defaulter status removed',
        example: true,
    }),
    __metadata("design:type", Boolean)
], CommissionPaymentVerificationResponseDto.prototype, "defaulterStatusRemoved", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Payment ID for reference',
        example: 'uuid-here',
    }),
    __metadata("design:type", String)
], CommissionPaymentVerificationResponseDto.prototype, "paymentId", void 0);
//# sourceMappingURL=commission-payment.dto.js.map