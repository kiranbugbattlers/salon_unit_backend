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
exports.DailySettlement = exports.SettlementPaidStatus = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const business_owner_entity_1 = require("./business-owner.entity");
var SettlementPaidStatus;
(function (SettlementPaidStatus) {
    SettlementPaidStatus["PENDING"] = "pending";
    SettlementPaidStatus["PROCESSING"] = "processing";
    SettlementPaidStatus["PAID"] = "paid";
    SettlementPaidStatus["FAILED"] = "failed";
})(SettlementPaidStatus || (exports.SettlementPaidStatus = SettlementPaidStatus = {}));
let DailySettlement = class DailySettlement {
};
exports.DailySettlement = DailySettlement;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DailySettlement.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business owner ID' }),
    (0, typeorm_1.Column)({ name: 'business_owner_id' }),
    __metadata("design:type", String)
], DailySettlement.prototype, "businessOwnerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Settlement date' }),
    (0, typeorm_1.Column)({ name: 'settlement_date', type: 'date' }),
    __metadata("design:type", Date)
], DailySettlement.prototype, "settlementDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Owner name' }),
    (0, typeorm_1.Column)({ name: 'owner_name', type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], DailySettlement.prototype, "ownerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Salon name' }),
    (0, typeorm_1.Column)({ name: 'salon_name', type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], DailySettlement.prototype, "salonName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Email' }),
    (0, typeorm_1.Column)({ name: 'email', type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], DailySettlement.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Mobile number' }),
    (0, typeorm_1.Column)({ name: 'mobile_number', type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], DailySettlement.prototype, "mobileNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Address' }),
    (0, typeorm_1.Column)({ name: 'address', type: 'text', nullable: true }),
    __metadata("design:type", String)
], DailySettlement.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total transactions count' }),
    (0, typeorm_1.Column)({ name: 'total_transactions_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], DailySettlement.prototype, "totalTransactionsCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total transactions amount' }),
    (0, typeorm_1.Column)({ name: 'total_transactions_amount', type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DailySettlement.prototype, "totalTransactionsAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total cash amount' }),
    (0, typeorm_1.Column)({ name: 'total_cash_amount', type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DailySettlement.prototype, "totalCashAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total online amount' }),
    (0, typeorm_1.Column)({ name: 'total_online_amount', type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DailySettlement.prototype, "totalOnlineAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Commission percent' }),
    (0, typeorm_1.Column)({ name: 'commission_percent', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DailySettlement.prototype, "commissionPercent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Commission amount' }),
    (0, typeorm_1.Column)({ name: 'commission_amount', type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DailySettlement.prototype, "commissionAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'GST percent' }),
    (0, typeorm_1.Column)({ name: 'gst_percent', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DailySettlement.prototype, "gstPercent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'GST amount' }),
    (0, typeorm_1.Column)({ name: 'gst_amount', type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DailySettlement.prototype, "gstAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total deduction' }),
    (0, typeorm_1.Column)({ name: 'total_deduction', type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DailySettlement.prototype, "totalDeduction", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Settlement amount' }),
    (0, typeorm_1.Column)({ name: 'settlement_amount', type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DailySettlement.prototype, "settlementAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment status', enum: SettlementPaidStatus }),
    (0, typeorm_1.Column)({ name: 'paid_status', type: 'enum', enum: SettlementPaidStatus, default: SettlementPaidStatus.PENDING }),
    __metadata("design:type", String)
], DailySettlement.prototype, "paidStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction reference' }),
    (0, typeorm_1.Column)({ name: 'transaction_reference', type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], DailySettlement.prototype, "transactionReference", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Paid at' }),
    (0, typeorm_1.Column)({ name: 'paid_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], DailySettlement.prototype, "paidAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Admin notes' }),
    (0, typeorm_1.Column)({ name: 'admin_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], DailySettlement.prototype, "adminNotes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], DailySettlement.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], DailySettlement.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => business_owner_entity_1.BusinessOwner, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'business_owner_id' }),
    __metadata("design:type", business_owner_entity_1.BusinessOwner)
], DailySettlement.prototype, "businessOwner", void 0);
exports.DailySettlement = DailySettlement = __decorate([
    (0, typeorm_1.Entity)('daily_settlements'),
    (0, typeorm_1.Index)(['businessOwnerId', 'settlementDate'], { unique: true }),
    (0, typeorm_1.Index)(['settlementDate']),
    (0, typeorm_1.Index)(['paidStatus'])
], DailySettlement);
//# sourceMappingURL=daily-settlement.entity.js.map