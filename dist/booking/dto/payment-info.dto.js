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
exports.PaymentInfoDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class PaymentInfoDto {
}
exports.PaymentInfoDto = PaymentInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Payment method used',
        enum: ['online', 'cod'],
        example: 'upi',
        nullable: true,
    }),
    __metadata("design:type", String)
], PaymentInfoDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Payment status',
        enum: ['pending', 'completed', 'not_required'],
        example: 'completed',
    }),
    __metadata("design:type", String)
], PaymentInfoDto.prototype, "paymentStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Payment amount',
        example: 500.00,
    }),
    __metadata("design:type", Number)
], PaymentInfoDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Razorpay payment ID (only for online payments)',
        example: 'pay_xyz123',
        nullable: true,
    }),
    __metadata("design:type", String)
], PaymentInfoDto.prototype, "razorpayPaymentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timestamp when payment was completed (only for online payments)',
        example: '2024-01-15T10:30:00Z',
        nullable: true,
    }),
    __metadata("design:type", Date)
], PaymentInfoDto.prototype, "paymentCompletedAt", void 0);
//# sourceMappingURL=payment-info.dto.js.map