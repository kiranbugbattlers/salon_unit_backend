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
exports.ScheduleOverrideListResponseDto = exports.ScheduleOverrideResponseDto = exports.UpdateScheduleOverrideDto = exports.CreateScheduleOverrideDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const enums_1 = require("../../common/enums");
class CreateScheduleOverrideDto {
}
exports.CreateScheduleOverrideDto = CreateScheduleOverrideDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateScheduleOverrideDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.StaffOverrideType }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(enums_1.StaffOverrideType),
    __metadata("design:type", String)
], CreateScheduleOverrideDto.prototype, "overrideType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Time in HH:MM format (24-hour)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: 'Start time must be in HH:MM format (24-hour)',
    }),
    __metadata("design:type", String)
], CreateScheduleOverrideDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Time in HH:MM format (24-hour)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: 'End time must be in HH:MM format (24-hour)',
    }),
    __metadata("design:type", String)
], CreateScheduleOverrideDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateScheduleOverrideDto.prototype, "reason", void 0);
class UpdateScheduleOverrideDto {
}
exports.UpdateScheduleOverrideDto = UpdateScheduleOverrideDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.StaffOverrideType, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.StaffOverrideType),
    __metadata("design:type", String)
], UpdateScheduleOverrideDto.prototype, "overrideType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Time in HH:MM format (24-hour)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: 'Start time must be in HH:MM format (24-hour)',
    }),
    __metadata("design:type", String)
], UpdateScheduleOverrideDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Time in HH:MM format (24-hour)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: 'End time must be in HH:MM format (24-hour)',
    }),
    __metadata("design:type", String)
], UpdateScheduleOverrideDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], UpdateScheduleOverrideDto.prototype, "reason", void 0);
class ScheduleOverrideResponseDto {
}
exports.ScheduleOverrideResponseDto = ScheduleOverrideResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ScheduleOverrideResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ScheduleOverrideResponseDto.prototype, "staffId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], ScheduleOverrideResponseDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.StaffOverrideType }),
    __metadata("design:type", String)
], ScheduleOverrideResponseDto.prototype, "overrideType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], ScheduleOverrideResponseDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], ScheduleOverrideResponseDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], ScheduleOverrideResponseDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], ScheduleOverrideResponseDto.prototype, "createdAt", void 0);
class ScheduleOverrideListResponseDto {
}
exports.ScheduleOverrideListResponseDto = ScheduleOverrideListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [ScheduleOverrideResponseDto] }),
    __metadata("design:type", Array)
], ScheduleOverrideListResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ScheduleOverrideListResponseDto.prototype, "total", void 0);
//# sourceMappingURL=schedule-override.dto.js.map