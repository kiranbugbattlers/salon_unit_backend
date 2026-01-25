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
exports.VendorPaymentSummary = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const business_owner_entity_1 = require("./business-owner.entity");
const user_booking_history_entity_1 = require("./user-booking-history.entity");
let VendorPaymentSummary = class VendorPaymentSummary {
    get isPaid() {
        return this.paymentStatus === user_booking_history_entity_1.VendorPaymentStatus.PAID;
    }
    get isOverdue() {
        return this.paymentStatus === user_booking_history_entity_1.VendorPaymentStatus.OVERDUE;
    }
    get isPartiallyPaid() {
        return this.paymentStatus === user_booking_history_entity_1.VendorPaymentStatus.PARTIALLY_PAID;
    }
    get hasDueAmount() {
        return this.amountDue > 0;
    }
    get paymentPercentage() {
        if (this.vendorEarning === 0)
            return 0;
        return (this.amountPaid / this.vendorEarning) * 100;
    }
};
exports.VendorPaymentSummary = VendorPaymentSummary;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], VendorPaymentSummary.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business owner ID' }),
    (0, typeorm_1.Column)({ name: 'business_owner_id' }),
    __metadata("design:type", String)
], VendorPaymentSummary.prototype, "businessOwnerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Summary date' }),
    (0, typeorm_1.Column)({ name: 'summary_date', type: 'date' }),
    __metadata("design:type", Date)
], VendorPaymentSummary.prototype, "summaryDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of bookings' }),
    (0, typeorm_1.Column)({ name: 'total_bookings', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], VendorPaymentSummary.prototype, "totalBookings", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total revenue from bookings' }),
    (0, typeorm_1.Column)({ name: 'total_revenue', type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], VendorPaymentSummary.prototype, "totalRevenue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total commission deducted' }),
    (0, typeorm_1.Column)({ name: 'total_commission', type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], VendorPaymentSummary.prototype, "totalCommission", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total vendor earnings' }),
    (0, typeorm_1.Column)({ name: 'vendor_earning', type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], VendorPaymentSummary.prototype, "vendorEarning", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Amount paid to vendor' }),
    (0, typeorm_1.Column)({ name: 'amount_paid', type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], VendorPaymentSummary.prototype, "amountPaid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Amount due to vendor' }),
    (0, typeorm_1.Column)({ name: 'amount_due', type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], VendorPaymentSummary.prototype, "amountDue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: user_booking_history_entity_1.VendorPaymentStatus, description: 'Payment status' }),
    (0, typeorm_1.Column)({
        name: 'payment_status',
        type: 'enum',
        enum: user_booking_history_entity_1.VendorPaymentStatus,
        default: user_booking_history_entity_1.VendorPaymentStatus.PENDING,
    }),
    __metadata("design:type", String)
], VendorPaymentSummary.prototype, "paymentStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], VendorPaymentSummary.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], VendorPaymentSummary.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => business_owner_entity_1.BusinessOwner, (businessOwner) => businessOwner.id),
    (0, typeorm_1.JoinColumn)({ name: 'business_owner_id' }),
    __metadata("design:type", business_owner_entity_1.BusinessOwner)
], VendorPaymentSummary.prototype, "businessOwner", void 0);
exports.VendorPaymentSummary = VendorPaymentSummary = __decorate([
    (0, typeorm_1.Entity)('vendor_payment_summary')
], VendorPaymentSummary);
//# sourceMappingURL=vendor-payment-summary.entity.js.map