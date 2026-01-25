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
exports.StaffBreak = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const enums_1 = require("../../common/enums");
const staff_entity_1 = require("./staff.entity");
let StaffBreak = class StaffBreak {
};
exports.StaffBreak = StaffBreak;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], StaffBreak.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'staff_id' }),
    __metadata("design:type", String)
], StaffBreak.prototype, "staffId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '0=Sunday, 1=Monday, ..., 6=Saturday' }),
    (0, typeorm_1.Column)({ name: 'day_of_week', type: 'int' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Number)
], StaffBreak.prototype, "dayOfWeek", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'start_time', type: 'time' }),
    __metadata("design:type", String)
], StaffBreak.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'end_time', type: 'time' }),
    __metadata("design:type", String)
], StaffBreak.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.BreakType }),
    (0, typeorm_1.Column)({
        name: 'break_type',
        type: 'enum',
        enum: enums_1.BreakType,
    }),
    __metadata("design:type", String)
], StaffBreak.prototype, "breakType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'is_recurring', default: true }),
    __metadata("design:type", Boolean)
], StaffBreak.prototype, "isRecurring", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Boolean)
], StaffBreak.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'effective_from', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], StaffBreak.prototype, "effectiveFrom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'effective_to', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], StaffBreak.prototype, "effectiveTo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], StaffBreak.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], StaffBreak.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => staff_entity_1.Staff, (staff) => staff.breaks),
    (0, typeorm_1.JoinColumn)({ name: 'staff_id' }),
    __metadata("design:type", staff_entity_1.Staff)
], StaffBreak.prototype, "staff", void 0);
exports.StaffBreak = StaffBreak = __decorate([
    (0, typeorm_1.Entity)('staff_breaks'),
    (0, typeorm_1.Index)(['staffId', 'dayOfWeek', 'isActive'])
], StaffBreak);
//# sourceMappingURL=staff-break.entity.js.map