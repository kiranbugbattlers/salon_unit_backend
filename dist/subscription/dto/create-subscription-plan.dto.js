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
exports.CreateSubscriptionPlanDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const enums_1 = require("../../common/enums");
class CreateSubscriptionPlanDto {
}
exports.CreateSubscriptionPlanDto = CreateSubscriptionPlanDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Plan name - should be descriptive and marketing friendly',
        example: 'Premium Business Plan',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateSubscriptionPlanDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Detailed plan description explaining what businesses get',
        example: 'Complete business management suite with unlimited bookings, advanced analytics, priority customer support, and marketing tools.',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSubscriptionPlanDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Billing type',
        enum: enums_1.BillingType,
        example: enums_1.BillingType.MONTHLY,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(enums_1.BillingType),
    __metadata("design:type", String)
], CreateSubscriptionPlanDto.prototype, "billingType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Plan price in the specified currency (supports up to 2 decimal places)',
        example: 29.99,
        minimum: 0,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateSubscriptionPlanDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Currency code',
        example: 'USD',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(3),
    __metadata("design:type", String)
], CreateSubscriptionPlanDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'List of features included in this plan - will be displayed to businesses',
        example: [
            'Unlimited appointment bookings',
            '24/7 priority customer support',
            'Advanced analytics and reporting',
            'Custom branding options',
            'Multi-location management',
            'Staff scheduling tools'
        ],
        type: [String],
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateSubscriptionPlanDto.prototype, "features", void 0);
//# sourceMappingURL=create-subscription-plan.dto.js.map