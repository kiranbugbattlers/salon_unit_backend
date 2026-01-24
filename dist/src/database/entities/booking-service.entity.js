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
exports.BookingService = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const booking_entity_1 = require("./booking.entity");
const business_service_entity_1 = require("./business-service.entity");
const service_entity_1 = require("./service.entity");
const staff_entity_1 = require("./staff.entity");
const service_package_entity_1 = require("./service-package.entity");
let BookingService = class BookingService {
};
exports.BookingService = BookingService;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BookingService.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Booking ID' }),
    (0, typeorm_1.Column)({ name: 'booking_id', type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], BookingService.prototype, "bookingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business service ID' }),
    (0, typeorm_1.Column)({ name: 'business_service_id', type: 'uuid' }),
    __metadata("design:type", String)
], BookingService.prototype, "businessServiceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Service ID' }),
    (0, typeorm_1.Column)({ name: 'service_id', type: 'uuid' }),
    __metadata("design:type", String)
], BookingService.prototype, "serviceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Service name (denormalized for performance)' }),
    (0, typeorm_1.Column)({ name: 'service_name', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], BookingService.prototype, "serviceName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Price for this service' }),
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], BookingService.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Price for this service (alias for price)' }),
    (0, typeorm_1.Column)({ name: 'service_price', type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], BookingService.prototype, "servicePrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Duration in minutes' }),
    (0, typeorm_1.Column)({ name: 'duration_minutes', type: 'int' }),
    __metadata("design:type", Number)
], BookingService.prototype, "durationMinutes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Duration for this service (alias for durationMinutes)' }),
    (0, typeorm_1.Column)({ name: 'service_duration', type: 'int' }),
    __metadata("design:type", Number)
], BookingService.prototype, "serviceDuration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'TRUE if service was added during IN_PROGRESS status', default: false }),
    (0, typeorm_1.Column)({ name: 'is_add_on', type: 'boolean', default: false }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Boolean)
], BookingService.prototype, "isAddOn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timestamp when add-on service was added', required: false }),
    (0, typeorm_1.Column)({ name: 'added_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], BookingService.prototype, "addedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Staff ID who added the service', required: false }),
    (0, typeorm_1.Column)({ name: 'added_by_staff_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], BookingService.prototype, "addedByStaffId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer approval for add-on service', default: true }),
    (0, typeorm_1.Column)({ name: 'customer_approved', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], BookingService.prototype, "customerApproved", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timestamp when customer approved the add-on service', required: false }),
    (0, typeorm_1.Column)({ name: 'approved_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], BookingService.prototype, "approvedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timestamp when customer rejected the add-on service', required: false }),
    (0, typeorm_1.Column)({ name: 'rejected_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], BookingService.prototype, "rejectedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Package ID if service is part of a package', required: false }),
    (0, typeorm_1.Column)({ name: 'package_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], BookingService.prototype, "packageId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Package name if service is part of a package', required: false }),
    (0, typeorm_1.Column)({ name: 'package_name', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], BookingService.prototype, "packageName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], BookingService.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], BookingService.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => booking_entity_1.Booking, (booking) => booking.bookingServices),
    (0, typeorm_1.JoinColumn)({ name: 'booking_id' }),
    __metadata("design:type", booking_entity_1.Booking)
], BookingService.prototype, "booking", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => business_service_entity_1.BusinessService),
    (0, typeorm_1.JoinColumn)({ name: 'business_service_id' }),
    __metadata("design:type", business_service_entity_1.BusinessService)
], BookingService.prototype, "businessService", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => service_entity_1.Service),
    (0, typeorm_1.JoinColumn)({ name: 'service_id' }),
    __metadata("design:type", service_entity_1.Service)
], BookingService.prototype, "service", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => staff_entity_1.Staff, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'added_by_staff_id' }),
    __metadata("design:type", staff_entity_1.Staff)
], BookingService.prototype, "addedByStaff", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => service_package_entity_1.ServicePackage, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'package_id' }),
    __metadata("design:type", service_package_entity_1.ServicePackage)
], BookingService.prototype, "package", void 0);
exports.BookingService = BookingService = __decorate([
    (0, typeorm_1.Entity)('booking_services'),
    (0, typeorm_1.Index)(['bookingId', 'isAddOn'])
], BookingService);
//# sourceMappingURL=booking-service.entity.js.map