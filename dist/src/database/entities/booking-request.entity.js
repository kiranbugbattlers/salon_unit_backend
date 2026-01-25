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
exports.BookingRequest = exports.BookingRequestStatus = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const customer_entity_1 = require("./customer.entity");
const business_owner_entity_1 = require("./business-owner.entity");
const staff_entity_1 = require("./staff.entity");
const booking_request_service_entity_1 = require("./booking-request-service.entity");
const booking_entity_1 = require("./booking.entity");
const payment_entity_1 = require("./payment.entity");
const enums_1 = require("../../common/enums");
var BookingRequestStatus;
(function (BookingRequestStatus) {
    BookingRequestStatus["PENDING"] = "pending";
    BookingRequestStatus["APPROVED"] = "approved";
    BookingRequestStatus["REJECTED"] = "rejected";
    BookingRequestStatus["STAFF_ASSIGNED"] = "staff_assigned";
    BookingRequestStatus["IN_PROGRESS"] = "in-progress";
    BookingRequestStatus["AWAITING_PAYMENT"] = "awaiting_payment";
    BookingRequestStatus["COMPLETED"] = "completed";
    BookingRequestStatus["CANCELLED"] = "cancelled";
})(BookingRequestStatus || (exports.BookingRequestStatus = BookingRequestStatus = {}));
let BookingRequest = class BookingRequest {
};
exports.BookingRequest = BookingRequest;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BookingRequest.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'customer_id', type: 'uuid' }),
    __metadata("design:type", String)
], BookingRequest.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'business_owner_id', type: 'uuid' }),
    __metadata("design:type", String)
], BookingRequest.prototype, "businessOwnerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Requested appointment date' }),
    (0, typeorm_1.Column)({ name: 'requested_date', type: 'date' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], BookingRequest.prototype, "requestedDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Requested start time in HH:MM format' }),
    (0, typeorm_1.Column)({ name: 'requested_start_time', type: 'time' }),
    __metadata("design:type", String)
], BookingRequest.prototype, "requestedStartTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Requested end time in HH:MM format' }),
    (0, typeorm_1.Column)({ name: 'requested_end_time', type: 'time' }),
    __metadata("design:type", String)
], BookingRequest.prototype, "requestedEndTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Optional requested staff member', required: false }),
    (0, typeorm_1.Column)({ name: 'requested_staff_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], BookingRequest.prototype, "requestedStaffId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: BookingRequestStatus }),
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'enum',
        enum: BookingRequestStatus,
        default: BookingRequestStatus.PENDING,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], BookingRequest.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total estimated price for all services' }),
    (0, typeorm_1.Column)({ name: 'total_estimated_price', type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], BookingRequest.prototype, "totalEstimatedPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total estimated duration in minutes' }),
    (0, typeorm_1.Column)({ name: 'total_estimated_duration', type: 'int' }),
    __metadata("design:type", Number)
], BookingRequest.prototype, "totalEstimatedDuration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Requested service location', enum: enums_1.ServiceLocation, required: false }),
    (0, typeorm_1.Column)({
        name: 'service_location',
        type: 'enum',
        enum: enums_1.ServiceLocation,
        default: enums_1.ServiceLocation.IN_SALON,
        nullable: true,
    }),
    __metadata("design:type", String)
], BookingRequest.prototype, "serviceLocation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer special requests or notes', required: false }),
    (0, typeorm_1.Column)({ name: 'special_requests', type: 'text', nullable: true }),
    __metadata("design:type", String)
], BookingRequest.prototype, "specialRequests", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business owner rejection reason', required: false }),
    (0, typeorm_1.Column)({ name: 'rejection_reason', type: 'text', nullable: true }),
    __metadata("design:type", String)
], BookingRequest.prototype, "rejectionReason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business owner notes', required: false }),
    (0, typeorm_1.Column)({ name: 'business_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], BookingRequest.prototype, "businessNotes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Assigned staff member after approval', required: false }),
    (0, typeorm_1.Column)({ name: 'assigned_staff_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], BookingRequest.prototype, "assignedStaffId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Final approved start time', required: false }),
    (0, typeorm_1.Column)({ name: 'approved_start_time', type: 'time', nullable: true }),
    __metadata("design:type", String)
], BookingRequest.prototype, "approvedStartTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Final approved end time', required: false }),
    (0, typeorm_1.Column)({ name: 'approved_end_time', type: 'time', nullable: true }),
    __metadata("design:type", String)
], BookingRequest.prototype, "approvedEndTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Final approved price', required: false }),
    (0, typeorm_1.Column)({ name: 'final_price', type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], BookingRequest.prototype, "finalPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Service package ID if booked as a package', required: false }),
    (0, typeorm_1.Column)({ name: 'service_package_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], BookingRequest.prototype, "servicePackageId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment ID reference', required: false }),
    (0, typeorm_1.Column)({ name: 'payment_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], BookingRequest.prototype, "paymentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment status', required: false }),
    (0, typeorm_1.Column)({ name: 'payment_status', type: 'varchar', length: 50, default: 'not_required', nullable: true }),
    __metadata("design:type", String)
], BookingRequest.prototype, "paymentStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer address for at-home services (JSONB format)', required: false }),
    (0, typeorm_1.Column)({ name: 'customer_address', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], BookingRequest.prototype, "customerAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Delivery charge for at-home services', default: 0 }),
    (0, typeorm_1.Column)({ name: 'delivery_charge', type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], BookingRequest.prototype, "deliveryCharge", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Delivery distance in kilometers', required: false }),
    (0, typeorm_1.Column)({ name: 'delivery_distance', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], BookingRequest.prototype, "deliveryDistance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], BookingRequest.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], BookingRequest.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_entity_1.Customer, (customer) => customer.id),
    (0, typeorm_1.JoinColumn)({ name: 'customer_id' }),
    __metadata("design:type", customer_entity_1.Customer)
], BookingRequest.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => business_owner_entity_1.BusinessOwner, (businessOwner) => businessOwner.id),
    (0, typeorm_1.JoinColumn)({ name: 'business_owner_id' }),
    __metadata("design:type", business_owner_entity_1.BusinessOwner)
], BookingRequest.prototype, "businessOwner", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => staff_entity_1.Staff, (staff) => staff.id, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'requested_staff_id' }),
    __metadata("design:type", staff_entity_1.Staff)
], BookingRequest.prototype, "requestedStaff", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => staff_entity_1.Staff, (staff) => staff.id, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'assigned_staff_id' }),
    __metadata("design:type", staff_entity_1.Staff)
], BookingRequest.prototype, "assignedStaff", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => payment_entity_1.Payment, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'payment_id' }),
    __metadata("design:type", payment_entity_1.Payment)
], BookingRequest.prototype, "payment", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => booking_request_service_entity_1.BookingRequestService, (bookingRequestService) => bookingRequestService.bookingRequest),
    __metadata("design:type", Array)
], BookingRequest.prototype, "bookingRequestServices", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => booking_entity_1.Booking, (booking) => booking.bookingRequest, { nullable: true }),
    __metadata("design:type", booking_entity_1.Booking)
], BookingRequest.prototype, "confirmedBooking", void 0);
exports.BookingRequest = BookingRequest = __decorate([
    (0, typeorm_1.Entity)('booking_requests'),
    (0, typeorm_1.Index)(['businessOwnerId', 'status']),
    (0, typeorm_1.Index)(['customerId', 'status']),
    (0, typeorm_1.Index)(['requestedDate', 'status'])
], BookingRequest);
//# sourceMappingURL=booking-request.entity.js.map