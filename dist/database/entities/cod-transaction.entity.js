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
exports.CODTransaction = exports.CODTransactionStatus = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const booking_entity_1 = require("./booking.entity");
const business_owner_entity_1 = require("./business-owner.entity");
const customer_entity_1 = require("./customer.entity");
const monthly_settlement_entity_1 = require("./monthly-settlement.entity");
var CODTransactionStatus;
(function (CODTransactionStatus) {
    CODTransactionStatus["PENDING"] = "pending";
    CODTransactionStatus["SETTLED"] = "settled";
    CODTransactionStatus["DISPUTED"] = "disputed";
})(CODTransactionStatus || (exports.CODTransactionStatus = CODTransactionStatus = {}));
let CODTransaction = class CODTransaction {
};
exports.CODTransaction = CODTransaction;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CODTransaction.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Booking ID this COD transaction is for' }),
    (0, typeorm_1.Column)({ name: 'booking_id' }),
    __metadata("design:type", String)
], CODTransaction.prototype, "bookingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business owner ID who collected the COD' }),
    (0, typeorm_1.Column)({ name: 'business_owner_id' }),
    __metadata("design:type", String)
], CODTransaction.prototype, "businessOwnerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer ID who paid COD' }),
    (0, typeorm_1.Column)({ name: 'customer_id' }),
    __metadata("design:type", String)
], CODTransaction.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total COD amount collected in INR' }),
    (0, typeorm_1.Column)({ name: 'amount', type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], CODTransaction.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Commission amount business owner owes to company' }),
    (0, typeorm_1.Column)({ name: 'commission_amount', type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], CODTransaction.prototype, "commissionAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Net amount business owner keeps (amount - commission)' }),
    (0, typeorm_1.Column)({ name: 'net_amount', type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], CODTransaction.prototype, "netAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'When COD was collected (service completion time)' }),
    (0, typeorm_1.Column)({ name: 'collected_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], CODTransaction.prototype, "collectedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Month in which this was settled (YYYY-MM)', required: false }),
    (0, typeorm_1.Column)({ name: 'settled_in_month', type: 'varchar', length: 7, nullable: true }),
    __metadata("design:type", String)
], CODTransaction.prototype, "settledInMonth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Settlement ID if included in settlement', required: false }),
    (0, typeorm_1.Column)({ name: 'settlement_id', nullable: true }),
    __metadata("design:type", String)
], CODTransaction.prototype, "settlementId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: CODTransactionStatus, description: 'COD transaction status' }),
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'enum',
        enum: CODTransactionStatus,
        default: CODTransactionStatus.PENDING,
    }),
    __metadata("design:type", String)
], CODTransaction.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Additional notes', required: false }),
    (0, typeorm_1.Column)({ name: 'notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], CODTransaction.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CODTransaction.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => booking_entity_1.Booking, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'booking_id' }),
    __metadata("design:type", booking_entity_1.Booking)
], CODTransaction.prototype, "booking", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => business_owner_entity_1.BusinessOwner, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'business_owner_id' }),
    __metadata("design:type", business_owner_entity_1.BusinessOwner)
], CODTransaction.prototype, "businessOwner", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_entity_1.Customer, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'customer_id' }),
    __metadata("design:type", customer_entity_1.Customer)
], CODTransaction.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => monthly_settlement_entity_1.MonthlySettlement, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'settlement_id' }),
    __metadata("design:type", monthly_settlement_entity_1.MonthlySettlement)
], CODTransaction.prototype, "settlement", void 0);
exports.CODTransaction = CODTransaction = __decorate([
    (0, typeorm_1.Entity)('cod_transactions'),
    (0, typeorm_1.Index)(['bookingId'], { unique: true }),
    (0, typeorm_1.Index)(['businessOwnerId', 'collectedAt']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['settledInMonth']),
    (0, typeorm_1.Index)(['settlementId'])
], CODTransaction);
//# sourceMappingURL=cod-transaction.entity.js.map