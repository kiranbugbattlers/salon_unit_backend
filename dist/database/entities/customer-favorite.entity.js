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
exports.CustomerFavorite = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const customer_entity_1 = require("./customer.entity");
const business_owner_entity_1 = require("./business-owner.entity");
let CustomerFavorite = class CustomerFavorite {
};
exports.CustomerFavorite = CustomerFavorite;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique identifier for the favorite record',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CustomerFavorite.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Customer ID who favorited the business',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, typeorm_1.Column)({ name: 'customer_id', type: 'uuid' }),
    __metadata("design:type", String)
], CustomerFavorite.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Business Owner ID that was favorited',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, typeorm_1.Column)({ name: 'business_owner_id', type: 'uuid' }),
    __metadata("design:type", String)
], CustomerFavorite.prototype, "businessOwnerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timestamp when the business was favorited',
    }),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CustomerFavorite.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timestamp when the favorite record was last updated',
    }),
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], CustomerFavorite.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_entity_1.Customer, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'customer_id' }),
    __metadata("design:type", customer_entity_1.Customer)
], CustomerFavorite.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => business_owner_entity_1.BusinessOwner, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'business_owner_id' }),
    __metadata("design:type", business_owner_entity_1.BusinessOwner)
], CustomerFavorite.prototype, "businessOwner", void 0);
exports.CustomerFavorite = CustomerFavorite = __decorate([
    (0, typeorm_1.Entity)('customer_favorites'),
    (0, typeorm_1.Unique)('uq_customer_business_favorite', ['customerId', 'businessOwnerId']),
    (0, typeorm_1.Index)(['customerId']),
    (0, typeorm_1.Index)(['businessOwnerId']),
    (0, typeorm_1.Index)(['createdAt'])
], CustomerFavorite);
//# sourceMappingURL=customer-favorite.entity.js.map