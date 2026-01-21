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
exports.BookedSlotsResponseDto = exports.BookedSlotsDataDto = exports.BookedSlotItemDto = exports.BookedSlotsQueryDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const api_response_dto_1 = require("../../common/dto/api-response.dto");
class BookedSlotsQueryDto {
}
exports.BookedSlotsQueryDto = BookedSlotsQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Date to check for booked slots (YYYY-MM-DD format)',
        example: '2024-01-15',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], BookedSlotsQueryDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Staff member UUID to check availability for. If not provided, returns booked slots for all staff members.',
        example: 'staff-uuid-here',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(4),
    __metadata("design:type", String)
], BookedSlotsQueryDto.prototype, "staffId", void 0);
class BookedSlotItemDto {
}
exports.BookedSlotItemDto = BookedSlotItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique booking ID' }),
    __metadata("design:type", String)
], BookedSlotItemDto.prototype, "bookingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Start time of the booking in HH:MM format' }),
    __metadata("design:type", String)
], BookedSlotItemDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'End time of the booking in HH:MM format' }),
    __metadata("design:type", String)
], BookedSlotItemDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Name of the service being provided' }),
    __metadata("design:type", String)
], BookedSlotItemDto.prototype, "serviceName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Status of the booking' }),
    __metadata("design:type", String)
], BookedSlotItemDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Service location', required: false }),
    __metadata("design:type", String)
], BookedSlotItemDto.prototype, "serviceLocation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer name (first name only for privacy)', required: false }),
    __metadata("design:type", String)
], BookedSlotItemDto.prototype, "customerFirstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Staff member ID assigned to this booking' }),
    __metadata("design:type", String)
], BookedSlotItemDto.prototype, "staffId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Staff member name assigned to this booking' }),
    __metadata("design:type", String)
], BookedSlotItemDto.prototype, "staffName", void 0);
class BookedSlotsDataDto {
}
exports.BookedSlotsDataDto = BookedSlotsDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date being queried' }),
    __metadata("design:type", String)
], BookedSlotsDataDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Staff ID being queried (if filtering by specific staff)', required: false }),
    __metadata("design:type", String)
], BookedSlotsDataDto.prototype, "staffId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business shop ID' }),
    __metadata("design:type", String)
], BookedSlotsDataDto.prototype, "shopId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Staff member name (if filtering by specific staff)', required: false }),
    __metadata("design:type", String)
], BookedSlotsDataDto.prototype, "staffName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'List of booked time slots for the date', type: [BookedSlotItemDto] }),
    __metadata("design:type", Array)
], BookedSlotsDataDto.prototype, "bookedSlots", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of bookings for the day' }),
    __metadata("design:type", Number)
], BookedSlotsDataDto.prototype, "totalBookings", void 0);
class BookedSlotsResponseDto extends api_response_dto_1.ApiResponseDto {
    constructor(code, success, message, data) {
        super(code, success, message, data);
    }
}
exports.BookedSlotsResponseDto = BookedSlotsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], BookedSlotsResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], BookedSlotsResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Booked slots retrieved successfully' }),
    __metadata("design:type", String)
], BookedSlotsResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", BookedSlotsDataDto)
], BookedSlotsResponseDto.prototype, "data", void 0);
//# sourceMappingURL=booked-slots.dto.js.map