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
exports.StaffBreakListResponseDto = exports.StaffBreakResponseDto = exports.UpdateStaffBreakDto = exports.CreateStaffBreakDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const enums_1 = require("../../common/enums");
class CreateStaffBreakDto {
    constructor() {
        this.isRecurring = true;
    }
}
exports.CreateStaffBreakDto = CreateStaffBreakDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '0=Sunday, 1=Monday, ..., 6=Saturday' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(6),
    __metadata("design:type", Number)
], CreateStaffBreakDto.prototype, "dayOfWeek", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Time in HH:MM format (24-hour)' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: 'Start time must be in HH:MM format (24-hour)',
    }),
    __metadata("design:type", String)
], CreateStaffBreakDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Time in HH:MM format (24-hour)' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: 'End time must be in HH:MM format (24-hour)',
    }),
    __metadata("design:type", String)
], CreateStaffBreakDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.BreakType }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(enums_1.BreakType),
    __metadata("design:type", String)
], CreateStaffBreakDto.prototype, "breakType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Type)(() => Boolean),
    __metadata("design:type", Boolean)
], CreateStaffBreakDto.prototype, "isRecurring", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateStaffBreakDto.prototype, "effectiveFrom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateStaffBreakDto.prototype, "effectiveTo", void 0);
class UpdateStaffBreakDto {
}
exports.UpdateStaffBreakDto = UpdateStaffBreakDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '0=Sunday, 1=Monday, ..., 6=Saturday', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(6),
    __metadata("design:type", Number)
], UpdateStaffBreakDto.prototype, "dayOfWeek", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Time in HH:MM format (24-hour)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: 'Start time must be in HH:MM format (24-hour)',
    }),
    __metadata("design:type", String)
], UpdateStaffBreakDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Time in HH:MM format (24-hour)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: 'End time must be in HH:MM format (24-hour)',
    }),
    __metadata("design:type", String)
], UpdateStaffBreakDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.BreakType, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.BreakType),
    __metadata("design:type", String)
], UpdateStaffBreakDto.prototype, "breakType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Type)(() => Boolean),
    __metadata("design:type", Boolean)
], UpdateStaffBreakDto.prototype, "isRecurring", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Type)(() => Boolean),
    __metadata("design:type", Boolean)
], UpdateStaffBreakDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateStaffBreakDto.prototype, "effectiveFrom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateStaffBreakDto.prototype, "effectiveTo", void 0);
class StaffBreakResponseDto {
}
exports.StaffBreakResponseDto = StaffBreakResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], StaffBreakResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], StaffBreakResponseDto.prototype, "staffId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '0=Sunday, 1=Monday, ..., 6=Saturday' }),
    __metadata("design:type", Number)
], StaffBreakResponseDto.prototype, "dayOfWeek", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], StaffBreakResponseDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], StaffBreakResponseDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.BreakType }),
    __metadata("design:type", String)
], StaffBreakResponseDto.prototype, "breakType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], StaffBreakResponseDto.prototype, "isRecurring", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], StaffBreakResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Date)
], StaffBreakResponseDto.prototype, "effectiveFrom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Date)
], StaffBreakResponseDto.prototype, "effectiveTo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], StaffBreakResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], StaffBreakResponseDto.prototype, "updatedAt", void 0);
class StaffBreakListResponseDto {
}
exports.StaffBreakListResponseDto = StaffBreakListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [StaffBreakResponseDto] }),
    __metadata("design:type", Array)
], StaffBreakListResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], StaffBreakListResponseDto.prototype, "total", void 0);
//# sourceMappingURL=staff-break.dto.js.map