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
exports.OnboardingStep2Dto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const enums_1 = require("../../common/enums");
class OnboardingStep2Dto {
    constructor() {
        this.addressType = enums_1.AddressType.HOME;
    }
}
exports.OnboardingStep2Dto = OnboardingStep2Dto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Latitude',
        example: 28.6139,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], OnboardingStep2Dto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Longitude',
        example: 77.2090,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], OnboardingStep2Dto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Street address',
        example: '123 Main Street',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OnboardingStep2Dto.prototype, "streetAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Address line 1 (optional)',
        example: 'Apartment 4B',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OnboardingStep2Dto.prototype, "addressLine1", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Address line 2 (optional)',
        example: 'Near Park',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OnboardingStep2Dto.prototype, "addressLine2", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Landmark (optional)',
        example: 'Next to Coffee Shop',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OnboardingStep2Dto.prototype, "landmark", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'City',
        example: 'Delhi',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OnboardingStep2Dto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'State',
        example: 'Delhi',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OnboardingStep2Dto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Postal code',
        example: '110001',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OnboardingStep2Dto.prototype, "postalCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Address type',
        enum: enums_1.AddressType,
        example: enums_1.AddressType.HOME,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.AddressType),
    __metadata("design:type", String)
], OnboardingStep2Dto.prototype, "addressType", void 0);
//# sourceMappingURL=onboarding-step2.dto.js.map