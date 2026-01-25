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
exports.BusinessOwnerOnboardingStep2Dto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class BusinessOwnerOnboardingStep2Dto {
}
exports.BusinessOwnerOnboardingStep2Dto = BusinessOwnerOnboardingStep2Dto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Business/Shop name',
        example: 'Elite Hair Studio',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BusinessOwnerOnboardingStep2Dto.prototype, "businessName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Business description',
        example: 'Professional hair styling and grooming services with 10+ years of experience',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BusinessOwnerOnboardingStep2Dto.prototype, "businessDescription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Business latitude coordinate',
        example: 28.7041,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Transform)(({ value }) => parseFloat(value)),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BusinessOwnerOnboardingStep2Dto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Business longitude coordinate',
        example: 77.1025,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Transform)(({ value }) => parseFloat(value)),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BusinessOwnerOnboardingStep2Dto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Complete street address',
        example: '123, MG Road, Near Metro Station',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BusinessOwnerOnboardingStep2Dto.prototype, "streetAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Address line 1 (Building/Shop number)',
        example: 'Shop No. 15, Ground Floor',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BusinessOwnerOnboardingStep2Dto.prototype, "addressLine1", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Address line 2 (Area/Locality)',
        example: 'Connaught Place',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BusinessOwnerOnboardingStep2Dto.prototype, "addressLine2", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nearby landmark',
        example: 'Opposite City Mall',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BusinessOwnerOnboardingStep2Dto.prototype, "landmark", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'City',
        example: 'New Delhi',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BusinessOwnerOnboardingStep2Dto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'State',
        example: 'Delhi',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BusinessOwnerOnboardingStep2Dto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Postal code',
        example: '110001',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BusinessOwnerOnboardingStep2Dto.prototype, "postalCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Country',
        example: 'India',
        default: 'India',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BusinessOwnerOnboardingStep2Dto.prototype, "country", void 0);
//# sourceMappingURL=business-owner-onboarding-step2.dto.js.map