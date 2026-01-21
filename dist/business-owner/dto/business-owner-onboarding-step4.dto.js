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
exports.BusinessOwnerOnboardingStep4Dto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class BusinessOwnerOnboardingStep4Dto {
}
exports.BusinessOwnerOnboardingStep4Dto = BusinessOwnerOnboardingStep4Dto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Years of operating experience',
        example: 8,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], BusinessOwnerOnboardingStep4Dto.prototype, "operatingYears", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Bank account number for settlement payouts',
        example: '1234567890123456',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(9, 18),
    __metadata("design:type", String)
], BusinessOwnerOnboardingStep4Dto.prototype, "accountNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Account holder name as per bank records',
        example: 'John Doe',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 200),
    __metadata("design:type", String)
], BusinessOwnerOnboardingStep4Dto.prototype, "accountHolderName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'IFSC code of the bank branch (11 characters)',
        example: 'SBIN0001234',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(11, 11),
    (0, class_validator_1.Matches)(/^[A-Z]{4}0[A-Z0-9]{6}$/, {
        message: 'IFSC code must be in valid format (e.g., SBIN0001234)',
    }),
    __metadata("design:type", String)
], BusinessOwnerOnboardingStep4Dto.prototype, "ifscCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Bank name',
        example: 'State Bank of India',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 200),
    __metadata("design:type", String)
], BusinessOwnerOnboardingStep4Dto.prototype, "bankName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Bank branch name (optional)',
        example: 'Bangalore Main Branch',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 200),
    __metadata("design:type", String)
], BusinessOwnerOnboardingStep4Dto.prototype, "branch", void 0);
//# sourceMappingURL=business-owner-onboarding-step4.dto.js.map