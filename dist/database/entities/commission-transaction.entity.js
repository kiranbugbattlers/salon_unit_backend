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
exports.CommissionTransaction = exports.CommissionTransactionStatus = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const booking_entity_1 = require("./booking.entity");
const payment_entity_1 = require("./payment.entity");
const business_owner_entity_1 = require("./business-owner.entity");
const customer_entity_1 = require("./customer.entity");
const wallet_transaction_entity_1 = require("./wallet-transaction.entity");
const commission_config_entity_1 = require("./commission-config.entity");
var CommissionTransactionStatus;
(function (CommissionTransactionStatus) {
    CommissionTransactionStatus["CALCULATED"] = "calculated";
    CommissionTransactionStatus["APPLIED"] = "applied";
    CommissionTransactionStatus["REVERSED"] = "reversed";
    CommissionTransactionStatus["FAILED"] = "failed";
})(CommissionTransactionStatus || (exports.CommissionTransactionStatus = CommissionTransactionStatus = {}));
let CommissionTransaction = class CommissionTransaction {
};
exports.CommissionTransaction = CommissionTransaction;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CommissionTransaction.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Booking ID this commission is for' }),
    (0, typeorm_1.Column)({ name: 'booking_id', type: 'uuid' }),
    __metadata("design:type", String)
], CommissionTransaction.prototype, "bookingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment ID related to this commission', required: false }),
    (0, typeorm_1.Column)({ name: 'payment_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], CommissionTransaction.prototype, "paymentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business owner ID' }),
    (0, typeorm_1.Column)({ name: 'business_owner_id', type: 'uuid' }),
    __metadata("design:type", String)
], CommissionTransaction.prototype, "businessOwnerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer ID' }),
    (0, typeorm_1.Column)({ name: 'customer_id', type: 'uuid' }),
    __metadata("design:type", String)
], CommissionTransaction.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Commission config ID used for calculation' }),
    (0, typeorm_1.Column)({ name: 'commission_config_id', type: 'uuid' }),
    __metadata("design:type", String)
], CommissionTransaction.prototype, "commissionConfigId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total booking amount' }),
    (0, typeorm_1.Column)({ name: 'booking_amount', type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], CommissionTransaction.prototype, "bookingAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business owner commission percentage applied' }),
    (0, typeorm_1.Column)({
        name: 'business_owner_commission_percent',
        type: 'decimal',
        precision: 5,
        scale: 2,
    }),
    __metadata("design:type", Number)
], CommissionTransaction.prototype, "businessOwnerCommissionPercent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business owner commission amount in INR' }),
    (0, typeorm_1.Column)({
        name: 'business_owner_commission_amount',
        type: 'decimal',
        precision: 10,
        scale: 2,
    }),
    __metadata("design:type", Number)
], CommissionTransaction.prototype, "businessOwnerCommissionAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer reward percentage applied' }),
    (0, typeorm_1.Column)({
        name: 'customer_reward_percent',
        type: 'decimal',
        precision: 5,
        scale: 2,
    }),
    __metadata("design:type", Number)
], CommissionTransaction.prototype, "customerRewardPercent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer reward amount in INR' }),
    (0, typeorm_1.Column)({
        name: 'customer_reward_amount',
        type: 'decimal',
        precision: 10,
        scale: 2,
    }),
    __metadata("design:type", Number)
], CommissionTransaction.prototype, "customerRewardAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business owner wallet transaction ID', required: false }),
    (0, typeorm_1.Column)({ name: 'business_owner_wallet_transaction_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], CommissionTransaction.prototype, "businessOwnerWalletTransactionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer wallet transaction ID', required: false }),
    (0, typeorm_1.Column)({ name: 'customer_wallet_transaction_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], CommissionTransaction.prototype, "customerWalletTransactionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: CommissionTransactionStatus, description: 'Commission status' }),
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'enum',
        enum: CommissionTransactionStatus,
        default: CommissionTransactionStatus.CALCULATED,
    }),
    __metadata("design:type", String)
], CommissionTransaction.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'When commission was calculated' }),
    (0, typeorm_1.Column)({ name: 'calculated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], CommissionTransaction.prototype, "calculatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CommissionTransaction.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => booking_entity_1.Booking, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'booking_id' }),
    __metadata("design:type", booking_entity_1.Booking)
], CommissionTransaction.prototype, "booking", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => payment_entity_1.Payment, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'payment_id' }),
    __metadata("design:type", payment_entity_1.Payment)
], CommissionTransaction.prototype, "payment", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => business_owner_entity_1.BusinessOwner, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'business_owner_id' }),
    __metadata("design:type", business_owner_entity_1.BusinessOwner)
], CommissionTransaction.prototype, "businessOwner", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_entity_1.Customer, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'customer_id' }),
    __metadata("design:type", customer_entity_1.Customer)
], CommissionTransaction.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => commission_config_entity_1.CommissionConfig, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'commission_config_id' }),
    __metadata("design:type", commission_config_entity_1.CommissionConfig)
], CommissionTransaction.prototype, "commissionConfig", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => wallet_transaction_entity_1.WalletTransaction, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'business_owner_wallet_transaction_id' }),
    __metadata("design:type", wallet_transaction_entity_1.WalletTransaction)
], CommissionTransaction.prototype, "businessOwnerWalletTransaction", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => wallet_transaction_entity_1.WalletTransaction, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'customer_wallet_transaction_id' }),
    __metadata("design:type", wallet_transaction_entity_1.WalletTransaction)
], CommissionTransaction.prototype, "customerWalletTransaction", void 0);
exports.CommissionTransaction = CommissionTransaction = __decorate([
    (0, typeorm_1.Entity)('commission_transactions'),
    (0, typeorm_1.Index)(['bookingId']),
    (0, typeorm_1.Index)(['paymentId']),
    (0, typeorm_1.Index)(['businessOwnerId', 'calculatedAt']),
    (0, typeorm_1.Index)(['customerId', 'calculatedAt']),
    (0, typeorm_1.Index)(['status'])
], CommissionTransaction);
//# sourceMappingURL=commission-transaction.entity.js.map