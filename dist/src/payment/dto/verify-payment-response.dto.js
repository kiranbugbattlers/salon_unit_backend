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
exports.VerifyPaymentResponseDto = exports.VerifyPaymentDataDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const api_response_dto_1 = require("../../common/dto/api-response.dto");
class VerifyPaymentDataDto {
}
exports.VerifyPaymentDataDto = VerifyPaymentDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Payment verification status',
        example: 'confirmed',
    }),
    __metadata("design:type", String)
], VerifyPaymentDataDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'OTP code for booking verification',
        example: '123456',
    }),
    __metadata("design:type", String)
], VerifyPaymentDataDto.prototype, "otpCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Confirmed Booking ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], VerifyPaymentDataDto.prototype, "bookingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Payment ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], VerifyPaymentDataDto.prototype, "paymentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Razorpay Payment ID',
        example: 'pay_MhIkjJHGfdsert',
    }),
    __metadata("design:type", String)
], VerifyPaymentDataDto.prototype, "razorpayPaymentId", void 0);
class VerifyPaymentResponseDto extends api_response_dto_1.ApiResponseDto {
}
exports.VerifyPaymentResponseDto = VerifyPaymentResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], VerifyPaymentResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], VerifyPaymentResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Payment verified successfully. Booking confirmed.' }),
    __metadata("design:type", String)
], VerifyPaymentResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: VerifyPaymentDataDto }),
    __metadata("design:type", VerifyPaymentDataDto)
], VerifyPaymentResponseDto.prototype, "data", void 0);
//# sourceMappingURL=verify-payment-response.dto.js.map