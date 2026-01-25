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
exports.SubscriptionTransaction = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const enums_1 = require("../../common/enums");
const business_subscription_entity_1 = require("./business-subscription.entity");
let SubscriptionTransaction = class SubscriptionTransaction {
    get formattedAmount() {
        return `${this.currency} ${this.amount}`;
    }
    get isSuccessful() {
        return this.status === enums_1.TransactionStatus.COMPLETED;
    }
    get isFailed() {
        return this.status === enums_1.TransactionStatus.FAILED;
    }
    get isPending() {
        return this.status === enums_1.TransactionStatus.PENDING;
    }
    get isRefunded() {
        return this.status === enums_1.TransactionStatus.REFUNDED;
    }
    get netAmount() {
        if (this.isRefunded && this.refundAmount) {
            return this.amount - this.refundAmount;
        }
        return this.amount;
    }
};
exports.SubscriptionTransaction = SubscriptionTransaction;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SubscriptionTransaction.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'business_subscription_id', type: 'uuid' }),
    __metadata("design:type", String)
], SubscriptionTransaction.prototype, "businessSubscriptionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'transaction_id', length: 255, nullable: true }),
    __metadata("design:type", String)
], SubscriptionTransaction.prototype, "transactionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], SubscriptionTransaction.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ length: 3, default: 'USD' }),
    __metadata("design:type", String)
], SubscriptionTransaction.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.TransactionStatus }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: enums_1.TransactionStatus,
        default: enums_1.TransactionStatus.PENDING,
    }),
    __metadata("design:type", String)
], SubscriptionTransaction.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'payment_method', length: 50, nullable: true }),
    __metadata("design:type", String)
], SubscriptionTransaction.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'payment_provider', length: 50, nullable: true }),
    __metadata("design:type", String)
], SubscriptionTransaction.prototype, "paymentProvider", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'provider_transaction_id', length: 255, nullable: true }),
    __metadata("design:type", String)
], SubscriptionTransaction.prototype, "providerTransactionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'failure_reason', type: 'text', nullable: true }),
    __metadata("design:type", String)
], SubscriptionTransaction.prototype, "failureReason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'refund_amount', type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], SubscriptionTransaction.prototype, "refundAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'refunded_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], SubscriptionTransaction.prototype, "refundedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'transaction_date', type: 'timestamp' }),
    __metadata("design:type", Date)
], SubscriptionTransaction.prototype, "transactionDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'metadata', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], SubscriptionTransaction.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'razorpay_order_id', length: 255, nullable: true }),
    __metadata("design:type", String)
], SubscriptionTransaction.prototype, "razorpayOrderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'razorpay_payment_id', length: 255, nullable: true }),
    __metadata("design:type", String)
], SubscriptionTransaction.prototype, "razorpayPaymentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'razorpay_signature', length: 255, nullable: true }),
    __metadata("design:type", String)
], SubscriptionTransaction.prototype, "razorpaySignature", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'payment_attempted_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], SubscriptionTransaction.prototype, "paymentAttemptedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'payment_completed_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], SubscriptionTransaction.prototype, "paymentCompletedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], SubscriptionTransaction.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], SubscriptionTransaction.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => business_subscription_entity_1.BusinessSubscription, (subscription) => subscription.transactions),
    (0, typeorm_1.JoinColumn)({ name: 'business_subscription_id' }),
    __metadata("design:type", business_subscription_entity_1.BusinessSubscription)
], SubscriptionTransaction.prototype, "businessSubscription", void 0);
exports.SubscriptionTransaction = SubscriptionTransaction = __decorate([
    (0, typeorm_1.Entity)('subscription_transactions')
], SubscriptionTransaction);
//# sourceMappingURL=subscription-transaction.entity.js.map