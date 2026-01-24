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
exports.UserBookingHistory = exports.BookingStatus = exports.VendorPaymentStatus = exports.BookingPaymentStatus = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const user_entity_1 = require("./user.entity");
const booking_entity_1 = require("./booking.entity");
const business_owner_entity_1 = require("./business-owner.entity");
const business_owner_transaction_history_entity_1 = require("./business-owner-transaction-history.entity");
var BookingPaymentStatus;
(function (BookingPaymentStatus) {
    BookingPaymentStatus["PENDING"] = "pending";
    BookingPaymentStatus["PAID"] = "paid";
    BookingPaymentStatus["REFUNDED"] = "refunded";
    BookingPaymentStatus["PARTIALLY_PAID"] = "partially_paid";
})(BookingPaymentStatus || (exports.BookingPaymentStatus = BookingPaymentStatus = {}));
var VendorPaymentStatus;
(function (VendorPaymentStatus) {
    VendorPaymentStatus["PENDING"] = "pending";
    VendorPaymentStatus["PAID"] = "paid";
    VendorPaymentStatus["OVERDUE"] = "overdue";
    VendorPaymentStatus["PARTIALLY_PAID"] = "partially_paid";
})(VendorPaymentStatus || (exports.VendorPaymentStatus = VendorPaymentStatus = {}));
var BookingStatus;
(function (BookingStatus) {
    BookingStatus["PENDING"] = "pending";
    BookingStatus["CONFIRMED"] = "confirmed";
    BookingStatus["COMPLETED"] = "completed";
    BookingStatus["CANCELLED"] = "cancelled";
    BookingStatus["NO_SHOW"] = "no_show";
})(BookingStatus || (exports.BookingStatus = BookingStatus = {}));
let UserBookingHistory = class UserBookingHistory {
    get isPaid() {
        return this.paymentStatus === BookingPaymentStatus.PAID;
    }
    get isVendorPaid() {
        return this.vendorPaymentStatus === VendorPaymentStatus.PAID;
    }
    get isCompleted() {
        return this.bookingStatus === BookingStatus.COMPLETED;
    }
    get isCancelled() {
        return this.bookingStatus === BookingStatus.CANCELLED;
    }
};
exports.UserBookingHistory = UserBookingHistory;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UserBookingHistory.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID' }),
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], UserBookingHistory.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Booking ID' }),
    (0, typeorm_1.Column)({ name: 'booking_id', nullable: true }),
    __metadata("design:type", String)
], UserBookingHistory.prototype, "bookingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business owner ID' }),
    (0, typeorm_1.Column)({ name: 'business_owner_id' }),
    __metadata("design:type", String)
], UserBookingHistory.prototype, "businessOwnerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer name' }),
    (0, typeorm_1.Column)({ name: 'customer_name', length: 200 }),
    __metadata("design:type", String)
], UserBookingHistory.prototype, "customerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer mobile number' }),
    (0, typeorm_1.Column)({ name: 'customer_mobile', length: 15 }),
    __metadata("design:type", String)
], UserBookingHistory.prototype, "customerMobile", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Booking date and time' }),
    (0, typeorm_1.Column)({ name: 'booking_date', type: 'timestamp' }),
    __metadata("design:type", Date)
], UserBookingHistory.prototype, "bookingDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Booking amount' }),
    (0, typeorm_1.Column)({ name: 'booking_amount', type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], UserBookingHistory.prototype, "bookingAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: BookingPaymentStatus, description: 'Payment status' }),
    (0, typeorm_1.Column)({
        name: 'payment_status',
        type: 'enum',
        enum: BookingPaymentStatus,
        default: BookingPaymentStatus.PENDING,
    }),
    __metadata("design:type", String)
], UserBookingHistory.prototype, "paymentStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: business_owner_transaction_history_entity_1.PaymentMethod, description: 'Payment method' }),
    (0, typeorm_1.Column)({
        name: 'payment_method',
        type: 'enum',
        enum: business_owner_transaction_history_entity_1.PaymentMethod,
        nullable: true,
    }),
    __metadata("design:type", String)
], UserBookingHistory.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: VendorPaymentStatus, description: 'Vendor payment status' }),
    (0, typeorm_1.Column)({
        name: 'vendor_payment_status',
        type: 'enum',
        enum: VendorPaymentStatus,
        default: VendorPaymentStatus.PENDING,
    }),
    __metadata("design:type", String)
], UserBookingHistory.prototype, "vendorPaymentStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Amount paid to vendor' }),
    (0, typeorm_1.Column)({ name: 'vendor_paid_amount', type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], UserBookingHistory.prototype, "vendorPaidAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Vendor payment date' }),
    (0, typeorm_1.Column)({ name: 'vendor_payment_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], UserBookingHistory.prototype, "vendorPaymentDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Commission amount' }),
    (0, typeorm_1.Column)({ name: 'commission_amount', type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], UserBookingHistory.prototype, "commissionAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Vendor earning amount' }),
    (0, typeorm_1.Column)({ name: 'vendor_earning', type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], UserBookingHistory.prototype, "vendorEarning", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: BookingStatus, description: 'Booking status' }),
    (0, typeorm_1.Column)({
        name: 'booking_status',
        type: 'enum',
        enum: BookingStatus,
    }),
    __metadata("design:type", String)
], UserBookingHistory.prototype, "bookingStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Booking remarks' }),
    (0, typeorm_1.Column)({ name: 'remarks', type: 'text', nullable: true }),
    __metadata("design:type", String)
], UserBookingHistory.prototype, "remarks", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], UserBookingHistory.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], UserBookingHistory.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.id),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], UserBookingHistory.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => booking_entity_1.Booking, (booking) => booking.id, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'booking_id' }),
    __metadata("design:type", booking_entity_1.Booking)
], UserBookingHistory.prototype, "booking", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => business_owner_entity_1.BusinessOwner, (businessOwner) => businessOwner.id),
    (0, typeorm_1.JoinColumn)({ name: 'business_owner_id' }),
    __metadata("design:type", business_owner_entity_1.BusinessOwner)
], UserBookingHistory.prototype, "businessOwner", void 0);
exports.UserBookingHistory = UserBookingHistory = __decorate([
    (0, typeorm_1.Entity)('user_booking_history')
], UserBookingHistory);
//# sourceMappingURL=user-booking-history.entity.js.map