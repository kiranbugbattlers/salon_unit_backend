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
exports.BusinessQueryDto = exports.SortOrder = exports.BusinessSortField = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const service_gender_enum_1 = require("../../common/enums/service-gender.enum");
var BusinessSortField;
(function (BusinessSortField) {
    BusinessSortField["RATING"] = "rating";
    BusinessSortField["NAME"] = "name";
    BusinessSortField["CREATED_AT"] = "createdAt";
    BusinessSortField["DISTANCE"] = "distance";
    BusinessSortField["OPERATING_YEARS"] = "operatingYears";
})(BusinessSortField || (exports.BusinessSortField = BusinessSortField = {}));
var SortOrder;
(function (SortOrder) {
    SortOrder["ASC"] = "asc";
    SortOrder["DESC"] = "desc";
})(SortOrder || (exports.SortOrder = SortOrder = {}));
class BusinessQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
    }
}
exports.BusinessQueryDto = BusinessQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Latitude for location-based filtering',
        example: 12.9716,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-90),
    (0, class_validator_1.Max)(90),
    __metadata("design:type", Number)
], BusinessQueryDto.prototype, "lat", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Longitude for location-based filtering',
        example: 77.5946,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-180),
    (0, class_validator_1.Max)(180),
    __metadata("design:type", Number)
], BusinessQueryDto.prototype, "lng", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Radius in kilometers for location filtering (optional - if not provided with lat/lng, no location filtering applied)',
        example: 5,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.1),
    __metadata("design:type", Number)
], BusinessQueryDto.prototype, "radius", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Sort fields (comma-separated). Prefix with - for descending order',
        example: 'rating,-operatingYears',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BusinessQueryDto.prototype, "sort", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Include user-specific data (favorites, history)',
        example: false,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true' || value === true)
            return true;
        if (value === 'false' || value === false)
            return false;
        return value;
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], BusinessQueryDto.prototype, "userspecific", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Page number for pagination',
        example: 1,
        required: false,
        default: 1,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], BusinessQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of items per page',
        example: 20,
        required: false,
        default: 20,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], BusinessQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by category UUID',
        example: '550e8400-e29b-41d4-a716-446655440000',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(4),
    __metadata("design:type", String)
], BusinessQueryDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter businesses offering services at home',
        example: true,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true' || value === true)
            return true;
        if (value === 'false' || value === false)
            return false;
        return value;
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], BusinessQueryDto.prototype, "availableAtHome", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Minimum price filter (based on business services)',
        example: 100,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], BusinessQueryDto.prototype, "minPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Maximum price filter (based on business services)',
        example: 1000,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], BusinessQueryDto.prototype, "maxPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter businesses by service gender availability',
        enum: service_gender_enum_1.ServiceGenderEnum,
        example: service_gender_enum_1.ServiceGenderEnum.BOTH,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(service_gender_enum_1.ServiceGenderEnum),
    __metadata("design:type", String)
], BusinessQueryDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Minimum operating years',
        example: 1,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], BusinessQueryDto.prototype, "minOperatingYears", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Search term for business name, description, city, area, or landmark',
        example: 'Mumbai',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BusinessQueryDto.prototype, "search", void 0);
//# sourceMappingURL=business-query.dto.js.map