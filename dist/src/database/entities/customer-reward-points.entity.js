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
exports.CustomerRewardPoints = exports.RewardTier = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const customer_entity_1 = require("./customer.entity");
var RewardTier;
(function (RewardTier) {
    RewardTier["BRONZE"] = "bronze";
    RewardTier["SILVER"] = "silver";
    RewardTier["GOLD"] = "gold";
    RewardTier["PLATINUM"] = "platinum";
})(RewardTier || (exports.RewardTier = RewardTier = {}));
let CustomerRewardPoints = class CustomerRewardPoints {
};
exports.CustomerRewardPoints = CustomerRewardPoints;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CustomerRewardPoints.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer ID' }),
    (0, typeorm_1.Column)({ name: 'customer_id' }),
    __metadata("design:type", String)
], CustomerRewardPoints.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current available points balance' }),
    (0, typeorm_1.Column)({ name: 'total_points', type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], CustomerRewardPoints.prototype, "totalPoints", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lifetime points earned' }),
    (0, typeorm_1.Column)({ name: 'total_earned', type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], CustomerRewardPoints.prototype, "totalEarned", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lifetime points redeemed/used' }),
    (0, typeorm_1.Column)({ name: 'total_redeemed', type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], CustomerRewardPoints.prototype, "totalRedeemed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Points expiring soon' }),
    (0, typeorm_1.Column)({ name: 'expiring_points', type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], CustomerRewardPoints.prototype, "expiringPoints", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Next expiry date for points', required: false }),
    (0, typeorm_1.Column)({ name: 'next_expiry_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], CustomerRewardPoints.prototype, "nextExpiryDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: RewardTier, description: 'Customer tier based on total bookings' }),
    (0, typeorm_1.Column)({
        name: 'tier',
        type: 'enum',
        enum: RewardTier,
        default: RewardTier.BRONZE,
    }),
    __metadata("design:type", String)
], CustomerRewardPoints.prototype, "tier", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total bookings completed' }),
    (0, typeorm_1.Column)({ name: 'total_bookings', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], CustomerRewardPoints.prototype, "totalBookings", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last points earned timestamp', required: false }),
    (0, typeorm_1.Column)({ name: 'last_earned_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], CustomerRewardPoints.prototype, "lastEarnedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last points redeemed timestamp', required: false }),
    (0, typeorm_1.Column)({ name: 'last_redeemed_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], CustomerRewardPoints.prototype, "lastRedeemedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CustomerRewardPoints.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], CustomerRewardPoints.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => customer_entity_1.Customer, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'customer_id' }),
    __metadata("design:type", customer_entity_1.Customer)
], CustomerRewardPoints.prototype, "customer", void 0);
exports.CustomerRewardPoints = CustomerRewardPoints = __decorate([
    (0, typeorm_1.Entity)('customer_reward_points'),
    (0, typeorm_1.Index)(['customerId'], { unique: true }),
    (0, typeorm_1.Index)(['tier'])
], CustomerRewardPoints);
//# sourceMappingURL=customer-reward-points.entity.js.map