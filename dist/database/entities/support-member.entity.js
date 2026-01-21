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
exports.SupportMember = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const enums_1 = require("../../common/enums");
const admin_entity_1 = require("./admin.entity");
const customer_support_mapping_entity_1 = require("./customer-support-mapping.entity");
let SupportMember = class SupportMember {
    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }
};
exports.SupportMember = SupportMember;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SupportMember.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'First name of support member' }),
    (0, typeorm_1.Column)({ name: 'first_name', length: 100 }),
    __metadata("design:type", String)
], SupportMember.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last name of support member' }),
    (0, typeorm_1.Column)({ name: 'last_name', length: 100 }),
    __metadata("design:type", String)
], SupportMember.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Email address', uniqueItems: true }),
    (0, typeorm_1.Column)({ name: 'email', unique: true }),
    __metadata("design:type", String)
], SupportMember.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Phone number', uniqueItems: true }),
    (0, typeorm_1.Column)({ name: 'phone', unique: true, length: 20 }),
    __metadata("design:type", String)
], SupportMember.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Profile picture S3 URL', required: false }),
    (0, typeorm_1.Column)({ name: 'profile_pic', type: 'text', nullable: true }),
    __metadata("design:type", String)
], SupportMember.prototype, "profilePic", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date of birth', required: false }),
    (0, typeorm_1.Column)({ name: 'date_of_birth', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], SupportMember.prototype, "dateOfBirth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.Gender, description: 'Gender', required: false }),
    (0, typeorm_1.Column)({
        name: 'gender',
        type: 'enum',
        enum: enums_1.Gender,
        nullable: true,
    }),
    __metadata("design:type", String)
], SupportMember.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Active status', default: true }),
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], SupportMember.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of customers assigned', default: 0 }),
    (0, typeorm_1.Column)({ name: 'customer_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], SupportMember.prototype, "customerCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Joining date' }),
    (0, typeorm_1.Column)({ name: 'joining_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], SupportMember.prototype, "joiningDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Admin who created this member' }),
    (0, typeorm_1.Column)({ name: 'created_by' }),
    __metadata("design:type", String)
], SupportMember.prototype, "createdBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], SupportMember.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], SupportMember.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => admin_entity_1.Admin, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", admin_entity_1.Admin)
], SupportMember.prototype, "admin", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => customer_support_mapping_entity_1.CustomerSupportMapping, (mapping) => mapping.supportMember),
    __metadata("design:type", Array)
], SupportMember.prototype, "customerMappings", void 0);
exports.SupportMember = SupportMember = __decorate([
    (0, typeorm_1.Entity)('support_members'),
    (0, typeorm_1.Index)(['email'], { unique: true }),
    (0, typeorm_1.Index)(['phone'], { unique: true }),
    (0, typeorm_1.Index)(['isActive']),
    (0, typeorm_1.Index)(['customerCount'])
], SupportMember);
//# sourceMappingURL=support-member.entity.js.map