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
exports.VerifyPaymentDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class VerifyPaymentDto {
}
exports.VerifyPaymentDto = VerifyPaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Booking ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VerifyPaymentDto.prototype, "bookingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Razorpay Order ID',
        example: 'order_MhIkjJHGfdsert',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VerifyPaymentDto.prototype, "razorpayOrderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Razorpay Payment ID (received after payment)',
        example: 'pay_MhIkjJHGfdsert',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VerifyPaymentDto.prototype, "razorpayPaymentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Razorpay Signature for verification',
        example: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VerifyPaymentDto.prototype, "razorpaySignature", void 0);
//# sourceMappingURL=verify-payment.dto.js.map