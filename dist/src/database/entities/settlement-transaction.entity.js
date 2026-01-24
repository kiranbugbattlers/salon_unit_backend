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
exports.SettlementTransaction = exports.PaymentMethodType = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const monthly_settlement_entity_1 = require("./monthly-settlement.entity");
const booking_entity_1 = require("./booking.entity");
const commission_transaction_entity_1 = require("./commission-transaction.entity");
var PaymentMethodType;
(function (PaymentMethodType) {
    PaymentMethodType["ONLINE"] = "online";
    PaymentMethodType["COD"] = "cod";
})(PaymentMethodType || (exports.PaymentMethodType = PaymentMethodType = {}));
let SettlementTransaction = class SettlementTransaction {
};
exports.SettlementTransaction = SettlementTransaction;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SettlementTransaction.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Monthly settlement ID this transaction belongs to' }),
    (0, typeorm_1.Column)({ name: 'settlement_id', type: 'uuid' }),
    __metadata("design:type", String)
], SettlementTransaction.prototype, "settlementId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Booking ID included in this settlement' }),
    (0, typeorm_1.Column)({ name: 'booking_id', type: 'uuid' }),
    __metadata("design:type", String)
], SettlementTransaction.prototype, "bookingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Commission transaction ID', required: false }),
    (0, typeorm_1.Column)({ name: 'commission_transaction_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], SettlementTransaction.prototype, "commissionTransactionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Booking amount' }),
    (0, typeorm_1.Column)({ name: 'amount', type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], SettlementTransaction.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Commission amount charged' }),
    (0, typeorm_1.Column)({ name: 'commission_amount', type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], SettlementTransaction.prototype, "commissionAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Net amount (amount - commission)' }),
    (0, typeorm_1.Column)({ name: 'net_amount', type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], SettlementTransaction.prototype, "netAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: PaymentMethodType, description: 'Payment method used for this booking' }),
    (0, typeorm_1.Column)({
        name: 'payment_method',
        type: 'enum',
        enum: PaymentMethodType,
    }),
    __metadata("design:type", String)
], SettlementTransaction.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Booking completion date' }),
    (0, typeorm_1.Column)({ name: 'booking_completed_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], SettlementTransaction.prototype, "bookingCompletedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], SettlementTransaction.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => monthly_settlement_entity_1.MonthlySettlement, (settlement) => settlement.transactions, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'settlement_id' }),
    __metadata("design:type", monthly_settlement_entity_1.MonthlySettlement)
], SettlementTransaction.prototype, "settlement", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => booking_entity_1.Booking, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'booking_id' }),
    __metadata("design:type", booking_entity_1.Booking)
], SettlementTransaction.prototype, "booking", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => commission_transaction_entity_1.CommissionTransaction, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'commission_transaction_id' }),
    __metadata("design:type", commission_transaction_entity_1.CommissionTransaction)
], SettlementTransaction.prototype, "commissionTransaction", void 0);
exports.SettlementTransaction = SettlementTransaction = __decorate([
    (0, typeorm_1.Entity)('settlement_transactions'),
    (0, typeorm_1.Index)(['settlementId']),
    (0, typeorm_1.Index)(['bookingId']),
    (0, typeorm_1.Index)(['paymentMethod'])
], SettlementTransaction);
//# sourceMappingURL=settlement-transaction.entity.js.map