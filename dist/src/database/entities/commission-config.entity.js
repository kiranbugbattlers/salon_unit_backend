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
exports.CommissionConfig = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const admin_entity_1 = require("./admin.entity");
let CommissionConfig = class CommissionConfig {
};
exports.CommissionConfig = CommissionConfig;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CommissionConfig.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Commission percentage charged from business owner (0-100)' }),
    (0, typeorm_1.Column)({
        name: 'business_owner_commission_percent',
        type: 'decimal',
        precision: 5,
        scale: 2,
        default: 0,
    }),
    __metadata("design:type", Number)
], CommissionConfig.prototype, "businessOwnerCommissionPercent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reward percentage given to customer (0-100)' }),
    (0, typeorm_1.Column)({
        name: 'customer_reward_percent',
        type: 'decimal',
        precision: 5,
        scale: 2,
        default: 0,
    }),
    __metadata("design:type", Number)
], CommissionConfig.prototype, "customerRewardPercent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether this configuration is active' }),
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], CommissionConfig.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date from which this config is effective' }),
    (0, typeorm_1.Column)({ name: 'effective_from', type: 'date' }),
    __metadata("design:type", Date)
], CommissionConfig.prototype, "effectiveFrom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date until which this config is effective', required: false }),
    (0, typeorm_1.Column)({ name: 'effective_until', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], CommissionConfig.prototype, "effectiveUntil", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Admin who created this configuration' }),
    (0, typeorm_1.Column)({ name: 'created_by_admin_id' }),
    __metadata("design:type", String)
], CommissionConfig.prototype, "createdByAdminId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notes about this configuration change', required: false }),
    (0, typeorm_1.Column)({ name: 'notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], CommissionConfig.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CommissionConfig.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], CommissionConfig.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => admin_entity_1.Admin, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by_admin_id' }),
    __metadata("design:type", admin_entity_1.Admin)
], CommissionConfig.prototype, "createdBy", void 0);
exports.CommissionConfig = CommissionConfig = __decorate([
    (0, typeorm_1.Entity)('commission_configs'),
    (0, typeorm_1.Index)(['isActive', 'effectiveFrom', 'effectiveUntil']),
    (0, typeorm_1.Index)(['effectiveFrom'])
], CommissionConfig);
//# sourceMappingURL=commission-config.entity.js.map