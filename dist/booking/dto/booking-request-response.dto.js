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
exports.BusinessOwnerBookingRequestListResponseDto = exports.BusinessOwnerBookingRequestResponseDto = exports.BusinessOwnerBookingRequestDetailDto = exports.BookingRequestListResponseDto = exports.BookingRequestResponseDto = exports.BookingRequestDetailDto = exports.StaffDetailDto = exports.BusinessDetailDto = exports.CustomerDetailDto = exports.BookingRequestServiceDetailDto = exports.BusinessServiceDetailDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const booking_request_entity_1 = require("../../database/entities/booking-request.entity");
const enums_1 = require("../../common/enums");
const api_response_dto_1 = require("../../common/dto/api-response.dto");
const payment_info_dto_1 = require("./payment-info.dto");
const booking_details_dto_1 = require("./booking-details.dto");
const customer_address_dto_1 = require("./customer-address.dto");
class BusinessServiceDetailDto {
}
exports.BusinessServiceDetailDto = BusinessServiceDetailDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Business Service ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], BusinessServiceDetailDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Custom price set by business owner',
        example: 75.50,
    }),
    __metadata("design:type", Number)
], BusinessServiceDetailDto.prototype, "customPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Custom duration in minutes set by business owner',
        example: 60,
    }),
    __metadata("design:type", Number)
], BusinessServiceDetailDto.prototype, "customDurationMinutes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Base service information',
    }),
    __metadata("design:type", Object)
], BusinessServiceDetailDto.prototype, "service", void 0);
class BookingRequestServiceDetailDto {
}
exports.BookingRequestServiceDetailDto = BookingRequestServiceDetailDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Booking Request Service ID',
        example: '456e7890-e12b-34c5-d678-901234567890',
    }),
    __metadata("design:type", String)
], BookingRequestServiceDetailDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Quantity of this service requested',
        example: 1,
    }),
    __metadata("design:type", Number)
], BookingRequestServiceDetailDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Estimated price for this service',
        example: 75.50,
    }),
    __metadata("design:type", Number)
], BookingRequestServiceDetailDto.prototype, "estimatedPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Estimated duration in minutes',
        example: 60,
    }),
    __metadata("design:type", Number)
], BookingRequestServiceDetailDto.prototype, "estimatedDuration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Business service details',
        type: BusinessServiceDetailDto,
    }),
    __metadata("design:type", BusinessServiceDetailDto)
], BookingRequestServiceDetailDto.prototype, "businessService", void 0);
class CustomerDetailDto {
}
exports.CustomerDetailDto = CustomerDetailDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Customer ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], CustomerDetailDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Customer first name',
        example: 'John',
    }),
    __metadata("design:type", String)
], CustomerDetailDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Customer last name',
        example: 'Doe',
    }),
    __metadata("design:type", String)
], CustomerDetailDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Customer email',
        example: 'john.doe@example.com',
    }),
    __metadata("design:type", String)
], CustomerDetailDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Customer phone number',
        example: '+1234567890',
    }),
    __metadata("design:type", String)
], CustomerDetailDto.prototype, "phone", void 0);
class BusinessDetailDto {
}
exports.BusinessDetailDto = BusinessDetailDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Business ID',
        example: '456e7890-e12b-34c5-d678-901234567890',
    }),
    __metadata("design:type", String)
], BusinessDetailDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique shop identifier',
        example: 'SH-123456',
    }),
    __metadata("design:type", String)
], BusinessDetailDto.prototype, "shopId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Business name',
        example: 'Elite Hair Salon',
    }),
    __metadata("design:type", String)
], BusinessDetailDto.prototype, "businessName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Business address',
        example: '123 Main St, New York, NY',
    }),
    __metadata("design:type", String)
], BusinessDetailDto.prototype, "address", void 0);
class StaffDetailDto {
}
exports.StaffDetailDto = StaffDetailDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Staff ID',
        example: '789e0123-e45f-67g8-h901-234567890123',
    }),
    __metadata("design:type", String)
], StaffDetailDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Staff first name',
        example: 'Jane',
    }),
    __metadata("design:type", String)
], StaffDetailDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Staff last name',
        example: 'Smith',
    }),
    __metadata("design:type", String)
], StaffDetailDto.prototype, "lastName", void 0);
class BookingRequestDetailDto {
}
exports.BookingRequestDetailDto = BookingRequestDetailDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Booking Request ID',
        example: '345e6789-e01f-23g4-h567-890123456789',
    }),
    __metadata("design:type", String)
], BookingRequestDetailDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Requested appointment date',
        example: '2024-01-15',
    }),
    __metadata("design:type", String)
], BookingRequestDetailDto.prototype, "requestedDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Requested start time',
        example: '10:00',
    }),
    __metadata("design:type", String)
], BookingRequestDetailDto.prototype, "requestedStartTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Requested end time',
        example: '12:00',
    }),
    __metadata("design:type", String)
], BookingRequestDetailDto.prototype, "requestedEndTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Booking request status',
        enum: booking_request_entity_1.BookingRequestStatus,
        example: booking_request_entity_1.BookingRequestStatus.PENDING,
    }),
    __metadata("design:type", String)
], BookingRequestDetailDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Service location preference',
        enum: enums_1.ServiceLocation,
        example: enums_1.ServiceLocation.IN_SALON,
        nullable: true,
    }),
    __metadata("design:type", String)
], BookingRequestDetailDto.prototype, "serviceLocation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total estimated price for all services',
        example: 150.00,
    }),
    __metadata("design:type", Number)
], BookingRequestDetailDto.prototype, "totalEstimatedPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total estimated duration in minutes',
        example: 120,
    }),
    __metadata("design:type", Number)
], BookingRequestDetailDto.prototype, "totalEstimatedDuration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Business owner rejection reason',
        example: 'Staff not available',
        nullable: true,
    }),
    __metadata("design:type", String)
], BookingRequestDetailDto.prototype, "rejectionReason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Business owner notes',
        example: 'Confirmed with premium products',
        nullable: true,
    }),
    __metadata("design:type", String)
], BookingRequestDetailDto.prototype, "businessNotes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Final approved start time',
        example: '10:30',
        nullable: true,
    }),
    __metadata("design:type", String)
], BookingRequestDetailDto.prototype, "approvedStartTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Final approved end time',
        example: '12:30',
        nullable: true,
    }),
    __metadata("design:type", String)
], BookingRequestDetailDto.prototype, "approvedEndTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Final approved price',
        example: 140.00,
        nullable: true,
    }),
    __metadata("design:type", Number)
], BookingRequestDetailDto.prototype, "finalPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Request creation date',
        example: '2024-01-10T10:30:00Z',
    }),
    __metadata("design:type", Date)
], BookingRequestDetailDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last update date',
        example: '2024-01-10T14:30:00Z',
    }),
    __metadata("design:type", Date)
], BookingRequestDetailDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Customer information',
        type: CustomerDetailDto,
    }),
    __metadata("design:type", CustomerDetailDto)
], BookingRequestDetailDto.prototype, "customer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Business information',
        type: BusinessDetailDto,
    }),
    __metadata("design:type", BusinessDetailDto)
], BookingRequestDetailDto.prototype, "business", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Requested staff information',
        type: StaffDetailDto,
        nullable: true,
    }),
    __metadata("design:type", StaffDetailDto)
], BookingRequestDetailDto.prototype, "requestedStaff", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Assigned staff information',
        type: StaffDetailDto,
        nullable: true,
    }),
    __metadata("design:type", StaffDetailDto)
], BookingRequestDetailDto.prototype, "assignedStaff", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Requested services details',
        type: [BookingRequestServiceDetailDto],
    }),
    __metadata("design:type", Array)
], BookingRequestDetailDto.prototype, "services", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Confirmed booking ID if approved',
        example: '012e3456-e78f-90g1-h234-567890123456',
        nullable: true,
    }),
    __metadata("design:type", String)
], BookingRequestDetailDto.prototype, "confirmedBookingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'OTP code for booking verification (6-digit code)',
        example: '123456',
        nullable: true,
    }),
    __metadata("design:type", String)
], BookingRequestDetailDto.prototype, "otpCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Arrival OTP for customer to show at shop before payment (6-digit code)',
        example: '654321',
        nullable: true,
    }),
    __metadata("design:type", String)
], BookingRequestDetailDto.prototype, "arrivalOtp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Computed lifecycle state for UI rendering (uses extended status values)',
        enum: booking_request_entity_1.BookingRequestStatus,
        example: booking_request_entity_1.BookingRequestStatus.PENDING,
    }),
    __metadata("design:type", String)
], BookingRequestDetailDto.prototype, "lifecycleState", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Flag indicating if staff has been assigned',
        example: false,
    }),
    __metadata("design:type", Boolean)
], BookingRequestDetailDto.prototype, "isStaffAssigned", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Flag indicating if request has been approved by business owner',
        example: false,
    }),
    __metadata("design:type", Boolean)
], BookingRequestDetailDto.prototype, "isApproved", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Flag indicating if payment is pending from customer',
        example: false,
    }),
    __metadata("design:type", Boolean)
], BookingRequestDetailDto.prototype, "isPaymentPending", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Flag indicating if payment has been completed',
        example: false,
    }),
    __metadata("design:type", Boolean)
], BookingRequestDetailDto.prototype, "isPaymentCompleted", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Flag indicating if confirmed booking exists',
        example: false,
    }),
    __metadata("design:type", Boolean)
], BookingRequestDetailDto.prototype, "isConfirmed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Flag indicating if customer can cancel this request',
        example: true,
    }),
    __metadata("design:type", Boolean)
], BookingRequestDetailDto.prototype, "canCancel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Flag indicating if payment button should be shown',
        example: false,
    }),
    __metadata("design:type", Boolean)
], BookingRequestDetailDto.prototype, "canPay", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Flag indicating if customer action is required',
        example: false,
    }),
    __metadata("design:type", Boolean)
], BookingRequestDetailDto.prototype, "requiresAction", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Booking status from confirmed booking (when payment completed)',
        enum: enums_1.BookingStatus,
        example: enums_1.BookingStatus.CONFIRMED,
        nullable: true,
    }),
    __metadata("design:type", String)
], BookingRequestDetailDto.prototype, "bookingStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timestamp when OTP was verified by business owner',
        example: '2024-01-15T10:30:00Z',
        nullable: true,
    }),
    __metadata("design:type", Date)
], BookingRequestDetailDto.prototype, "otpVerifiedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timestamp when service was started',
        example: '2024-01-15T10:30:00Z',
        nullable: true,
    }),
    __metadata("design:type", Date)
], BookingRequestDetailDto.prototype, "serviceStartedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timestamp when service was completed',
        example: '2024-01-15T11:30:00Z',
        nullable: true,
    }),
    __metadata("design:type", Date)
], BookingRequestDetailDto.prototype, "serviceCompletedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Minimal payment information (varies by payment method)',
        type: payment_info_dto_1.PaymentInfoDto,
        nullable: true,
    }),
    __metadata("design:type", payment_info_dto_1.PaymentInfoDto)
], BookingRequestDetailDto.prototype, "paymentInfo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Detailed booking information with add-on services breakdown (only available in detail endpoint, null in list endpoint)',
        type: booking_details_dto_1.BookingDetailsDto,
        nullable: true,
    }),
    __metadata("design:type", booking_details_dto_1.BookingDetailsDto)
], BookingRequestDetailDto.prototype, "bookingDetails", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Customer delivery address (only for at-home services)',
        type: customer_address_dto_1.CustomerAddressDto,
        nullable: true,
    }),
    __metadata("design:type", customer_address_dto_1.CustomerAddressDto)
], BookingRequestDetailDto.prototype, "customerAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Delivery charge for at-home services',
        example: 50.00,
        default: 0,
    }),
    __metadata("design:type", Number)
], BookingRequestDetailDto.prototype, "deliveryCharge", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Delivery distance in kilometers',
        example: 5.25,
        nullable: true,
    }),
    __metadata("design:type", Number)
], BookingRequestDetailDto.prototype, "deliveryDistance", void 0);
class BookingRequestResponseDto extends api_response_dto_1.ApiResponseDto {
}
exports.BookingRequestResponseDto = BookingRequestResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], BookingRequestResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], BookingRequestResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Booking request operation completed successfully' }),
    __metadata("design:type", String)
], BookingRequestResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Booking request data',
        type: BookingRequestDetailDto,
    }),
    __metadata("design:type", BookingRequestDetailDto)
], BookingRequestResponseDto.prototype, "data", void 0);
class BookingRequestListResponseDto extends api_response_dto_1.ApiResponseDto {
}
exports.BookingRequestListResponseDto = BookingRequestListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], BookingRequestListResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], BookingRequestListResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Booking requests retrieved successfully' }),
    __metadata("design:type", String)
], BookingRequestListResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'List of booking requests',
        type: [BookingRequestDetailDto],
    }),
    __metadata("design:type", Array)
], BookingRequestListResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Pagination metadata',
    }),
    __metadata("design:type", Object)
], BookingRequestListResponseDto.prototype, "meta", void 0);
class BusinessOwnerBookingRequestDetailDto {
}
exports.BusinessOwnerBookingRequestDetailDto = BusinessOwnerBookingRequestDetailDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Booking Request ID',
        example: '345e6789-e01f-23g4-h567-890123456789',
    }),
    __metadata("design:type", String)
], BusinessOwnerBookingRequestDetailDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Requested appointment date',
        example: '2024-01-15',
    }),
    __metadata("design:type", String)
], BusinessOwnerBookingRequestDetailDto.prototype, "requestedDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Requested start time',
        example: '10:00',
    }),
    __metadata("design:type", String)
], BusinessOwnerBookingRequestDetailDto.prototype, "requestedStartTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Requested end time',
        example: '12:00',
    }),
    __metadata("design:type", String)
], BusinessOwnerBookingRequestDetailDto.prototype, "requestedEndTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Booking request status',
        enum: booking_request_entity_1.BookingRequestStatus,
        example: booking_request_entity_1.BookingRequestStatus.PENDING,
    }),
    __metadata("design:type", String)
], BusinessOwnerBookingRequestDetailDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Service location preference',
        enum: enums_1.ServiceLocation,
        example: enums_1.ServiceLocation.IN_SALON,
        nullable: true,
    }),
    __metadata("design:type", String)
], BusinessOwnerBookingRequestDetailDto.prototype, "serviceLocation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total estimated price for all services',
        example: 150.00,
    }),
    __metadata("design:type", Number)
], BusinessOwnerBookingRequestDetailDto.prototype, "totalEstimatedPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total estimated duration in minutes',
        example: 120,
    }),
    __metadata("design:type", Number)
], BusinessOwnerBookingRequestDetailDto.prototype, "totalEstimatedDuration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Business owner rejection reason',
        example: 'Staff not available',
        nullable: true,
    }),
    __metadata("design:type", String)
], BusinessOwnerBookingRequestDetailDto.prototype, "rejectionReason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Business owner notes',
        example: 'Confirmed with premium products',
        nullable: true,
    }),
    __metadata("design:type", String)
], BusinessOwnerBookingRequestDetailDto.prototype, "businessNotes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Final approved start time',
        example: '10:30',
        nullable: true,
    }),
    __metadata("design:type", String)
], BusinessOwnerBookingRequestDetailDto.prototype, "approvedStartTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Final approved end time',
        example: '12:30',
        nullable: true,
    }),
    __metadata("design:type", String)
], BusinessOwnerBookingRequestDetailDto.prototype, "approvedEndTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Final approved price',
        example: 140.00,
        nullable: true,
    }),
    __metadata("design:type", Number)
], BusinessOwnerBookingRequestDetailDto.prototype, "finalPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Request creation date',
        example: '2024-01-10T10:30:00Z',
    }),
    __metadata("design:type", Date)
], BusinessOwnerBookingRequestDetailDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last update date',
        example: '2024-01-10T14:30:00Z',
    }),
    __metadata("design:type", Date)
], BusinessOwnerBookingRequestDetailDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Customer information',
        type: CustomerDetailDto,
    }),
    __metadata("design:type", CustomerDetailDto)
], BusinessOwnerBookingRequestDetailDto.prototype, "customer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Business information',
        type: BusinessDetailDto,
    }),
    __metadata("design:type", BusinessDetailDto)
], BusinessOwnerBookingRequestDetailDto.prototype, "business", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Requested staff information',
        type: StaffDetailDto,
        nullable: true,
    }),
    __metadata("design:type", StaffDetailDto)
], BusinessOwnerBookingRequestDetailDto.prototype, "requestedStaff", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Assigned staff information',
        type: StaffDetailDto,
        nullable: true,
    }),
    __metadata("design:type", StaffDetailDto)
], BusinessOwnerBookingRequestDetailDto.prototype, "assignedStaff", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Requested services details',
        type: [BookingRequestServiceDetailDto],
    }),
    __metadata("design:type", Array)
], BusinessOwnerBookingRequestDetailDto.prototype, "services", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Confirmed booking ID if approved',
        example: '012e3456-e78f-90g1-h234-567890123456',
        nullable: true,
    }),
    __metadata("design:type", String)
], BusinessOwnerBookingRequestDetailDto.prototype, "confirmedBookingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Computed lifecycle state for UI rendering (uses extended status values)',
        enum: booking_request_entity_1.BookingRequestStatus,
        example: booking_request_entity_1.BookingRequestStatus.PENDING,
    }),
    __metadata("design:type", String)
], BusinessOwnerBookingRequestDetailDto.prototype, "lifecycleState", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Flag indicating if staff has been assigned',
        example: false,
    }),
    __metadata("design:type", Boolean)
], BusinessOwnerBookingRequestDetailDto.prototype, "isStaffAssigned", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Flag indicating if request has been approved by business owner',
        example: false,
    }),
    __metadata("design:type", Boolean)
], BusinessOwnerBookingRequestDetailDto.prototype, "isApproved", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Flag indicating if payment is pending from customer',
        example: false,
    }),
    __metadata("design:type", Boolean)
], BusinessOwnerBookingRequestDetailDto.prototype, "isPaymentPending", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Flag indicating if payment has been completed',
        example: false,
    }),
    __metadata("design:type", Boolean)
], BusinessOwnerBookingRequestDetailDto.prototype, "isPaymentCompleted", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Flag indicating if confirmed booking exists',
        example: false,
    }),
    __metadata("design:type", Boolean)
], BusinessOwnerBookingRequestDetailDto.prototype, "isConfirmed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Flag indicating if customer can cancel this request',
        example: true,
    }),
    __metadata("design:type", Boolean)
], BusinessOwnerBookingRequestDetailDto.prototype, "canCancel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Flag indicating if payment button should be shown',
        example: false,
    }),
    __metadata("design:type", Boolean)
], BusinessOwnerBookingRequestDetailDto.prototype, "canPay", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Flag indicating if customer action is required',
        example: false,
    }),
    __metadata("design:type", Boolean)
], BusinessOwnerBookingRequestDetailDto.prototype, "requiresAction", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Booking status from confirmed booking (when payment completed)',
        enum: enums_1.BookingStatus,
        example: enums_1.BookingStatus.CONFIRMED,
        nullable: true,
    }),
    __metadata("design:type", String)
], BusinessOwnerBookingRequestDetailDto.prototype, "bookingStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timestamp when OTP was verified by business owner',
        example: '2024-01-15T10:30:00Z',
        nullable: true,
    }),
    __metadata("design:type", Date)
], BusinessOwnerBookingRequestDetailDto.prototype, "otpVerifiedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timestamp when service was started',
        example: '2024-01-15T10:30:00Z',
        nullable: true,
    }),
    __metadata("design:type", Date)
], BusinessOwnerBookingRequestDetailDto.prototype, "serviceStartedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timestamp when service was completed',
        example: '2024-01-15T11:30:00Z',
        nullable: true,
    }),
    __metadata("design:type", Date)
], BusinessOwnerBookingRequestDetailDto.prototype, "serviceCompletedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Minimal payment information (varies by payment method)',
        type: payment_info_dto_1.PaymentInfoDto,
        nullable: true,
    }),
    __metadata("design:type", payment_info_dto_1.PaymentInfoDto)
], BusinessOwnerBookingRequestDetailDto.prototype, "paymentInfo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Detailed booking information with add-on services breakdown (only available in detail endpoint, null in list endpoint)',
        type: booking_details_dto_1.BookingDetailsDto,
        nullable: true,
    }),
    __metadata("design:type", booking_details_dto_1.BookingDetailsDto)
], BusinessOwnerBookingRequestDetailDto.prototype, "bookingDetails", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Customer delivery address (only for at-home services)',
        type: customer_address_dto_1.CustomerAddressDto,
        nullable: true,
    }),
    __metadata("design:type", customer_address_dto_1.CustomerAddressDto)
], BusinessOwnerBookingRequestDetailDto.prototype, "customerAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Delivery charge for at-home services',
        example: 50.00,
        default: 0,
    }),
    __metadata("design:type", Number)
], BusinessOwnerBookingRequestDetailDto.prototype, "deliveryCharge", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Delivery distance in kilometers',
        example: 5.25,
        nullable: true,
    }),
    __metadata("design:type", Number)
], BusinessOwnerBookingRequestDetailDto.prototype, "deliveryDistance", void 0);
class BusinessOwnerBookingRequestResponseDto extends api_response_dto_1.ApiResponseDto {
}
exports.BusinessOwnerBookingRequestResponseDto = BusinessOwnerBookingRequestResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], BusinessOwnerBookingRequestResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], BusinessOwnerBookingRequestResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Booking request operation completed successfully' }),
    __metadata("design:type", String)
], BusinessOwnerBookingRequestResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Booking request data (business owner view - no OTP)',
        type: BusinessOwnerBookingRequestDetailDto,
    }),
    __metadata("design:type", BusinessOwnerBookingRequestDetailDto)
], BusinessOwnerBookingRequestResponseDto.prototype, "data", void 0);
class BusinessOwnerBookingRequestListResponseDto extends api_response_dto_1.ApiResponseDto {
}
exports.BusinessOwnerBookingRequestListResponseDto = BusinessOwnerBookingRequestListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], BusinessOwnerBookingRequestListResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], BusinessOwnerBookingRequestListResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Business owner booking requests retrieved successfully' }),
    __metadata("design:type", String)
], BusinessOwnerBookingRequestListResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'List of booking requests (business owner view - no OTP)',
        type: [BusinessOwnerBookingRequestDetailDto],
    }),
    __metadata("design:type", Array)
], BusinessOwnerBookingRequestListResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Pagination metadata',
    }),
    __metadata("design:type", Object)
], BusinessOwnerBookingRequestListResponseDto.prototype, "meta", void 0);
//# sourceMappingURL=booking-request-response.dto.js.map