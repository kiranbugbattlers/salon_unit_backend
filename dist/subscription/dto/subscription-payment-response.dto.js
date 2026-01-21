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
exports.SubscriptionPaymentStatusResponseDto = exports.SubscriptionPaymentStatusDataDto = exports.VerifySubscriptionPaymentResponseDto = exports.VerifySubscriptionPaymentDataDto = exports.SubscriptionPaymentOrderResponseDto = exports.SubscriptionPaymentOrderDataDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const subscription_response_dto_1 = require("./subscription-response.dto");
class SubscriptionPaymentOrderDataDto {
}
exports.SubscriptionPaymentOrderDataDto = SubscriptionPaymentOrderDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Razorpay Order ID' }),
    __metadata("design:type", String)
], SubscriptionPaymentOrderDataDto.prototype, "orderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Amount in paise (smallest currency unit)' }),
    __metadata("design:type", Number)
], SubscriptionPaymentOrderDataDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Currency code' }),
    __metadata("design:type", String)
], SubscriptionPaymentOrderDataDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Razorpay Key ID for Flutter SDK' }),
    __metadata("design:type", String)
], SubscriptionPaymentOrderDataDto.prototype, "razorpayKeyId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business Subscription ID' }),
    __metadata("design:type", String)
], SubscriptionPaymentOrderDataDto.prototype, "subscriptionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Subscription Plan Name' }),
    __metadata("design:type", String)
], SubscriptionPaymentOrderDataDto.prototype, "planName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Description of subscription features' }),
    __metadata("design:type", String)
], SubscriptionPaymentOrderDataDto.prototype, "description", void 0);
class SubscriptionPaymentOrderResponseDto {
}
exports.SubscriptionPaymentOrderResponseDto = SubscriptionPaymentOrderResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SubscriptionPaymentOrderResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], SubscriptionPaymentOrderResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SubscriptionPaymentOrderResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: SubscriptionPaymentOrderDataDto }),
    __metadata("design:type", SubscriptionPaymentOrderDataDto)
], SubscriptionPaymentOrderResponseDto.prototype, "data", void 0);
class VerifySubscriptionPaymentDataDto {
}
exports.VerifySubscriptionPaymentDataDto = VerifySubscriptionPaymentDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment verification status' }),
    __metadata("design:type", String)
], VerifySubscriptionPaymentDataDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business Subscription ID' }),
    __metadata("design:type", String)
], VerifySubscriptionPaymentDataDto.prototype, "subscriptionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Razorpay Payment ID' }),
    __metadata("design:type", String)
], VerifySubscriptionPaymentDataDto.prototype, "razorpayPaymentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Subscription details', type: subscription_response_dto_1.BusinessSubscriptionResponseDto }),
    __metadata("design:type", subscription_response_dto_1.BusinessSubscriptionResponseDto)
], VerifySubscriptionPaymentDataDto.prototype, "subscription", void 0);
class VerifySubscriptionPaymentResponseDto {
}
exports.VerifySubscriptionPaymentResponseDto = VerifySubscriptionPaymentResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], VerifySubscriptionPaymentResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], VerifySubscriptionPaymentResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], VerifySubscriptionPaymentResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: VerifySubscriptionPaymentDataDto }),
    __metadata("design:type", VerifySubscriptionPaymentDataDto)
], VerifySubscriptionPaymentResponseDto.prototype, "data", void 0);
class SubscriptionPaymentStatusDataDto {
}
exports.SubscriptionPaymentStatusDataDto = SubscriptionPaymentStatusDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business Subscription ID' }),
    __metadata("design:type", String)
], SubscriptionPaymentStatusDataDto.prototype, "subscriptionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current payment status' }),
    __metadata("design:type", String)
], SubscriptionPaymentStatusDataDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Razorpay Order ID if exists' }),
    __metadata("design:type", String)
], SubscriptionPaymentStatusDataDto.prototype, "razorpayOrderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Can retry payment' }),
    __metadata("design:type", Boolean)
], SubscriptionPaymentStatusDataDto.prototype, "canRetry", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Subscription plan name' }),
    __metadata("design:type", String)
], SubscriptionPaymentStatusDataDto.prototype, "planName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Amount to pay' }),
    __metadata("design:type", Number)
], SubscriptionPaymentStatusDataDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Currency' }),
    __metadata("design:type", String)
], SubscriptionPaymentStatusDataDto.prototype, "currency", void 0);
class SubscriptionPaymentStatusResponseDto {
}
exports.SubscriptionPaymentStatusResponseDto = SubscriptionPaymentStatusResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SubscriptionPaymentStatusResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], SubscriptionPaymentStatusResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SubscriptionPaymentStatusResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: SubscriptionPaymentStatusDataDto }),
    __metadata("design:type", SubscriptionPaymentStatusDataDto)
], SubscriptionPaymentStatusResponseDto.prototype, "data", void 0);
//# sourceMappingURL=subscription-payment-response.dto.js.map