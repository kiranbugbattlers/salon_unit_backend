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
exports.CustomerOnboarding = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const customer_entity_1 = require("./customer.entity");
let CustomerOnboarding = class CustomerOnboarding {
    getProgressPercentage() {
        return (this.completedSteps.length / 4) * 100;
    }
};
exports.CustomerOnboarding = CustomerOnboarding;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CustomerOnboarding.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'customer_id' }),
    __metadata("design:type", String)
], CustomerOnboarding.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'current_step', default: 1 }),
    __metadata("design:type", Number)
], CustomerOnboarding.prototype, "currentStep", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'completed_steps', type: 'int', array: true, default: [] }),
    __metadata("design:type", Array)
], CustomerOnboarding.prototype, "completedSteps", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'is_completed', default: false }),
    __metadata("design:type", Boolean)
], CustomerOnboarding.prototype, "isCompleted", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'step_1_data', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], CustomerOnboarding.prototype, "step1Data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'step_2_data', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], CustomerOnboarding.prototype, "step2Data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'step_3_data', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], CustomerOnboarding.prototype, "step3Data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'step_4_data', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], CustomerOnboarding.prototype, "step4Data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CustomerOnboarding.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], CustomerOnboarding.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => customer_entity_1.Customer, (customer) => customer.onboarding),
    (0, typeorm_1.JoinColumn)({ name: 'customer_id' }),
    __metadata("design:type", customer_entity_1.Customer)
], CustomerOnboarding.prototype, "customer", void 0);
exports.CustomerOnboarding = CustomerOnboarding = __decorate([
    (0, typeorm_1.Entity)('customer_onboarding')
], CustomerOnboarding);
//# sourceMappingURL=customer-onboarding.entity.js.map