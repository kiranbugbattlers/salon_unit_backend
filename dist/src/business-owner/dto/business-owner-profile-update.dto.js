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
exports.BusinessOwnerProfileUpdateDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const enums_1 = require("../../common/enums");
class BusinessOwnerProfileUpdateDto {
}
exports.BusinessOwnerProfileUpdateDto = BusinessOwnerProfileUpdateDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'First name of the business owner',
        example: 'John',
        required: false,
        minLength: 2,
        maxLength: 100,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], BusinessOwnerProfileUpdateDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last name of the business owner',
        example: 'Doe',
        required: false,
        minLength: 2,
        maxLength: 100,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], BusinessOwnerProfileUpdateDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Gender of the business owner',
        enum: enums_1.Gender,
        example: enums_1.Gender.MALE,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.Gender),
    __metadata("design:type", String)
], BusinessOwnerProfileUpdateDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Date of birth in YYYY-MM-DD format',
        example: '1990-05-15',
        required: false,
        format: 'date',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], BusinessOwnerProfileUpdateDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Name of the business',
        example: 'Elite Hair Studio',
        required: false,
        minLength: 3,
        maxLength: 200,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], BusinessOwnerProfileUpdateDto.prototype, "businessName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Description of the business',
        example: 'Professional hair styling and grooming services with 10+ years of experience',
        required: false,
        minLength: 10,
        maxLength: 1000,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], BusinessOwnerProfileUpdateDto.prototype, "businessDescription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Years of operating experience',
        example: 5,
        required: false,
        minimum: 0,
        maximum: 50,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], BusinessOwnerProfileUpdateDto.prototype, "operatingYears", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'UPI ID for payments',
        example: 'john@paytm',
        required: false,
        minLength: 3,
        maxLength: 50,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], BusinessOwnerProfileUpdateDto.prototype, "upiId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Credit limit assigned by admin (admin only)',
        example: 50000,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], BusinessOwnerProfileUpdateDto.prototype, "creditLimit", void 0);
//# sourceMappingURL=business-owner-profile-update.dto.js.map