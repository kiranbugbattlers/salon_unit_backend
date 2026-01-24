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
exports.BusinessSubscription = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const enums_1 = require("../../common/enums");
const business_owner_entity_1 = require("./business-owner.entity");
const subscription_plan_entity_1 = require("./subscription-plan.entity");
const subscription_transaction_entity_1 = require("./subscription-transaction.entity");
let BusinessSubscription = class BusinessSubscription {
    get isActive() {
        return this.status === enums_1.SubscriptionStatus.ACTIVE && !this.isExpired;
    }
    get isExpired() {
        if (!this.expiresAt) {
            return false;
        }
        return new Date() > this.expiresAt;
    }
    get daysUntilExpiry() {
        if (!this.expiresAt) {
            return null;
        }
        const diffTime = this.expiresAt.getTime() - new Date().getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    get isNearExpiry() {
        const days = this.daysUntilExpiry;
        return days !== null && days <= 7 && days > 0;
    }
};
exports.BusinessSubscription = BusinessSubscription;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BusinessSubscription.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'business_owner_id' }),
    __metadata("design:type", String)
], BusinessSubscription.prototype, "businessOwnerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'subscription_plan_id' }),
    __metadata("design:type", String)
], BusinessSubscription.prototype, "subscriptionPlanId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.SubscriptionStatus }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: enums_1.SubscriptionStatus,
        default: enums_1.SubscriptionStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], BusinessSubscription.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'started_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], BusinessSubscription.prototype, "startedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'expires_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], BusinessSubscription.prototype, "expiresAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'auto_renew', default: false }),
    __metadata("design:type", Boolean)
], BusinessSubscription.prototype, "autoRenew", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'payment_method_id', length: 255, nullable: true }),
    __metadata("design:type", String)
], BusinessSubscription.prototype, "paymentMethodId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'cancellation_reason', type: 'text', nullable: true }),
    __metadata("design:type", String)
], BusinessSubscription.prototype, "cancellationReason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'cancelled_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], BusinessSubscription.prototype, "cancelledAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'razorpay_order_id', length: 255, nullable: true }),
    __metadata("design:type", String)
], BusinessSubscription.prototype, "razorpayOrderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'razorpay_payment_id', length: 255, nullable: true }),
    __metadata("design:type", String)
], BusinessSubscription.prototype, "razorpayPaymentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'last_payment_attempt_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], BusinessSubscription.prototype, "lastPaymentAttemptAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], BusinessSubscription.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], BusinessSubscription.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => business_owner_entity_1.BusinessOwner, (businessOwner) => businessOwner.id),
    (0, typeorm_1.JoinColumn)({ name: 'business_owner_id' }),
    __metadata("design:type", business_owner_entity_1.BusinessOwner)
], BusinessSubscription.prototype, "businessOwner", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => subscription_plan_entity_1.SubscriptionPlan, (plan) => plan.businessSubscriptions),
    (0, typeorm_1.JoinColumn)({ name: 'subscription_plan_id' }),
    __metadata("design:type", subscription_plan_entity_1.SubscriptionPlan)
], BusinessSubscription.prototype, "subscriptionPlan", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => subscription_transaction_entity_1.SubscriptionTransaction, (transaction) => transaction.businessSubscription),
    __metadata("design:type", Array)
], BusinessSubscription.prototype, "transactions", void 0);
exports.BusinessSubscription = BusinessSubscription = __decorate([
    (0, typeorm_1.Entity)('business_subscriptions')
], BusinessSubscription);
//# sourceMappingURL=business-subscription.entity.js.map