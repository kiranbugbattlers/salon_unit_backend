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
exports.CommissionPayment = exports.CommissionPaymentStatus = void 0;
const typeorm_1 = require("typeorm");
const business_owner_entity_1 = require("../../database/entities/business-owner.entity");
const wallet_entity_1 = require("../../database/entities/wallet.entity");
var CommissionPaymentStatus;
(function (CommissionPaymentStatus) {
    CommissionPaymentStatus["PENDING"] = "pending";
    CommissionPaymentStatus["PROCESSING"] = "processing";
    CommissionPaymentStatus["COMPLETED"] = "completed";
    CommissionPaymentStatus["FAILED"] = "failed";
    CommissionPaymentStatus["REFUNDED"] = "refunded";
})(CommissionPaymentStatus || (exports.CommissionPaymentStatus = CommissionPaymentStatus = {}));
let CommissionPayment = class CommissionPayment {
};
exports.CommissionPayment = CommissionPayment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CommissionPayment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'business_owner_id' }),
    __metadata("design:type", String)
], CommissionPayment.prototype, "businessOwnerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => business_owner_entity_1.BusinessOwner),
    (0, typeorm_1.JoinColumn)({ name: 'business_owner_id' }),
    __metadata("design:type", business_owner_entity_1.BusinessOwner)
], CommissionPayment.prototype, "businessOwner", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'wallet_id' }),
    __metadata("design:type", String)
], CommissionPayment.prototype, "walletId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => wallet_entity_1.Wallet),
    (0, typeorm_1.JoinColumn)({ name: 'wallet_id' }),
    __metadata("design:type", wallet_entity_1.Wallet)
], CommissionPayment.prototype, "wallet", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", String)
], CommissionPayment.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'razorpay_order_id', nullable: true }),
    __metadata("design:type", String)
], CommissionPayment.prototype, "razorpayOrderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'razorpay_payment_id', nullable: true }),
    __metadata("design:type", String)
], CommissionPayment.prototype, "razorpayPaymentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'razorpay_signature', nullable: true }),
    __metadata("design:type", String)
], CommissionPayment.prototype, "razorpaySignature", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: CommissionPaymentStatus,
        default: CommissionPaymentStatus.PENDING,
    }),
    __metadata("design:type", String)
], CommissionPayment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'balance_before', type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", String)
], CommissionPayment.prototype, "balanceBefore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'balance_after', type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", String)
], CommissionPayment.prototype, "balanceAfter", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_method', nullable: true }),
    __metadata("design:type", String)
], CommissionPayment.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_description', nullable: true }),
    __metadata("design:type", String)
], CommissionPayment.prototype, "paymentDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], CommissionPayment.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'failure_reason', type: 'text', nullable: true }),
    __metadata("design:type", String)
], CommissionPayment.prototype, "failureReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'defaulter_removed', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], CommissionPayment.prototype, "defaulterRemoved", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'processed_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], CommissionPayment.prototype, "processedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CommissionPayment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], CommissionPayment.prototype, "updatedAt", void 0);
exports.CommissionPayment = CommissionPayment = __decorate([
    (0, typeorm_1.Entity)('commission_payments')
], CommissionPayment);
//# sourceMappingURL=commission-payment.entity.js.map