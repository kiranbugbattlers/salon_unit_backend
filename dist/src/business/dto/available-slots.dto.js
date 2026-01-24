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
exports.AvailableSlotsResponseDto = exports.DayAvailabilityDto = exports.TimeSlotDto = exports.AvailableSlotsQueryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class AvailableSlotsQueryDto {
}
exports.AvailableSlotsQueryDto = AvailableSlotsQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Start date for slot availability check',
        example: '2024-01-15',
        type: String,
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AvailableSlotsQueryDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of days to check (1-6)',
        example: 3,
        minimum: 1,
        maximum: 6,
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(6),
    __metadata("design:type", Number)
], AvailableSlotsQueryDto.prototype, "numberOfDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional staff ID to filter slots for specific staff member',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AvailableSlotsQueryDto.prototype, "staffId", void 0);
class TimeSlotDto {
}
exports.TimeSlotDto = TimeSlotDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Start time of the slot',
        example: '09:00',
    }),
    __metadata("design:type", String)
], TimeSlotDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'End time of the slot',
        example: '10:00',
    }),
    __metadata("design:type", String)
], TimeSlotDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether this slot is available for booking',
        example: true,
    }),
    __metadata("design:type", Boolean)
], TimeSlotDto.prototype, "isAvailable", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Staff member details for this slot',
    }),
    __metadata("design:type", Object)
], TimeSlotDto.prototype, "staff", void 0);
class DayAvailabilityDto {
}
exports.DayAvailabilityDto = DayAvailabilityDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Date for this day availability',
        example: '2024-01-15',
    }),
    __metadata("design:type", String)
], DayAvailabilityDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Day of the week',
        example: 'Monday',
    }),
    __metadata("design:type", String)
], DayAvailabilityDto.prototype, "dayOfWeek", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the business is open on this day',
        example: true,
    }),
    __metadata("design:type", Boolean)
], DayAvailabilityDto.prototype, "isBusinessOpen", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Business operating hours for this day',
        nullable: true,
    }),
    __metadata("design:type", Object)
], DayAvailabilityDto.prototype, "businessHours", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Available time slots for this day',
        type: [TimeSlotDto],
    }),
    __metadata("design:type", Array)
], DayAvailabilityDto.prototype, "timeSlots", void 0);
class AvailableSlotsResponseDto {
}
exports.AvailableSlotsResponseDto = AvailableSlotsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Business information',
    }),
    __metadata("design:type", Object)
], AvailableSlotsResponseDto.prototype, "business", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Date range for availability check',
    }),
    __metadata("design:type", Object)
], AvailableSlotsResponseDto.prototype, "dateRange", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Availability data for each day',
        type: [DayAvailabilityDto],
    }),
    __metadata("design:type", Array)
], AvailableSlotsResponseDto.prototype, "days", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total number of available slots across all days',
        example: 42,
    }),
    __metadata("design:type", Number)
], AvailableSlotsResponseDto.prototype, "totalAvailableSlots", void 0);
//# sourceMappingURL=available-slots.dto.js.map