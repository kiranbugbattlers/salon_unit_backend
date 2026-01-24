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
exports.BusinessOwnerOnboarding = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const business_owner_entity_1 = require("./business-owner.entity");
let BusinessOwnerOnboarding = class BusinessOwnerOnboarding {
    getProgressPercentage() {
        const totalSteps = 4;
        const completed = this.completedSteps.length;
        return Math.round((completed / totalSteps) * 100);
    }
};
exports.BusinessOwnerOnboarding = BusinessOwnerOnboarding;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BusinessOwnerOnboarding.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'business_owner_id' }),
    __metadata("design:type", String)
], BusinessOwnerOnboarding.prototype, "businessOwnerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'current_step', type: 'int', default: 1 }),
    __metadata("design:type", Number)
], BusinessOwnerOnboarding.prototype, "currentStep", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'completed_steps', type: 'json', default: '[]' }),
    __metadata("design:type", Array)
], BusinessOwnerOnboarding.prototype, "completedSteps", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'is_completed', default: false }),
    __metadata("design:type", Boolean)
], BusinessOwnerOnboarding.prototype, "isCompleted", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'step1_data', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], BusinessOwnerOnboarding.prototype, "step1Data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'step2_data', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], BusinessOwnerOnboarding.prototype, "step2Data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'step3_data', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], BusinessOwnerOnboarding.prototype, "step3Data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'step4_data', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], BusinessOwnerOnboarding.prototype, "step4Data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], BusinessOwnerOnboarding.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], BusinessOwnerOnboarding.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => business_owner_entity_1.BusinessOwner, (businessOwner) => businessOwner.onboarding),
    (0, typeorm_1.JoinColumn)({ name: 'business_owner_id' }),
    __metadata("design:type", business_owner_entity_1.BusinessOwner)
], BusinessOwnerOnboarding.prototype, "businessOwner", void 0);
exports.BusinessOwnerOnboarding = BusinessOwnerOnboarding = __decorate([
    (0, typeorm_1.Entity)('business_owner_onboarding')
], BusinessOwnerOnboarding);
//# sourceMappingURL=business-owner-onboarding.entity.js.map