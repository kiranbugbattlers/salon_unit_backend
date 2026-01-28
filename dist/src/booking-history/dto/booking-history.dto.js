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
exports.BookingHistoryQueryDto = exports.BookingHistoryListDto = exports.BookingHistoryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class BookingHistoryDto {
}
exports.BookingHistoryDto = BookingHistoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique booking ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    }),
    __metadata("design:type", String)
], BookingHistoryDto.prototype, "bookingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer name' }),
    __metadata("design:type", String)
], BookingHistoryDto.prototype, "customerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total booking amount',
        example: 150.00
    }),
    __metadata("design:type", Number)
], BookingHistoryDto.prototype, "bookingAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Payment Method: Cash / Online'
    }),
    __metadata("design:type", String)
], BookingHistoryDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Booking date & time',
        example: '2024-01-15T10:30:00.000Z'
    }),
    __metadata("design:type", Date)
], BookingHistoryDto.prototype, "bookingDateTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Booking creation date',
        example: '2024-01-15T10:30:00.000Z'
    }),
    __metadata("design:type", Date)
], BookingHistoryDto.prototype, "createdAt", void 0);
class BookingHistoryListDto {
}
exports.BookingHistoryListDto = BookingHistoryListDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of booking history',
        type: [BookingHistoryDto]
    }),
    __metadata("design:type", Array)
], BookingHistoryListDto.prototype, "bookings", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total number of bookings',
        example: 25
    }),
    __metadata("design:type", Number)
], BookingHistoryListDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current page number',
        example: 1
    }),
    __metadata("design:type", Number)
], BookingHistoryListDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of items per page',
        example: 10
    }),
    __metadata("design:type", Number)
], BookingHistoryListDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total number of pages',
        example: 3
    }),
    __metadata("design:type", Number)
], BookingHistoryListDto.prototype, "totalPages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether there are more pages',
        example: true
    }),
    __metadata("design:type", Boolean)
], BookingHistoryListDto.prototype, "hasNext", void 0);
class BookingHistoryQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
        this.sortBy = 'bookingDateTime';
        this.sortOrder = 'DESC';
    }
}
exports.BookingHistoryQueryDto = BookingHistoryQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by customer ID (UUID) - Admin only',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false
    }),
    __metadata("design:type", String)
], BookingHistoryQueryDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by business owner ID (UUID) - Admin only',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false
    }),
    __metadata("design:type", String)
], BookingHistoryQueryDto.prototype, "businessOwnerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by booking status',
        enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
        required: false
    }),
    __metadata("design:type", String)
], BookingHistoryQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by specific appointment date (YYYY-MM-DD)',
        example: '2024-01-15',
        required: false
    }),
    __metadata("design:type", String)
], BookingHistoryQueryDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by specific appointment date (YYYY-MM-DD)',
        example: '2024-01-15',
        required: false
    }),
    __metadata("design:type", String)
], BookingHistoryQueryDto.prototype, "appointmentDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by payment method',
        enum: ['cash', 'online'],
        required: false
    }),
    __metadata("design:type", String)
], BookingHistoryQueryDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter bookings from this date onwards (YYYY-MM-DD)',
        example: '2024-01-01',
        required: false
    }),
    __metadata("design:type", String)
], BookingHistoryQueryDto.prototype, "fromDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter bookings up to this date (YYYY-MM-DD)',
        example: '2024-01-31',
        required: false
    }),
    __metadata("design:type", String)
], BookingHistoryQueryDto.prototype, "toDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Page number for pagination',
        example: 1,
        required: false
    }),
    __metadata("design:type", Number)
], BookingHistoryQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of items per page',
        example: 10,
        required: false
    }),
    __metadata("design:type", Number)
], BookingHistoryQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Sort field',
        enum: ['bookingDateTime', 'bookingAmount', 'createdAt', 'totalAmount'],
        example: 'bookingDateTime',
        required: false
    }),
    __metadata("design:type", String)
], BookingHistoryQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Sort order',
        enum: ['ASC', 'DESC'],
        example: 'DESC',
        required: false
    }),
    __metadata("design:type", String)
], BookingHistoryQueryDto.prototype, "sortOrder", void 0);
//# sourceMappingURL=booking-history.dto.js.map