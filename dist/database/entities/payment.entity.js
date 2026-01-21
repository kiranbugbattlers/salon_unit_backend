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
exports.Payment = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const customer_entity_1 = require("./customer.entity");
const business_owner_entity_1 = require("./business-owner.entity");
const booking_entity_1 = require("./booking.entity");
const booking_request_entity_1 = require("./booking-request.entity");
const enums_1 = require("../../common/enums");
let Payment = class Payment {
};
exports.Payment = Payment;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Payment.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reference to booking request' }),
    (0, typeorm_1.Column)({ name: 'booking_request_id', type: 'uuid' }),
    __metadata("design:type", String)
], Payment.prototype, "bookingRequestId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reference to confirmed booking (set after payment success)', required: false }),
    (0, typeorm_1.Column)({ name: 'booking_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "bookingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'customer_id', type: 'uuid' }),
    __metadata("design:type", String)
], Payment.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'business_owner_id', type: 'uuid' }),
    __metadata("design:type", String)
], Payment.prototype, "businessOwnerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Razorpay Order ID (null for COD payments)', required: false }),
    (0, typeorm_1.Column)({ name: 'razorpay_order_id', unique: true, nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "razorpayOrderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Razorpay Payment ID (set after payment capture)', required: false }),
    (0, typeorm_1.Column)({ name: 'razorpay_payment_id', nullable: true, unique: true }),
    __metadata("design:type", String)
], Payment.prototype, "razorpayPaymentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Razorpay signature for verification', required: false }),
    (0, typeorm_1.Column)({ name: 'razorpay_signature', nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "razorpaySignature", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment amount' }),
    (0, typeorm_1.Column)({ name: 'amount', type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Payment.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Currency code', default: 'INR' }),
    (0, typeorm_1.Column)({ name: 'currency', length: 3, default: 'INR' }),
    __metadata("design:type", String)
], Payment.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.PaymentStatus }),
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'enum',
        enum: enums_1.PaymentStatus,
        default: enums_1.PaymentStatus.CREATED,
    }),
    __metadata("design:type", String)
], Payment.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment method used', required: false }),
    (0, typeorm_1.Column)({ name: 'payment_method', nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Card network (for card payments)', required: false }),
    (0, typeorm_1.Column)({ name: 'card_network', nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "cardNetwork", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Bank name (for netbanking/UPI)', required: false }),
    (0, typeorm_1.Column)({ name: 'bank_name', nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "bankName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Wallet name (for wallet payments)', required: false }),
    (0, typeorm_1.Column)({ name: 'wallet_name', nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "walletName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'UPI Virtual Payment Address', required: false }),
    (0, typeorm_1.Column)({ name: 'vpa', nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "vpa", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Additional Razorpay metadata (JSON)', required: false }),
    (0, typeorm_1.Column)({ name: 'payment_metadata', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Payment.prototype, "paymentMetadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Razorpay Refund ID', required: false }),
    (0, typeorm_1.Column)({ name: 'refund_id', nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "refundId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Refund amount', required: false }),
    (0, typeorm_1.Column)({ name: 'refund_amount', type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Payment.prototype, "refundAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Refund status', required: false }),
    (0, typeorm_1.Column)({ name: 'refund_status', nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "refundStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reason for refund', required: false }),
    (0, typeorm_1.Column)({ name: 'refund_reason', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "refundReason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Refund initiated timestamp', required: false }),
    (0, typeorm_1.Column)({ name: 'refund_initiated_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Payment.prototype, "refundInitiatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Refund processed timestamp', required: false }),
    (0, typeorm_1.Column)({ name: 'refund_processed_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Payment.prototype, "refundProcessedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Error code if payment failed', required: false }),
    (0, typeorm_1.Column)({ name: 'error_code', nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "errorCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Error description if payment failed', required: false }),
    (0, typeorm_1.Column)({ name: 'error_description', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "errorDescription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of retry attempts', default: 0 }),
    (0, typeorm_1.Column)({ name: 'retry_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Payment.prototype, "retryCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'When customer attempted payment', required: false }),
    (0, typeorm_1.Column)({ name: 'payment_attempted_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Payment.prototype, "paymentAttemptedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'When payment was completed', required: false }),
    (0, typeorm_1.Column)({ name: 'payment_completed_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Payment.prototype, "paymentCompletedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Payment.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Payment.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => booking_request_entity_1.BookingRequest, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'booking_request_id' }),
    __metadata("design:type", booking_request_entity_1.BookingRequest)
], Payment.prototype, "bookingRequest", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => booking_entity_1.Booking, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'booking_id' }),
    __metadata("design:type", booking_entity_1.Booking)
], Payment.prototype, "booking", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_entity_1.Customer, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'customer_id' }),
    __metadata("design:type", customer_entity_1.Customer)
], Payment.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => business_owner_entity_1.BusinessOwner, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'business_owner_id' }),
    __metadata("design:type", business_owner_entity_1.BusinessOwner)
], Payment.prototype, "businessOwner", void 0);
exports.Payment = Payment = __decorate([
    (0, typeorm_1.Entity)('payments'),
    (0, typeorm_1.Index)(['bookingRequestId']),
    (0, typeorm_1.Index)(['bookingId']),
    (0, typeorm_1.Index)(['customerId']),
    (0, typeorm_1.Index)(['razorpayOrderId'], { unique: true }),
    (0, typeorm_1.Index)(['razorpayPaymentId'], { unique: true, where: 'razorpay_payment_id IS NOT NULL' }),
    (0, typeorm_1.Index)(['status'])
], Payment);
//# sourceMappingURL=payment.entity.js.map