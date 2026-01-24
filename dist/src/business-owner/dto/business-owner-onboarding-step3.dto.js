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
exports.BusinessOwnerOnboardingStep3Dto = exports.ServiceOfferingDto = exports.BusinessHoursDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const enums_1 = require("../../common/enums");
class BusinessHoursDto {
}
exports.BusinessHoursDto = BusinessHoursDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Day of week (0=Sunday, 1=Monday, ..., 6=Saturday)',
        example: 1,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(6),
    __metadata("design:type", Number)
], BusinessHoursDto.prototype, "dayOfWeek", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Opening time (24-hour format)',
        example: '09:00',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BusinessHoursDto.prototype, "openTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Closing time (24-hour format)',
        example: '20:00',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BusinessHoursDto.prototype, "closeTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Is closed on this day',
        example: false,
        default: false,
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], BusinessHoursDto.prototype, "isClosed", void 0);
class ServiceOfferingDto {
}
exports.ServiceOfferingDto = ServiceOfferingDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the existing service from the service catalog',
        example: 'uuid-of-existing-service',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(4),
    __metadata("design:type", String)
], ServiceOfferingDto.prototype, "serviceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Custom price for this service (in INR)',
        example: 500,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ServiceOfferingDto.prototype, "customPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Custom duration for this service in minutes',
        example: 30,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ServiceOfferingDto.prototype, "customDurationMinutes", void 0);
class BusinessOwnerOnboardingStep3Dto {
}
exports.BusinessOwnerOnboardingStep3Dto = BusinessOwnerOnboardingStep3Dto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Services offered by the business owner',
        type: [ServiceOfferingDto],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ServiceOfferingDto),
    __metadata("design:type", Array)
], BusinessOwnerOnboardingStep3Dto.prototype, "servicesOffered", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Business hours for each day',
        type: [BusinessHoursDto],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => BusinessHoursDto),
    __metadata("design:type", Array)
], BusinessOwnerOnboardingStep3Dto.prototype, "businessHours", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Working days (0=Sunday, 1=Monday, ..., 6=Saturday)',
        example: [1, 2, 3, 4, 5, 6],
        type: [Number],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNumber)({}, { each: true }),
    __metadata("design:type", Array)
], BusinessOwnerOnboardingStep3Dto.prototype, "workingDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Service location type',
        enum: enums_1.ServiceLocationType,
        example: enums_1.ServiceLocationType.BOTH,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(enums_1.ServiceLocationType),
    __metadata("design:type", String)
], BusinessOwnerOnboardingStep3Dto.prototype, "serviceLocationType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Travel radius in kilometers (for user location services)',
        example: 5,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], BusinessOwnerOnboardingStep3Dto.prototype, "travelRadiusKm", void 0);
//# sourceMappingURL=business-owner-onboarding-step3.dto.js.map