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
exports.BookingQueryDto = exports.BookingListResponseDto = exports.BookingResponseDto = exports.BookingDto = exports.ServiceDto = exports.StaffDto = exports.BusinessDto = exports.CustomerDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const enums_1 = require("../../common/enums");
const api_response_dto_1 = require("../../common/dto/api-response.dto");
class CustomerDto {
}
exports.CustomerDto = CustomerDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Customer ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], CustomerDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Customer first name',
        example: 'John',
    }),
    __metadata("design:type", String)
], CustomerDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Customer last name',
        example: 'Doe',
    }),
    __metadata("design:type", String)
], CustomerDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Customer email',
        example: 'john.doe@example.com',
    }),
    __metadata("design:type", String)
], CustomerDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Customer phone number',
        example: '+1234567890',
    }),
    __metadata("design:type", String)
], CustomerDto.prototype, "phone", void 0);
class BusinessDto {
}
exports.BusinessDto = BusinessDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Business ID',
        example: '456e7890-e12b-34c5-d678-901234567890',
    }),
    __metadata("design:type", String)
], BusinessDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique shop identifier',
        example: 'SH-123456',
    }),
    __metadata("design:type", String)
], BusinessDto.prototype, "shopId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Business name',
        example: 'Elite Hair Salon',
    }),
    __metadata("design:type", String)
], BusinessDto.prototype, "businessName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Business address',
        example: '123 Main St, New York, NY',
    }),
    __metadata("design:type", String)
], BusinessDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Business phone number',
        example: '+1987654321',
    }),
    __metadata("design:type", String)
], BusinessDto.prototype, "phone", void 0);
class StaffDto {
}
exports.StaffDto = StaffDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Staff ID',
        example: '789e0123-e45f-67g8-h901-234567890123',
    }),
    __metadata("design:type", String)
], StaffDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Staff first name',
        example: 'Jane',
    }),
    __metadata("design:type", String)
], StaffDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Staff last name',
        example: 'Smith',
    }),
    __metadata("design:type", String)
], StaffDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Staff profile picture URL',
        example: 'uploads/staff/profile-pic.jpg',
        required: false,
    }),
    __metadata("design:type", String)
], StaffDto.prototype, "profilePic", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Staff profile picture CDN URL',
        example: 'https://cdn.example.com/staff/profile-pic.jpg',
        required: false,
    }),
    __metadata("design:type", String)
], StaffDto.prototype, "profilePicCdnUrl", void 0);
class ServiceDto {
}
exports.ServiceDto = ServiceDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Service ID',
        example: '012e3456-e78f-90g1-h234-567890123456',
    }),
    __metadata("design:type", String)
], ServiceDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Service name',
        example: 'Premium Hair Cut',
    }),
    __metadata("design:type", String)
], ServiceDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Service description',
        example: 'Professional hair cutting service with styling',
    }),
    __metadata("design:type", String)
], ServiceDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Service default duration in minutes',
        example: 60,
    }),
    __metadata("design:type", Number)
], ServiceDto.prototype, "defaultDuration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Service base price',
        example: 75.50,
    }),
    __metadata("design:type", Number)
], ServiceDto.prototype, "basePrice", void 0);
class BookingDto {
}
exports.BookingDto = BookingDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Booking ID',
        example: '345e6789-e01f-23g4-h567-890123456789',
    }),
    __metadata("design:type", String)
], BookingDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Appointment date',
        example: '2024-01-15',
    }),
    __metadata("design:type", String)
], BookingDto.prototype, "appointmentDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Start time',
        example: '10:30',
    }),
    __metadata("design:type", String)
], BookingDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'End time',
        example: '11:30',
    }),
    __metadata("design:type", String)
], BookingDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Booking status',
        enum: enums_1.BookingStatus,
        example: enums_1.BookingStatus.CONFIRMED,
    }),
    __metadata("design:type", String)
], BookingDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Service location',
        enum: enums_1.ServiceLocation,
        example: enums_1.ServiceLocation.IN_SALON,
    }),
    __metadata("design:type", String)
], BookingDto.prototype, "serviceLocation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total amount',
        example: 75.50,
    }),
    __metadata("design:type", Number)
], BookingDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Special requests',
        example: 'Customer prefers organic products',
        nullable: true,
    }),
    __metadata("design:type", String)
], BookingDto.prototype, "specialRequests", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Booking creation date',
        example: '2024-01-10T10:30:00Z',
    }),
    __metadata("design:type", Date)
], BookingDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last update date',
        example: '2024-01-10T10:30:00Z',
    }),
    __metadata("design:type", Date)
], BookingDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Customer information',
        type: CustomerDto,
    }),
    __metadata("design:type", CustomerDto)
], BookingDto.prototype, "customer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Business information',
        type: BusinessDto,
    }),
    __metadata("design:type", BusinessDto)
], BookingDto.prototype, "business", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Staff information',
        type: StaffDto,
    }),
    __metadata("design:type", StaffDto)
], BookingDto.prototype, "staff", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Service information',
        type: ServiceDto,
    }),
    __metadata("design:type", ServiceDto)
], BookingDto.prototype, "service", void 0);
class BookingResponseDto extends api_response_dto_1.ApiResponseDto {
}
exports.BookingResponseDto = BookingResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], BookingResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], BookingResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Booking operation completed successfully' }),
    __metadata("design:type", String)
], BookingResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Booking data',
        type: BookingDto,
    }),
    __metadata("design:type", BookingDto)
], BookingResponseDto.prototype, "data", void 0);
class BookingListResponseDto extends api_response_dto_1.ApiResponseDto {
}
exports.BookingListResponseDto = BookingListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], BookingListResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], BookingListResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Bookings retrieved successfully' }),
    __metadata("design:type", String)
], BookingListResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'List of bookings',
        type: [BookingDto],
    }),
    __metadata("design:type", Array)
], BookingListResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Pagination metadata',
    }),
    __metadata("design:type", Object)
], BookingListResponseDto.prototype, "meta", void 0);
class BookingQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
    }
}
exports.BookingQueryDto = BookingQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by booking status',
        enum: enums_1.BookingStatus,
        required: false,
        example: enums_1.BookingStatus.CONFIRMED,
    }),
    __metadata("design:type", String)
], BookingQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by appointment date (YYYY-MM-DD)',
        example: '2024-01-15',
        required: false,
    }),
    __metadata("design:type", String)
], BookingQueryDto.prototype, "appointmentDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter from date (YYYY-MM-DD)',
        example: '2024-01-01',
        required: false,
    }),
    __metadata("design:type", String)
], BookingQueryDto.prototype, "fromDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter to date (YYYY-MM-DD)',
        example: '2024-01-31',
        required: false,
    }),
    __metadata("design:type", String)
], BookingQueryDto.prototype, "toDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Page number for pagination',
        example: 1,
        default: 1,
        required: false,
    }),
    __metadata("design:type", Number)
], BookingQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of items per page',
        example: 10,
        default: 10,
        required: false,
    }),
    __metadata("design:type", Number)
], BookingQueryDto.prototype, "limit", void 0);
//# sourceMappingURL=booking-response.dto.js.map