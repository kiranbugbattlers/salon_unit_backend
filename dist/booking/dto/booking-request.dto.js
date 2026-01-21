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
exports.BookingRequestQueryDto = exports.RejectBookingRequestDto = exports.ApproveBookingRequestDto = exports.AssignStaffDto = exports.CreateBookingRequestDto = exports.BookingRequestServiceDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const booking_request_entity_1 = require("../../database/entities/booking-request.entity");
const enums_1 = require("../../common/enums");
class BookingRequestServiceDto {
}
exports.BookingRequestServiceDto = BookingRequestServiceDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Business Service ID (from business-owner/services endpoint)',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BookingRequestServiceDto.prototype, "businessServiceId", void 0);
class CreateBookingRequestDto {
}
exports.CreateBookingRequestDto = CreateBookingRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Business Owner ID where services will be provided',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateBookingRequestDto.prototype, "businessOwnerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Requested appointment date (YYYY-MM-DD)',
        example: '2024-01-15',
    }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateBookingRequestDto.prototype, "requestedDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Requested start time in HH:MM format (24-hour)',
        example: '10:00',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'Start time must be in HH:MM format',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateBookingRequestDto.prototype, "requestedStartTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Requested end time in HH:MM format (24-hour)',
        example: '12:00',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'End time must be in HH:MM format',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateBookingRequestDto.prototype, "requestedEndTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional preferred staff member ID',
        example: '456e7890-e12b-34c5-d678-901234567890',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateBookingRequestDto.prototype, "requestedStaffId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'List of business service IDs to book (can combine with service packages)',
        type: [String],
        required: false,
        example: ['123e4567-e89b-12d3-a456-426614174000', '456e7890-e12b-34c5-d678-901234567890'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)(4, { each: true }),
    __metadata("design:type", Array)
], CreateBookingRequestDto.prototype, "businessServiceIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'List of service package IDs to book (can combine with individual services)',
        type: [String],
        required: false,
        example: ['789e0123-e45f-67g8-h901-234567890123'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)(4, { each: true }),
    __metadata("design:type", Array)
], CreateBookingRequestDto.prototype, "servicePackageIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Service location preference - where the service will be provided',
        enum: enums_1.ServiceLocation,
        example: enums_1.ServiceLocation.IN_SALON,
        required: false,
        default: enums_1.ServiceLocation.IN_SALON,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.ServiceLocation),
    __metadata("design:type", String)
], CreateBookingRequestDto.prototype, "serviceLocation", void 0);
class AssignStaffDto {
}
exports.AssignStaffDto = AssignStaffDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Staff member ID to assign to this booking request',
        example: '789e0123-e45f-67g8-h901-234567890123',
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AssignStaffDto.prototype, "staffId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Adjusted start time (optional)',
        example: '10:30',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'Start time must be in HH:MM format',
    }),
    __metadata("design:type", String)
], AssignStaffDto.prototype, "adjustedStartTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Adjusted end time (optional)',
        example: '12:30',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'End time must be in HH:MM format',
    }),
    __metadata("design:type", String)
], AssignStaffDto.prototype, "adjustedEndTime", void 0);
class ApproveBookingRequestDto {
}
exports.ApproveBookingRequestDto = ApproveBookingRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Final price adjustment (optional)',
        example: 150.00,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ApproveBookingRequestDto.prototype, "finalPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Business owner notes for the booking',
        example: 'Confirmed with premium products',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApproveBookingRequestDto.prototype, "businessNotes", void 0);
class RejectBookingRequestDto {
}
exports.RejectBookingRequestDto = RejectBookingRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Reason for rejecting the booking request',
        example: 'Staff not available at requested time',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RejectBookingRequestDto.prototype, "rejectionReason", void 0);
class BookingRequestQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
    }
}
exports.BookingRequestQueryDto = BookingRequestQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by booking request status',
        enum: booking_request_entity_1.BookingRequestStatus,
        required: false,
        example: booking_request_entity_1.BookingRequestStatus.PENDING,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(booking_request_entity_1.BookingRequestStatus),
    __metadata("design:type", String)
], BookingRequestQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by service location (at-home or in-salon)',
        enum: enums_1.ServiceLocation,
        required: false,
        example: enums_1.ServiceLocation.IN_SALON,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.ServiceLocation),
    __metadata("design:type", String)
], BookingRequestQueryDto.prototype, "serviceLocation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Page number for pagination',
        example: 1,
        default: 1,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], BookingRequestQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of items per page',
        example: 10,
        default: 10,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], BookingRequestQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by assigned staff ID (optional) - shows only bookings assigned to this staff member',
        required: false,
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], BookingRequestQueryDto.prototype, "staffId", void 0);
//# sourceMappingURL=booking-request.dto.js.map