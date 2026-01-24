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
exports.CustomerSupportMapping = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const customer_entity_1 = require("./customer.entity");
const support_member_entity_1 = require("./support-member.entity");
const admin_entity_1 = require("./admin.entity");
let CustomerSupportMapping = class CustomerSupportMapping {
};
exports.CustomerSupportMapping = CustomerSupportMapping;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CustomerSupportMapping.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer ID' }),
    (0, typeorm_1.Column)({ name: 'customer_id' }),
    __metadata("design:type", String)
], CustomerSupportMapping.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Support member ID (null if assigned to admin)', required: false }),
    (0, typeorm_1.Column)({ name: 'support_member_id', nullable: true }),
    __metadata("design:type", String)
], CustomerSupportMapping.prototype, "supportMemberId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Admin ID (fallback when no support members)', required: false }),
    (0, typeorm_1.Column)({ name: 'admin_id', nullable: true }),
    __metadata("design:type", String)
], CustomerSupportMapping.prototype, "adminId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'When the assignment was made' }),
    (0, typeorm_1.Column)({ name: 'assigned_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], CustomerSupportMapping.prototype, "assignedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether this is the active assignment', default: true }),
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], CustomerSupportMapping.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notes about the assignment or transfer', required: false }),
    (0, typeorm_1.Column)({ name: 'notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], CustomerSupportMapping.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CustomerSupportMapping.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], CustomerSupportMapping.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_entity_1.Customer, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'customer_id' }),
    __metadata("design:type", customer_entity_1.Customer)
], CustomerSupportMapping.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => support_member_entity_1.SupportMember, (member) => member.customerMappings, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'support_member_id' }),
    __metadata("design:type", support_member_entity_1.SupportMember)
], CustomerSupportMapping.prototype, "supportMember", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => admin_entity_1.Admin, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'admin_id' }),
    __metadata("design:type", admin_entity_1.Admin)
], CustomerSupportMapping.prototype, "admin", void 0);
exports.CustomerSupportMapping = CustomerSupportMapping = __decorate([
    (0, typeorm_1.Entity)('customer_support_mappings'),
    (0, typeorm_1.Index)(['customerId']),
    (0, typeorm_1.Index)(['supportMemberId']),
    (0, typeorm_1.Index)(['adminId']),
    (0, typeorm_1.Index)(['isActive']),
    (0, typeorm_1.Unique)(['customerId', 'isActive'])
], CustomerSupportMapping);
//# sourceMappingURL=customer-support-mapping.entity.js.map