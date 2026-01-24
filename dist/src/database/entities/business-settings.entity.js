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
exports.BusinessSettings = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const business_owner_entity_1 = require("./business-owner.entity");
let BusinessSettings = class BusinessSettings {
};
exports.BusinessSettings = BusinessSettings;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business owner ID (primary key)' }),
    (0, typeorm_1.PrimaryColumn)({ name: 'business_owner_id', type: 'uuid' }),
    __metadata("design:type", String)
], BusinessSettings.prototype, "businessOwnerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Enable at-home service delivery charges', default: true }),
    (0, typeorm_1.Column)({ name: 'delivery_charges_enabled', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], BusinessSettings.prototype, "deliveryChargesEnabled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Base delivery charge (fixed amount)', default: 0 }),
    (0, typeorm_1.Column)({ name: 'base_delivery_charge', type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], BusinessSettings.prototype, "baseDeliveryCharge", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Charge per kilometer for distance-based pricing', default: 10 }),
    (0, typeorm_1.Column)({ name: 'per_km_charge', type: 'decimal', precision: 10, scale: 2, default: 10 }),
    __metadata("design:type", Number)
], BusinessSettings.prototype, "perKmCharge", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Free delivery up to this distance (in km)', default: 5 }),
    (0, typeorm_1.Column)({ name: 'free_delivery_upto_km', type: 'decimal', precision: 5, scale: 2, default: 5 }),
    __metadata("design:type", Number)
], BusinessSettings.prototype, "freeDeliveryUptoKm", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Maximum delivery distance allowed (in km)', default: 20 }),
    (0, typeorm_1.Column)({ name: 'max_delivery_distance_km', type: 'decimal', precision: 5, scale: 2, default: 20 }),
    __metadata("design:type", Number)
], BusinessSettings.prototype, "maxDeliveryDistanceKm", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Minimum order amount for free delivery', default: 1000 }),
    (0, typeorm_1.Column)({ name: 'free_delivery_above_amount', type: 'decimal', precision: 10, scale: 2, default: 1000 }),
    __metadata("design:type", Number)
], BusinessSettings.prototype, "freeDeliveryAboveAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], BusinessSettings.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], BusinessSettings.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => business_owner_entity_1.BusinessOwner),
    (0, typeorm_1.JoinColumn)({ name: 'business_owner_id' }),
    __metadata("design:type", business_owner_entity_1.BusinessOwner)
], BusinessSettings.prototype, "businessOwner", void 0);
exports.BusinessSettings = BusinessSettings = __decorate([
    (0, typeorm_1.Entity)('business_settings')
], BusinessSettings);
//# sourceMappingURL=business-settings.entity.js.map