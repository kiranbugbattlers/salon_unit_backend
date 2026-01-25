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
exports.CreateBookingDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const enums_1 = require("../../common/enums");
const customer_address_dto_1 = require("./customer-address.dto");
class CreateBookingDto {
}
exports.CreateBookingDto = CreateBookingDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Business Owner ID where services will be provided',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "businessOwnerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Requested appointment date (YYYY-MM-DD)',
        example: '2024-01-15',
    }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "requestedDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Requested start time in HH:MM format (24-hour)',
        example: '10:30',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'Start time must be in HH:MM format',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "requestedStartTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Requested end time in HH:MM format (24-hour)',
        example: '13:00',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'End time must be in HH:MM format',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "requestedEndTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional preferred staff member ID',
        example: '456e7890-e12b-34c5-d678-901234567890',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "requestedStaffId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'List of business service IDs to book (can combine with service packages)',
        type: [String],
        required: false,
        example: ['123e4567-e89b-12d3-a456-426614174000'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)(4, { each: true }),
    __metadata("design:type", Array)
], CreateBookingDto.prototype, "businessServiceIds", void 0);
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
], CreateBookingDto.prototype, "servicePackageIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Service location preference - where the service will be performed',
        enum: enums_1.ServiceLocation,
        required: false,
        example: enums_1.ServiceLocation.IN_SALON,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.ServiceLocation, {
        message: 'Service location must be either "in-salon" or "at-home"',
    }),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "serviceLocation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Special requests or notes from customer',
        required: false,
        example: 'Please be gentle, I have sensitive skin',
        maxLength: 500,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500, {
        message: 'Special requests cannot exceed 500 characters',
    }),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "specialRequests", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Customer address (required if serviceLocation is at-home). Includes lat/long for delivery charge calculation.',
        required: false,
        type: customer_address_dto_1.CustomerAddressDto,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => o.serviceLocation === enums_1.ServiceLocation.AT_HOME),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => customer_address_dto_1.CustomerAddressDto),
    __metadata("design:type", customer_address_dto_1.CustomerAddressDto)
], CreateBookingDto.prototype, "customerAddress", void 0);
//# sourceMappingURL=create-booking.dto.js.map