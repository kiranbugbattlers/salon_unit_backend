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
exports.UpdateCustomerProfileDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const enums_1 = require("../../common/enums");
class UpdateCustomerProfileDto {
}
exports.UpdateCustomerProfileDto = UpdateCustomerProfileDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'First name',
        example: 'John',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdateCustomerProfileDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last name',
        example: 'Doe',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdateCustomerProfileDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Gender',
        enum: enums_1.Gender,
        example: enums_1.Gender.MALE,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.Gender),
    __metadata("design:type", String)
], UpdateCustomerProfileDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Date of birth (YYYY-MM-DD format)',
        example: '1990-05-15',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateCustomerProfileDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Profile picture URL',
        example: 'https://example.com/profile.jpg',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdateCustomerProfileDto.prototype, "profilePic", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Hair type',
        enum: enums_1.HairType,
        example: enums_1.HairType.STRAIGHT,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.HairType),
    __metadata("design:type", String)
], UpdateCustomerProfileDto.prototype, "hairType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Preferred service category IDs',
        example: ['uuid1', 'uuid2', 'uuid3'],
        type: [String],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)(4, { each: true }),
    __metadata("design:type", Array)
], UpdateCustomerProfileDto.prototype, "preferredCategoryIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Preferred time slot IDs',
        example: ['uuid1', 'uuid2'],
        type: [String],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)(4, { each: true }),
    __metadata("design:type", Array)
], UpdateCustomerProfileDto.prototype, "preferredTimeSlotIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Preferred days of week (1=Monday, 7=Sunday)',
        example: [1, 2, 3, 4, 5],
        type: [Number],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsInt)({ each: true }),
    (0, class_validator_1.Min)(1, { each: true }),
    (0, class_validator_1.Max)(7, { each: true }),
    __metadata("design:type", Array)
], UpdateCustomerProfileDto.prototype, "preferredDays", void 0);
//# sourceMappingURL=update-customer-profile.dto.js.map