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
exports.BookingDetailsDto = exports.ServiceSummaryDto = exports.BookingServiceDetailDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class BookingServiceDetailDto {
}
exports.BookingServiceDetailDto = BookingServiceDetailDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Booking service UUID' }),
    __metadata("design:type", String)
], BookingServiceDetailDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Booking ID this service belongs to' }),
    __metadata("design:type", String)
], BookingServiceDetailDto.prototype, "bookingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business service ID' }),
    __metadata("design:type", String)
], BookingServiceDetailDto.prototype, "businessServiceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Service ID from catalog' }),
    __metadata("design:type", String)
], BookingServiceDetailDto.prototype, "serviceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Service name (denormalized)' }),
    __metadata("design:type", String)
], BookingServiceDetailDto.prototype, "serviceName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Price for this service' }),
    __metadata("design:type", Number)
], BookingServiceDetailDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Service price (alias)' }),
    __metadata("design:type", Number)
], BookingServiceDetailDto.prototype, "servicePrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Duration in minutes' }),
    __metadata("design:type", Number)
], BookingServiceDetailDto.prototype, "durationMinutes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Service duration (alias)' }),
    __metadata("design:type", Number)
], BookingServiceDetailDto.prototype, "serviceDuration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether this is an add-on service (added during IN_PROGRESS)', default: false }),
    __metadata("design:type", Boolean)
], BookingServiceDetailDto.prototype, "isAddOn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timestamp when service was added to booking', required: false }),
    __metadata("design:type", Date)
], BookingServiceDetailDto.prototype, "addedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Staff ID who added this service', required: false }),
    __metadata("design:type", String)
], BookingServiceDetailDto.prototype, "addedByStaffId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer approval status for add-on services', default: true }),
    __metadata("design:type", Boolean)
], BookingServiceDetailDto.prototype, "customerApproved", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timestamp when customer approved the service', required: false }),
    __metadata("design:type", Date)
], BookingServiceDetailDto.prototype, "approvedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timestamp when customer rejected the service', required: false }),
    __metadata("design:type", Date)
], BookingServiceDetailDto.prototype, "rejectedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Package ID if service is part of a package', required: false }),
    __metadata("design:type", String)
], BookingServiceDetailDto.prototype, "packageId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Package name if service is part of a package', required: false }),
    __metadata("design:type", String)
], BookingServiceDetailDto.prototype, "packageName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Created timestamp' }),
    __metadata("design:type", Date)
], BookingServiceDetailDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Updated timestamp' }),
    __metadata("design:type", Date)
], BookingServiceDetailDto.prototype, "updatedAt", void 0);
class ServiceSummaryDto {
}
exports.ServiceSummaryDto = ServiceSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of original services (from booking request)' }),
    __metadata("design:type", Number)
], ServiceSummaryDto.prototype, "originalServicesCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of add-on services (added during service)' }),
    __metadata("design:type", Number)
], ServiceSummaryDto.prototype, "addOnServicesCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of services (original + add-ons)' }),
    __metadata("design:type", Number)
], ServiceSummaryDto.prototype, "totalServicesCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total duration of all services in minutes' }),
    __metadata("design:type", Number)
], ServiceSummaryDto.prototype, "totalDuration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Estimated end time (HH:MM format)', required: false }),
    __metadata("design:type", String)
], ServiceSummaryDto.prototype, "estimatedEndTime", void 0);
class BookingDetailsDto {
}
exports.BookingDetailsDto = BookingDetailsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total amount including original services, add-ons, and delivery charge' }),
    __metadata("design:type", Number)
], BookingDetailsDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Original booking request amount (before add-ons)' }),
    __metadata("design:type", Number)
], BookingDetailsDto.prototype, "originalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total cost of add-on services added during service', default: 0 }),
    __metadata("design:type", Number)
], BookingDetailsDto.prototype, "addOnServicesTotal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Delivery charge for at-home services', default: 0 }),
    __metadata("design:type", Number)
], BookingDetailsDto.prototype, "deliveryCharge", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether payment has been completed', default: false }),
    __metadata("design:type", Boolean)
], BookingDetailsDto.prototype, "paymentCompleted", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'All services in the booking (original + add-ons)',
        type: [BookingServiceDetailDto]
    }),
    __metadata("design:type", Array)
], BookingDetailsDto.prototype, "allServices", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Original services from booking request (isAddOn: false)',
        type: [BookingServiceDetailDto]
    }),
    __metadata("design:type", Array)
], BookingDetailsDto.prototype, "originalServices", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Add-on services added during service (isAddOn: true)',
        type: [BookingServiceDetailDto]
    }),
    __metadata("design:type", Array)
], BookingDetailsDto.prototype, "addOnServices", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Pending add-on services awaiting customer approval (isAddOn: true, customerApproved: false)',
        type: [BookingServiceDetailDto]
    }),
    __metadata("design:type", Array)
], BookingDetailsDto.prototype, "pendingAddOnServices", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Approved add-on services (isAddOn: true, customerApproved: true)',
        type: [BookingServiceDetailDto]
    }),
    __metadata("design:type", Array)
], BookingDetailsDto.prototype, "approvedAddOnServices", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total amount of pending add-ons (not yet included in totalAmount)', default: 0 }),
    __metadata("design:type", Number)
], BookingDetailsDto.prototype, "pendingAddOnServicesTotal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Service counts and duration summary', type: ServiceSummaryDto }),
    __metadata("design:type", ServiceSummaryDto)
], BookingDetailsDto.prototype, "serviceSummary", void 0);
//# sourceMappingURL=booking-details.dto.js.map