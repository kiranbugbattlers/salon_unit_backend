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
exports.PaymentDetailsResponseDto = exports.PaymentDetailsDataDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const api_response_dto_1 = require("../../common/dto/api-response.dto");
const payment_entity_1 = require("../../database/entities/payment.entity");
const booking_entity_1 = require("../../database/entities/booking.entity");
class PaymentDetailsDataDto {
}
exports.PaymentDetailsDataDto = PaymentDetailsDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether a payment record exists for this booking request',
        example: true,
    }),
    __metadata("design:type", Boolean)
], PaymentDetailsDataDto.prototype, "paymentExists", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current payment status',
        example: 'CREATED',
        enum: ['NOT_CREATED', 'CREATED', 'SUCCESS', 'FAILED'],
    }),
    __metadata("design:type", String)
], PaymentDetailsDataDto.prototype, "paymentStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Booking request details',
    }),
    __metadata("design:type", Object)
], PaymentDetailsDataDto.prototype, "bookingRequest", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Payment details (null if no payment record exists)',
        nullable: true,
        type: () => payment_entity_1.Payment,
    }),
    __metadata("design:type", payment_entity_1.Payment)
], PaymentDetailsDataDto.prototype, "payment", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Confirmed booking details (null if not confirmed yet)',
        nullable: true,
        type: () => booking_entity_1.Booking,
    }),
    __metadata("design:type", booking_entity_1.Booking)
], PaymentDetailsDataDto.prototype, "booking", void 0);
class PaymentDetailsResponseDto extends api_response_dto_1.ApiResponseDto {
}
exports.PaymentDetailsResponseDto = PaymentDetailsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], PaymentDetailsResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], PaymentDetailsResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Payment details retrieved successfully',
        description: 'Response message indicating the result'
    }),
    __metadata("design:type", String)
], PaymentDetailsResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: PaymentDetailsDataDto }),
    __metadata("design:type", PaymentDetailsDataDto)
], PaymentDetailsResponseDto.prototype, "data", void 0);
//# sourceMappingURL=payment-details-response.dto.js.map