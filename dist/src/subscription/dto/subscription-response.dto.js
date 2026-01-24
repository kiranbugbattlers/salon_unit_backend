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
exports.BusinessSubscriptionListResponseDto = exports.SubscriptionListResponseDto = exports.BusinessSubscriptionResponseDto = exports.SubscriptionPlanResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const enums_1 = require("../../common/enums");
class SubscriptionPlanResponseDto {
}
exports.SubscriptionPlanResponseDto = SubscriptionPlanResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SubscriptionPlanResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SubscriptionPlanResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SubscriptionPlanResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.BillingType }),
    __metadata("design:type", String)
], SubscriptionPlanResponseDto.prototype, "billingType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SubscriptionPlanResponseDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SubscriptionPlanResponseDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String] }),
    __metadata("design:type", Array)
], SubscriptionPlanResponseDto.prototype, "features", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], SubscriptionPlanResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SubscriptionPlanResponseDto.prototype, "formattedPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], SubscriptionPlanResponseDto.prototype, "isRecurring", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], SubscriptionPlanResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], SubscriptionPlanResponseDto.prototype, "updatedAt", void 0);
class BusinessSubscriptionResponseDto {
}
exports.BusinessSubscriptionResponseDto = BusinessSubscriptionResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BusinessSubscriptionResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BusinessSubscriptionResponseDto.prototype, "businessOwnerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.SubscriptionStatus }),
    __metadata("design:type", String)
], BusinessSubscriptionResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], BusinessSubscriptionResponseDto.prototype, "startedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Date)
], BusinessSubscriptionResponseDto.prototype, "expiresAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], BusinessSubscriptionResponseDto.prototype, "autoRenew", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], BusinessSubscriptionResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], BusinessSubscriptionResponseDto.prototype, "isExpired", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Number)
], BusinessSubscriptionResponseDto.prototype, "daysUntilExpiry", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], BusinessSubscriptionResponseDto.prototype, "isNearExpiry", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: SubscriptionPlanResponseDto }),
    __metadata("design:type", SubscriptionPlanResponseDto)
], BusinessSubscriptionResponseDto.prototype, "subscriptionPlan", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], BusinessSubscriptionResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], BusinessSubscriptionResponseDto.prototype, "updatedAt", void 0);
class SubscriptionListResponseDto {
}
exports.SubscriptionListResponseDto = SubscriptionListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [SubscriptionPlanResponseDto] }),
    __metadata("design:type", Array)
], SubscriptionListResponseDto.prototype, "plans", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SubscriptionListResponseDto.prototype, "total", void 0);
class BusinessSubscriptionListResponseDto {
}
exports.BusinessSubscriptionListResponseDto = BusinessSubscriptionListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [BusinessSubscriptionResponseDto] }),
    __metadata("design:type", Array)
], BusinessSubscriptionListResponseDto.prototype, "subscriptions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], BusinessSubscriptionListResponseDto.prototype, "total", void 0);
//# sourceMappingURL=subscription-response.dto.js.map