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
exports.OnboardingStep4Dto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class OnboardingStep4Dto {
}
exports.OnboardingStep4Dto = OnboardingStep4Dto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Preferred time slot IDs',
        example: ['uuid1', 'uuid2'],
        type: [String],
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)(4, { each: true }),
    __metadata("design:type", Array)
], OnboardingStep4Dto.prototype, "preferredTimeSlotIds", void 0);
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
], OnboardingStep4Dto.prototype, "preferredDays", void 0);
//# sourceMappingURL=onboarding-step4.dto.js.map