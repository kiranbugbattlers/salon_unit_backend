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
exports.VendorDuePayment = exports.DuePaymentStatus = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const business_owner_entity_1 = require("./business-owner.entity");
const admin_entity_1 = require("./admin.entity");
var DuePaymentStatus;
(function (DuePaymentStatus) {
    DuePaymentStatus["PENDING"] = "pending";
    DuePaymentStatus["OVERDUE"] = "overdue";
    DuePaymentStatus["PAID"] = "paid";
    DuePaymentStatus["PARTIALLY_PAID"] = "partially_paid";
})(DuePaymentStatus || (exports.DuePaymentStatus = DuePaymentStatus = {}));
let VendorDuePayment = class VendorDuePayment {
    get isOverdue() {
        return this.status === DuePaymentStatus.OVERDUE;
    }
    get isPaid() {
        return this.status === DuePaymentStatus.PAID;
    }
    get isPartiallyPaid() {
        return this.status === DuePaymentStatus.PARTIALLY_PAID;
    }
    get isPending() {
        return this.status === DuePaymentStatus.PENDING;
    }
};
exports.VendorDuePayment = VendorDuePayment;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], VendorDuePayment.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business owner ID' }),
    (0, typeorm_1.Column)({ name: 'business_owner_id' }),
    __metadata("design:type", String)
], VendorDuePayment.prototype, "businessOwnerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Due amount' }),
    (0, typeorm_1.Column)({ name: 'due_amount', type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], VendorDuePayment.prototype, "dueAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Paid amount' }),
    (0, typeorm_1.Column)({ name: 'paid_amount', type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], VendorDuePayment.prototype, "paidAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Remaining amount' }),
    (0, typeorm_1.Column)({ name: 'remaining_amount', type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], VendorDuePayment.prototype, "remainingAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Alternate contact number for admin use only' }),
    (0, typeorm_1.Column)({ name: 'alternate_number', length: 20, nullable: true }),
    __metadata("design:type", String)
], VendorDuePayment.prototype, "alternateNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Salon/business name' }),
    (0, typeorm_1.Column)({ name: 'salon_name', length: 200, nullable: true }),
    __metadata("design:type", String)
], VendorDuePayment.prototype, "salonName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Owner full name' }),
    (0, typeorm_1.Column)({ name: 'owner_name', length: 200, nullable: true }),
    __metadata("design:type", String)
], VendorDuePayment.prototype, "ownerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Owner mobile number' }),
    (0, typeorm_1.Column)({ name: 'mobile_number', length: 15, nullable: true }),
    __metadata("design:type", String)
], VendorDuePayment.prototype, "mobileNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Enable/disable status for business' }),
    (0, typeorm_1.Column)({ name: 'is_business_enabled', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], VendorDuePayment.prototype, "isBusinessEnabled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Due date' }),
    (0, typeorm_1.Column)({ name: 'due_date', type: 'date' }),
    __metadata("design:type", Date)
], VendorDuePayment.prototype, "dueDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: DuePaymentStatus, description: 'Payment status' }),
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'enum',
        enum: DuePaymentStatus,
        default: DuePaymentStatus.PENDING,
    }),
    __metadata("design:type", String)
], VendorDuePayment.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment description' }),
    (0, typeorm_1.Column)({ name: 'description', type: 'text', nullable: true }),
    __metadata("design:type", String)
], VendorDuePayment.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Admin who created this due payment' }),
    (0, typeorm_1.Column)({ name: 'created_by_admin_id', nullable: true }),
    __metadata("design:type", String)
], VendorDuePayment.prototype, "createdByAdminId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Admin who last updated this due payment' }),
    (0, typeorm_1.Column)({ name: 'updated_by_admin_id', nullable: true }),
    __metadata("design:type", String)
], VendorDuePayment.prototype, "updatedByAdminId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'When this due payment was marked as overdue' }),
    (0, typeorm_1.Column)({ name: 'marked_overdue_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], VendorDuePayment.prototype, "markedOverdueAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], VendorDuePayment.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], VendorDuePayment.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => business_owner_entity_1.BusinessOwner, (businessOwner) => businessOwner.duePayments),
    (0, typeorm_1.JoinColumn)({ name: 'business_owner_id' }),
    __metadata("design:type", business_owner_entity_1.BusinessOwner)
], VendorDuePayment.prototype, "businessOwner", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => admin_entity_1.Admin, (admin) => admin.id, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by_admin_id' }),
    __metadata("design:type", admin_entity_1.Admin)
], VendorDuePayment.prototype, "createdByAdmin", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => admin_entity_1.Admin, (admin) => admin.id, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'updated_by_admin_id' }),
    __metadata("design:type", admin_entity_1.Admin)
], VendorDuePayment.prototype, "updatedByAdmin", void 0);
exports.VendorDuePayment = VendorDuePayment = __decorate([
    (0, typeorm_1.Entity)('vendor_due_payments')
], VendorDuePayment);
//# sourceMappingURL=vendor-due-payment.entity.js.map