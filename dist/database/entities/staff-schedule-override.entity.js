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
exports.StaffScheduleOverride = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const enums_1 = require("../../common/enums");
const staff_entity_1 = require("./staff.entity");
let StaffScheduleOverride = class StaffScheduleOverride {
};
exports.StaffScheduleOverride = StaffScheduleOverride;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], StaffScheduleOverride.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'staff_id' }),
    __metadata("design:type", String)
], StaffScheduleOverride.prototype, "staffId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ type: 'date' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], StaffScheduleOverride.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.StaffOverrideType }),
    (0, typeorm_1.Column)({
        name: 'override_type',
        type: 'enum',
        enum: enums_1.StaffOverrideType,
    }),
    __metadata("design:type", String)
], StaffScheduleOverride.prototype, "overrideType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'start_time', type: 'time', nullable: true }),
    __metadata("design:type", String)
], StaffScheduleOverride.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'end_time', type: 'time', nullable: true }),
    __metadata("design:type", String)
], StaffScheduleOverride.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], StaffScheduleOverride.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], StaffScheduleOverride.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => staff_entity_1.Staff, (staff) => staff.scheduleOverrides),
    (0, typeorm_1.JoinColumn)({ name: 'staff_id' }),
    __metadata("design:type", staff_entity_1.Staff)
], StaffScheduleOverride.prototype, "staff", void 0);
exports.StaffScheduleOverride = StaffScheduleOverride = __decorate([
    (0, typeorm_1.Entity)('staff_schedule_overrides'),
    (0, typeorm_1.Index)(['staffId', 'date']),
    (0, typeorm_1.Unique)(['staffId', 'date'])
], StaffScheduleOverride);
//# sourceMappingURL=staff-schedule-override.entity.js.map