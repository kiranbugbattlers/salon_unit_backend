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
exports.WalletTransaction = exports.WalletTransactionStatus = exports.WalletTransactionCategory = exports.WalletTransactionType = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const wallet_entity_1 = require("./wallet.entity");
const booking_entity_1 = require("./booking.entity");
const payment_entity_1 = require("./payment.entity");
const monthly_settlement_entity_1 = require("./monthly-settlement.entity");
var WalletTransactionType;
(function (WalletTransactionType) {
    WalletTransactionType["CREDIT"] = "credit";
    WalletTransactionType["DEBIT"] = "debit";
})(WalletTransactionType || (exports.WalletTransactionType = WalletTransactionType = {}));
var WalletTransactionCategory;
(function (WalletTransactionCategory) {
    WalletTransactionCategory["BOOKING_PAYMENT"] = "booking_payment";
    WalletTransactionCategory["COMMISSION"] = "commission";
    WalletTransactionCategory["COMMISSION_PAYMENT"] = "commission_payment";
    WalletTransactionCategory["SETTLEMENT"] = "settlement";
    WalletTransactionCategory["REWARD_POINTS"] = "reward_points";
    WalletTransactionCategory["REFUND"] = "refund";
    WalletTransactionCategory["ADJUSTMENT"] = "adjustment";
    WalletTransactionCategory["WITHDRAWAL"] = "withdrawal";
})(WalletTransactionCategory || (exports.WalletTransactionCategory = WalletTransactionCategory = {}));
var WalletTransactionStatus;
(function (WalletTransactionStatus) {
    WalletTransactionStatus["PENDING"] = "pending";
    WalletTransactionStatus["COMPLETED"] = "completed";
    WalletTransactionStatus["FAILED"] = "failed";
    WalletTransactionStatus["REVERSED"] = "reversed";
})(WalletTransactionStatus || (exports.WalletTransactionStatus = WalletTransactionStatus = {}));
let WalletTransaction = class WalletTransaction {
};
exports.WalletTransaction = WalletTransaction;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], WalletTransaction.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Wallet ID this transaction belongs to' }),
    (0, typeorm_1.Column)({ name: 'wallet_id', type: 'uuid' }),
    __metadata("design:type", String)
], WalletTransaction.prototype, "walletId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: WalletTransactionType, description: 'Transaction type: credit or debit' }),
    (0, typeorm_1.Column)({
        name: 'type',
        type: 'enum',
        enum: WalletTransactionType,
    }),
    __metadata("design:type", String)
], WalletTransaction.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: WalletTransactionCategory, description: 'Transaction category' }),
    (0, typeorm_1.Column)({
        name: 'category',
        type: 'enum',
        enum: WalletTransactionCategory,
    }),
    __metadata("design:type", String)
], WalletTransaction.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction amount in INR' }),
    (0, typeorm_1.Column)({ name: 'amount', type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], WalletTransaction.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Wallet balance before this transaction' }),
    (0, typeorm_1.Column)({ name: 'balance_before', type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], WalletTransaction.prototype, "balanceBefore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Wallet balance after this transaction' }),
    (0, typeorm_1.Column)({ name: 'balance_after', type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], WalletTransaction.prototype, "balanceAfter", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Related booking ID', required: false }),
    (0, typeorm_1.Column)({ name: 'booking_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], WalletTransaction.prototype, "bookingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Related payment ID', required: false }),
    (0, typeorm_1.Column)({ name: 'payment_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], WalletTransaction.prototype, "paymentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Related settlement ID', required: false }),
    (0, typeorm_1.Column)({ name: 'settlement_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], WalletTransaction.prototype, "settlementId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction description' }),
    (0, typeorm_1.Column)({ name: 'description', type: 'text' }),
    __metadata("design:type", String)
], WalletTransaction.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Additional metadata (JSON)', required: false }),
    (0, typeorm_1.Column)({ name: 'metadata', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], WalletTransaction.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: WalletTransactionStatus, description: 'Transaction status' }),
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'enum',
        enum: WalletTransactionStatus,
        default: WalletTransactionStatus.COMPLETED,
    }),
    __metadata("design:type", String)
], WalletTransaction.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction timestamp' }),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], WalletTransaction.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => wallet_entity_1.Wallet, (wallet) => wallet.transactions, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'wallet_id' }),
    __metadata("design:type", wallet_entity_1.Wallet)
], WalletTransaction.prototype, "wallet", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => booking_entity_1.Booking, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'booking_id' }),
    __metadata("design:type", booking_entity_1.Booking)
], WalletTransaction.prototype, "booking", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => payment_entity_1.Payment, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'payment_id' }),
    __metadata("design:type", payment_entity_1.Payment)
], WalletTransaction.prototype, "payment", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => monthly_settlement_entity_1.MonthlySettlement, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'settlement_id' }),
    __metadata("design:type", monthly_settlement_entity_1.MonthlySettlement)
], WalletTransaction.prototype, "settlement", void 0);
exports.WalletTransaction = WalletTransaction = __decorate([
    (0, typeorm_1.Entity)('wallet_transactions'),
    (0, typeorm_1.Index)(['walletId', 'createdAt']),
    (0, typeorm_1.Index)(['type', 'category']),
    (0, typeorm_1.Index)(['bookingId']),
    (0, typeorm_1.Index)(['paymentId']),
    (0, typeorm_1.Index)(['settlementId']),
    (0, typeorm_1.Index)(['status'])
], WalletTransaction);
//# sourceMappingURL=wallet-transaction.entity.js.map