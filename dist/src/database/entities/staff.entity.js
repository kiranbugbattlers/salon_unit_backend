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
exports.Staff = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const enums_1 = require("../../common/enums");
const business_owner_entity_1 = require("./business-owner.entity");
const staff_service_entity_1 = require("./staff-service.entity");
const staff_schedule_override_entity_1 = require("./staff-schedule-override.entity");
const staff_break_entity_1 = require("./staff-break.entity");
let Staff = class Staff {
};
exports.Staff = Staff;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Staff.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'business_owner_id', type: 'uuid' }),
    __metadata("design:type", String)
], Staff.prototype, "businessOwnerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'first_name', length: 50 }),
    __metadata("design:type", String)
], Staff.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'last_name', length: 50 }),
    __metadata("design:type", String)
], Staff.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ unique: true, length: 15 }),
    __metadata("design:type", String)
], Staff.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ unique: true, nullable: true }),
    __metadata("design:type", String)
], Staff.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'date_of_birth', type: 'date' }),
    __metadata("design:type", Date)
], Staff.prototype, "dateOfBirth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.Gender }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: enums_1.Gender,
    }),
    __metadata("design:type", String)
], Staff.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'profile_pic', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Staff.prototype, "profilePic", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'profile_pic_cdn_url', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Staff.prototype, "profilePicCdnUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'profile_pic_s3_key', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Staff.prototype, "profilePicS3Key", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], Staff.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Staff.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Staff.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => business_owner_entity_1.BusinessOwner, (businessOwner) => businessOwner.staff),
    (0, typeorm_1.JoinColumn)({ name: 'business_owner_id' }),
    __metadata("design:type", business_owner_entity_1.BusinessOwner)
], Staff.prototype, "businessOwner", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => staff_service_entity_1.StaffService, (staffService) => staffService.staff),
    __metadata("design:type", Array)
], Staff.prototype, "staffServices", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => staff_schedule_override_entity_1.StaffScheduleOverride, (override) => override.staff),
    __metadata("design:type", Array)
], Staff.prototype, "scheduleOverrides", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => staff_break_entity_1.StaffBreak, (staffBreak) => staffBreak.staff),
    __metadata("design:type", Array)
], Staff.prototype, "breaks", void 0);
exports.Staff = Staff = __decorate([
    (0, typeorm_1.Entity)('staff'),
    (0, typeorm_1.Index)(['businessOwnerId', 'isActive'])
], Staff);
//# sourceMappingURL=staff.entity.js.map