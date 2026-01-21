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
exports.MonthlySettlement = exports.SettlementStatus = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const business_owner_entity_1 = require("./business-owner.entity");
const settlement_transaction_entity_1 = require("./settlement-transaction.entity");
var SettlementStatus;
(function (SettlementStatus) {
    SettlementStatus["PENDING"] = "pending";
    SettlementStatus["PROCESSING"] = "processing";
    SettlementStatus["COMPLETED"] = "completed";
    SettlementStatus["FAILED"] = "failed";
    SettlementStatus["REQUIRES_PAYMENT"] = "requires_payment";
    SettlementStatus["PAYMENT_RECEIVED"] = "payment_received";
})(SettlementStatus || (exports.SettlementStatus = SettlementStatus = {}));
let MonthlySettlement = class MonthlySettlement {
};
exports.MonthlySettlement = MonthlySettlement;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MonthlySettlement.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business owner ID' }),
    (0, typeorm_1.Column)({ name: 'business_owner_id' }),
    __metadata("design:type", String)
], MonthlySettlement.prototype, "businessOwnerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Settlement month in YYYY-MM format', example: '2024-01' }),
    (0, typeorm_1.Column)({ name: 'settlement_month', type: 'varchar', length: 7 }),
    __metadata("design:type", String)
], MonthlySettlement.prototype, "settlementMonth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total booking amount for the month' }),
    (0, typeorm_1.Column)({ name: 'total_booking_amount', type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], MonthlySettlement.prototype, "totalBookingAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total commission amount for the month' }),
    (0, typeorm_1.Column)({ name: 'total_commission_amount', type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], MonthlySettlement.prototype, "totalCommissionAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Net amount payable to business owner (can be negative)' }),
    (0, typeorm_1.Column)({ name: 'net_payable_to_business_owner', type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], MonthlySettlement.prototype, "netPayableToBusinessOwner", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total COD amount collected by business owner' }),
    (0, typeorm_1.Column)({ name: 'total_cod_amount', type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], MonthlySettlement.prototype, "totalCODAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total online payment amount collected by company' }),
    (0, typeorm_1.Column)({ name: 'total_online_amount', type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], MonthlySettlement.prototype, "totalOnlineAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of bookings included in settlement' }),
    (0, typeorm_1.Column)({ name: 'booking_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], MonthlySettlement.prototype, "bookingCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: SettlementStatus, description: 'Settlement status' }),
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'enum',
        enum: SettlementStatus,
        default: SettlementStatus.PENDING,
    }),
    __metadata("design:type", String)
], MonthlySettlement.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Razorpay payout ID', required: false }),
    (0, typeorm_1.Column)({ name: 'razorpay_payout_id', nullable: true }),
    __metadata("design:type", String)
], MonthlySettlement.prototype, "razorpayPayoutId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Razorpay fund account ID', required: false }),
    (0, typeorm_1.Column)({ name: 'razorpay_fund_account_id', nullable: true }),
    __metadata("design:type", String)
], MonthlySettlement.prototype, "razorpayFundAccountId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'When payout was initiated', required: false }),
    (0, typeorm_1.Column)({ name: 'payout_initiated_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], MonthlySettlement.prototype, "payoutInitiatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'When payout was completed', required: false }),
    (0, typeorm_1.Column)({ name: 'payout_completed_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], MonthlySettlement.prototype, "payoutCompletedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Failure reason if payout failed', required: false }),
    (0, typeorm_1.Column)({ name: 'failure_reason', type: 'text', nullable: true }),
    __metadata("design:type", String)
], MonthlySettlement.prototype, "failureReason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payout status from Razorpay', required: false }),
    (0, typeorm_1.Column)({ name: 'payout_status', nullable: true }),
    __metadata("design:type", String)
], MonthlySettlement.prototype, "payoutStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payout mode (IMPS, NEFT, etc.)', required: false }),
    (0, typeorm_1.Column)({ name: 'payout_mode', nullable: true }),
    __metadata("design:type", String)
], MonthlySettlement.prototype, "payoutMode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payout UTR number', required: false }),
    (0, typeorm_1.Column)({ name: 'payout_utr', nullable: true }),
    __metadata("design:type", String)
], MonthlySettlement.prototype, "payoutUtr", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payout metadata from Razorpay', required: false }),
    (0, typeorm_1.Column)({ name: 'payout_metadata', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], MonthlySettlement.prototype, "payoutMetadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of retry attempts', required: false }),
    (0, typeorm_1.Column)({ name: 'retry_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], MonthlySettlement.prototype, "retryCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last retry timestamp', required: false }),
    (0, typeorm_1.Column)({ name: 'last_retry_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], MonthlySettlement.prototype, "lastRetryAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Additional metadata (JSON)', required: false }),
    (0, typeorm_1.Column)({ name: 'metadata', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], MonthlySettlement.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notes from admin', required: false }),
    (0, typeorm_1.Column)({ name: 'admin_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], MonthlySettlement.prototype, "adminNotes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], MonthlySettlement.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], MonthlySettlement.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => business_owner_entity_1.BusinessOwner, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'business_owner_id' }),
    __metadata("design:type", business_owner_entity_1.BusinessOwner)
], MonthlySettlement.prototype, "businessOwner", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => settlement_transaction_entity_1.SettlementTransaction, (transaction) => transaction.settlement),
    __metadata("design:type", Array)
], MonthlySettlement.prototype, "transactions", void 0);
exports.MonthlySettlement = MonthlySettlement = __decorate([
    (0, typeorm_1.Entity)('monthly_settlements'),
    (0, typeorm_1.Index)(['businessOwnerId', 'settlementMonth'], { unique: true }),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['settlementMonth'])
], MonthlySettlement);
//# sourceMappingURL=monthly-settlement.entity.js.map