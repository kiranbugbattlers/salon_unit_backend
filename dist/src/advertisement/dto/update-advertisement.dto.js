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
exports.UpdateAdvertisementDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const enums_1 = require("../../common/enums");
const isNotEmpty = (value) => value !== '' && value !== null && value !== undefined;
class UpdateAdvertisementDto {
}
exports.UpdateAdvertisementDto = UpdateAdvertisementDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ad title for admin reference', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => isNotEmpty(o.title)),
    (0, class_transformer_1.Transform)(({ value }) => (value === '' || value === null || value === undefined) ? undefined : value),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], UpdateAdvertisementDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Optional ad description', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => isNotEmpty(o.description)),
    (0, class_transformer_1.Transform)(({ value }) => (value === '' || value === null || value === undefined) ? undefined : value),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], UpdateAdvertisementDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.AdMediaType, description: 'Type of media', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => isNotEmpty(o.mediaType)),
    (0, class_validator_1.IsEnum)(enums_1.AdMediaType),
    __metadata("design:type", String)
], UpdateAdvertisementDto.prototype, "mediaType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Optional URL to open when clicked', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => isNotEmpty(o.linkUrl)),
    (0, class_transformer_1.Transform)(({ value }) => (value === '' || value === null || value === undefined) ? undefined : value),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdateAdvertisementDto.prototype, "linkUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User types that should see this ad',
        example: ['customer', 'business_owner'],
        enum: enums_1.AdUserType,
        isArray: true,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => isNotEmpty(o.targetUserTypes) && (!Array.isArray(o.targetUserTypes) || o.targetUserTypes.length > 0)),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.IsEnum)(enums_1.AdUserType, { each: true }),
    (0, class_transformer_1.Type)(() => String),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (!value || value === '' || (Array.isArray(value) && value.length === 0))
            return undefined;
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            }
            catch {
                return [value];
            }
        }
        return Array.isArray(value) ? value : [value];
    }),
    __metadata("design:type", Array)
], UpdateAdvertisementDto.prototype, "targetUserTypes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Screens where ad appears for each user type',
        example: { customer: ['home', 'login'] },
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => isNotEmpty(o.targetScreens) && !(typeof o.targetScreens === 'object' && Object.keys(o.targetScreens).length === 0)),
    (0, class_validator_1.IsObject)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (!value || value === '' || (typeof value === 'object' && Object.keys(value).length === 0))
            return undefined;
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            }
            catch {
                return value;
            }
        }
        return value;
    }),
    __metadata("design:type", Object)
], UpdateAdvertisementDto.prototype, "targetScreens", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Display priority (0-100)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => isNotEmpty(o.priority)),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], UpdateAdvertisementDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Active status', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => isNotEmpty(o.isActive)),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === '' || value === null || value === undefined)
            return undefined;
        if (typeof value === 'string') {
            return value === 'true' || value === '1';
        }
        return value;
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateAdvertisementDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Start date (ISO 8601)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => isNotEmpty(o.startDate)),
    (0, class_transformer_1.Transform)(({ value }) => (value === '' || value === null || value === undefined) ? undefined : value),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateAdvertisementDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'End date (ISO 8601)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => isNotEmpty(o.endDate)),
    (0, class_transformer_1.Transform)(({ value }) => (value === '' || value === null || value === undefined) ? undefined : value),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateAdvertisementDto.prototype, "endDate", void 0);
//# sourceMappingURL=update-advertisement.dto.js.map