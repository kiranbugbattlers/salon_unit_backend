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
exports.Booking = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const customer_entity_1 = require("./customer.entity");
const business_owner_entity_1 = require("./business-owner.entity");
const staff_entity_1 = require("./staff.entity");
const service_entity_1 = require("./service.entity");
const booking_request_entity_1 = require("./booking-request.entity");
const enums_1 = require("../../common/enums");
const settlement_transaction_entity_1 = require("./settlement-transaction.entity");
const commission_transaction_entity_1 = require("./commission-transaction.entity");
const booking_service_entity_1 = require("./booking-service.entity");
const review_entity_1 = require("./review.entity");
let Booking = class Booking {
};
exports.Booking = Booking;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Booking.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'customer_id', type: 'uuid' }),
    __metadata("design:type", String)
], Booking.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'business_owner_id', type: 'uuid' }),
    __metadata("design:type", String)
], Booking.prototype, "businessOwnerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'staff_id', type: 'uuid' }),
    __metadata("design:type", String)
], Booking.prototype, "staffId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'service_id', type: 'uuid' }),
    __metadata("design:type", String)
], Booking.prototype, "serviceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date of the appointment' }),
    (0, typeorm_1.Column)({ name: 'appointment_date', type: 'date' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], Booking.prototype, "appointmentDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Start time in HH:MM format' }),
    (0, typeorm_1.Column)({ name: 'start_time', type: 'time' }),
    __metadata("design:type", String)
], Booking.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'End time in HH:MM format' }),
    (0, typeorm_1.Column)({ name: 'end_time', type: 'time' }),
    __metadata("design:type", String)
], Booking.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.ServiceLocation }),
    (0, typeorm_1.Column)({
        name: 'service_location',
        type: 'enum',
        enum: enums_1.ServiceLocation,
        default: enums_1.ServiceLocation.IN_SALON,
    }),
    __metadata("design:type", String)
], Booking.prototype, "serviceLocation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'special_requests', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Booking.prototype, "specialRequests", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total amount for the service' }),
    (0, typeorm_1.Column)({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Booking.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.BookingStatus }),
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'enum',
        enum: enums_1.BookingStatus,
        default: enums_1.BookingStatus.PENDING,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Booking.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'cancellation_reason', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Booking.prototype, "cancellationReason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'cancelled_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Booking.prototype, "cancelledAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reference to the booking request that created this booking', required: false }),
    (0, typeorm_1.Column)({ name: 'booking_request_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Booking.prototype, "bookingRequestId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '6-digit OTP for booking verification' }),
    (0, typeorm_1.Column)({ name: 'otp_code', length: 6 }),
    __metadata("design:type", String)
], Booking.prototype, "otpCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timestamp when OTP was verified', required: false }),
    (0, typeorm_1.Column)({ name: 'otp_verified_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Booking.prototype, "otpVerifiedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timestamp when service was started', required: false }),
    (0, typeorm_1.Column)({ name: 'service_started_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Booking.prototype, "serviceStartedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timestamp when service was completed', required: false }),
    (0, typeorm_1.Column)({ name: 'service_completed_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Booking.prototype, "serviceCompletedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment method used', enum: settlement_transaction_entity_1.PaymentMethodType, required: false }),
    (0, typeorm_1.Column)({
        name: 'payment_method',
        type: 'enum',
        enum: settlement_transaction_entity_1.PaymentMethodType,
        default: settlement_transaction_entity_1.PaymentMethodType.ONLINE,
        nullable: true,
    }),
    __metadata("design:type", String)
], Booking.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Commission transaction ID', required: false }),
    (0, typeorm_1.Column)({ name: 'commission_transaction_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Booking.prototype, "commissionTransactionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer address for at-home services (JSONB format)', required: false }),
    (0, typeorm_1.Column)({ name: 'customer_address', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Booking.prototype, "customerAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Delivery charge for at-home services', default: 0 }),
    (0, typeorm_1.Column)({ name: 'delivery_charge', type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Booking.prototype, "deliveryCharge", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Delivery distance in kilometers', required: false }),
    (0, typeorm_1.Column)({ name: 'delivery_distance', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Booking.prototype, "deliveryDistance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Flag indicating if payment has been completed', default: false }),
    (0, typeorm_1.Column)({ name: 'payment_completed', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Booking.prototype, "paymentCompleted", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total cost of add-on services added during service', default: 0 }),
    (0, typeorm_1.Column)({ name: 'add_on_services_total', type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Booking.prototype, "addOnServicesTotal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Booking.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Booking.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_entity_1.Customer, (customer) => customer.id),
    (0, typeorm_1.JoinColumn)({ name: 'customer_id' }),
    __metadata("design:type", customer_entity_1.Customer)
], Booking.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => business_owner_entity_1.BusinessOwner),
    (0, typeorm_1.JoinColumn)({ name: 'business_owner_id' }),
    __metadata("design:type", business_owner_entity_1.BusinessOwner)
], Booking.prototype, "businessOwner", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => staff_entity_1.Staff, (staff) => staff.id),
    (0, typeorm_1.JoinColumn)({ name: 'staff_id' }),
    __metadata("design:type", staff_entity_1.Staff)
], Booking.prototype, "staff", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => service_entity_1.Service, (service) => service.id),
    (0, typeorm_1.JoinColumn)({ name: 'service_id' }),
    __metadata("design:type", service_entity_1.Service)
], Booking.prototype, "service", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => booking_request_entity_1.BookingRequest, (bookingRequest) => bookingRequest.confirmedBooking, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'booking_request_id' }),
    __metadata("design:type", booking_request_entity_1.BookingRequest)
], Booking.prototype, "bookingRequest", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => commission_transaction_entity_1.CommissionTransaction, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'commission_transaction_id' }),
    __metadata("design:type", commission_transaction_entity_1.CommissionTransaction)
], Booking.prototype, "commissionTransaction", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => booking_service_entity_1.BookingService, (bookingService) => bookingService.booking),
    __metadata("design:type", Array)
], Booking.prototype, "bookingServices", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => review_entity_1.Review, (review) => review.booking, {
        cascade: true
    }),
    __metadata("design:type", Array)
], Booking.prototype, "reviews", void 0);
exports.Booking = Booking = __decorate([
    (0, typeorm_1.Entity)('bookings'),
    (0, typeorm_1.Index)(['businessOwnerId', 'appointmentDate', 'status']),
    (0, typeorm_1.Index)(['staffId', 'appointmentDate', 'status']),
    (0, typeorm_1.Index)(['customerId', 'appointmentDate'])
], Booking);
//# sourceMappingURL=booking.entity.js.map