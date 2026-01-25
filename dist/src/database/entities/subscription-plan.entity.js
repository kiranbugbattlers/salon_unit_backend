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
exports.SubscriptionPlan = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const enums_1 = require("../../common/enums");
const business_subscription_entity_1 = require("./business-subscription.entity");
let SubscriptionPlan = class SubscriptionPlan {
    get formattedPrice() {
        return `${this.currency} ${this.price}`;
    }
    get isRecurring() {
        return this.billingType === enums_1.BillingType.MONTHLY || this.billingType === enums_1.BillingType.YEARLY;
    }
};
exports.SubscriptionPlan = SubscriptionPlan;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SubscriptionPlan.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], SubscriptionPlan.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], SubscriptionPlan.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.BillingType }),
    (0, typeorm_1.Column)({
        name: 'billing_type',
        type: 'enum',
        enum: enums_1.BillingType,
    }),
    __metadata("design:type", String)
], SubscriptionPlan.prototype, "billingType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], SubscriptionPlan.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ length: 3, default: 'USD' }),
    __metadata("design:type", String)
], SubscriptionPlan.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ type: 'json' }),
    __metadata("design:type", Array)
], SubscriptionPlan.prototype, "features", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], SubscriptionPlan.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], SubscriptionPlan.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], SubscriptionPlan.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => business_subscription_entity_1.BusinessSubscription, (subscription) => subscription.subscriptionPlan),
    __metadata("design:type", Array)
], SubscriptionPlan.prototype, "businessSubscriptions", void 0);
exports.SubscriptionPlan = SubscriptionPlan = __decorate([
    (0, typeorm_1.Entity)('subscription_plans')
], SubscriptionPlan);
//# sourceMappingURL=subscription-plan.entity.js.map