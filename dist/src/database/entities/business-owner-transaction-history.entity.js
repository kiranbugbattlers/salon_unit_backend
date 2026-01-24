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
exports.BusinessOwnerTransactionHistory = exports.PaymentMethod = exports.TransactionStatus = exports.TransactionType = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const business_owner_entity_1 = require("./business-owner.entity");
const booking_entity_1 = require("./booking.entity");
const admin_entity_1 = require("./admin.entity");
var TransactionType;
(function (TransactionType) {
    TransactionType["CREDIT"] = "credit";
    TransactionType["DEBIT"] = "debit";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "pending";
    TransactionStatus["COMPLETED"] = "completed";
    TransactionStatus["FAILED"] = "failed";
    TransactionStatus["CANCELLED"] = "cancelled";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "cash";
    PaymentMethod["ONLINE"] = "online";
    PaymentMethod["UPI"] = "upi";
    PaymentMethod["CARD"] = "card";
    PaymentMethod["BANK_TRANSFER"] = "bank_transfer";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
let BusinessOwnerTransactionHistory = class BusinessOwnerTransactionHistory {
    get isCredit() {
        return this.transactionType === TransactionType.CREDIT;
    }
    get isDebit() {
        return this.transactionType === TransactionType.DEBIT;
    }
    get isCompleted() {
        return this.status === TransactionStatus.COMPLETED;
    }
};
exports.BusinessOwnerTransactionHistory = BusinessOwnerTransactionHistory;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BusinessOwnerTransactionHistory.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business owner ID' }),
    (0, typeorm_1.Column)({ name: 'business_owner_id' }),
    __metadata("design:type", String)
], BusinessOwnerTransactionHistory.prototype, "businessOwnerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction date and time' }),
    (0, typeorm_1.Column)({ name: 'transaction_date', type: 'timestamp' }),
    __metadata("design:type", Date)
], BusinessOwnerTransactionHistory.prototype, "transactionDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction amount' }),
    (0, typeorm_1.Column)({ name: 'transaction_amount', type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], BusinessOwnerTransactionHistory.prototype, "transactionAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: TransactionType, description: 'Transaction type (credit/debit)' }),
    (0, typeorm_1.Column)({
        name: 'transaction_type',
        type: 'enum',
        enum: TransactionType,
    }),
    __metadata("design:type", String)
], BusinessOwnerTransactionHistory.prototype, "transactionType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Previous balance before transaction' }),
    (0, typeorm_1.Column)({ name: 'previous_balance', type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], BusinessOwnerTransactionHistory.prototype, "previousBalance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Remaining balance after transaction' }),
    (0, typeorm_1.Column)({ name: 'remaining_balance', type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], BusinessOwnerTransactionHistory.prototype, "remainingBalance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: TransactionStatus, description: 'Transaction status' }),
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'enum',
        enum: TransactionStatus,
        default: TransactionStatus.COMPLETED,
    }),
    __metadata("design:type", String)
], BusinessOwnerTransactionHistory.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: PaymentMethod, description: 'Payment method' }),
    (0, typeorm_1.Column)({
        name: 'payment_method',
        type: 'enum',
        enum: PaymentMethod,
        nullable: true,
    }),
    __metadata("design:type", String)
], BusinessOwnerTransactionHistory.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction remarks' }),
    (0, typeorm_1.Column)({ name: 'remarks', type: 'text', nullable: true }),
    __metadata("design:type", String)
], BusinessOwnerTransactionHistory.prototype, "remarks", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Related booking ID' }),
    (0, typeorm_1.Column)({ name: 'related_booking_id', nullable: true }),
    __metadata("design:type", String)
], BusinessOwnerTransactionHistory.prototype, "relatedBookingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Admin who created this transaction' }),
    (0, typeorm_1.Column)({ name: 'created_by_admin_id', nullable: true }),
    __metadata("design:type", String)
], BusinessOwnerTransactionHistory.prototype, "createdByAdminId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], BusinessOwnerTransactionHistory.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], BusinessOwnerTransactionHistory.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => business_owner_entity_1.BusinessOwner, (businessOwner) => businessOwner.id),
    (0, typeorm_1.JoinColumn)({ name: 'business_owner_id' }),
    __metadata("design:type", business_owner_entity_1.BusinessOwner)
], BusinessOwnerTransactionHistory.prototype, "businessOwner", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => booking_entity_1.Booking, (booking) => booking.id, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'related_booking_id' }),
    __metadata("design:type", booking_entity_1.Booking)
], BusinessOwnerTransactionHistory.prototype, "relatedBooking", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => admin_entity_1.Admin, (admin) => admin.id, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by_admin_id' }),
    __metadata("design:type", admin_entity_1.Admin)
], BusinessOwnerTransactionHistory.prototype, "createdByAdmin", void 0);
exports.BusinessOwnerTransactionHistory = BusinessOwnerTransactionHistory = __decorate([
    (0, typeorm_1.Entity)('business_owner_transaction_history')
], BusinessOwnerTransactionHistory);
//# sourceMappingURL=business-owner-transaction-history.entity.js.map