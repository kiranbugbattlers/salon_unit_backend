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
exports.BusinessDetailResponseDto = exports.BusinessDetailDto = exports.StaffDetailDto = exports.BusinessServiceDetailDto = exports.ServiceCategoryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const api_response_dto_1 = require("../../common/dto/api-response.dto");
const business_response_dto_1 = require("./business-response.dto");
const dto_1 = require("../../business-owner/dto");
const service_location_type_enum_1 = require("../../common/enums/service-location-type.enum");
class ServiceCategoryDto {
}
exports.ServiceCategoryDto = ServiceCategoryDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ServiceCategoryDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ServiceCategoryDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], ServiceCategoryDto.prototype, "description", void 0);
class BusinessServiceDetailDto {
}
exports.BusinessServiceDetailDto = BusinessServiceDetailDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BusinessServiceDetailDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BusinessServiceDetailDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], BusinessServiceDetailDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Number)
], BusinessServiceDetailDto.prototype, "basePrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], BusinessServiceDetailDto.prototype, "customPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Number)
], BusinessServiceDetailDto.prototype, "defaultDuration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], BusinessServiceDetailDto.prototype, "customDurationMinutes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], BusinessServiceDetailDto.prototype, "availableAtHome", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], BusinessServiceDetailDto.prototype, "image", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], BusinessServiceDetailDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", ServiceCategoryDto)
], BusinessServiceDetailDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], BusinessServiceDetailDto.prototype, "isActive", void 0);
class StaffDetailDto {
}
exports.StaffDetailDto = StaffDetailDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], StaffDetailDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], StaffDetailDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], StaffDetailDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], StaffDetailDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], StaffDetailDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], StaffDetailDto.prototype, "profilePic", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], StaffDetailDto.prototype, "profilePicCdnUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Services that this staff member can provide', type: [String] }),
    __metadata("design:type", Array)
], StaffDetailDto.prototype, "serviceIds", void 0);
class BusinessDetailDto {
}
exports.BusinessDetailDto = BusinessDetailDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BusinessDetailDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BusinessDetailDto.prototype, "shopId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], BusinessDetailDto.prototype, "businessName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], BusinessDetailDto.prototype, "businessDescription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Number)
], BusinessDetailDto.prototype, "operatingYears", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], BusinessDetailDto.prototype, "isApproved", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Date)
], BusinessDetailDto.prototype, "approvedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", business_response_dto_1.BusinessAddressDto)
], BusinessDetailDto.prototype, "businessAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [business_response_dto_1.BusinessMediaDto], required: false }),
    __metadata("design:type", Array)
], BusinessDetailDto.prototype, "businessMedia", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [BusinessServiceDetailDto], description: 'All services offered by this business' }),
    __metadata("design:type", Array)
], BusinessDetailDto.prototype, "services", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [dto_1.ServicePackageResponseDto], description: 'All service packages offered by this business', required: false }),
    __metadata("design:type", Array)
], BusinessDetailDto.prototype, "servicePackages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [StaffDetailDto], description: 'All staff members of this business' }),
    __metadata("design:type", Array)
], BusinessDetailDto.prototype, "staff", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Price range based on available services', required: false }),
    __metadata("design:type", Object)
], BusinessDetailDto.prototype, "priceRange", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Average rating from customer reviews', required: false }),
    __metadata("design:type", Number)
], BusinessDetailDto.prototype, "averageRating", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of reviews', required: false }),
    __metadata("design:type", Number)
], BusinessDetailDto.prototype, "reviewCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User-specific data like isFavorite', required: false }),
    __metadata("design:type", Object)
], BusinessDetailDto.prototype, "userSpecific", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Days when the business is closed (0=Sunday, 1=Monday, ..., 6=Saturday)',
        required: false,
        type: [Number],
        example: [0, 6],
    }),
    __metadata("design:type", Array)
], BusinessDetailDto.prototype, "closedDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Business operating hours for open days only (0=Sunday, 1=Monday, ..., 6=Saturday)',
        required: false,
        type: 'array',
        example: [
            { dayOfWeek: 1, openTime: '09:00', closeTime: '18:00' },
            { dayOfWeek: 2, openTime: '09:00', closeTime: '18:00' }
        ],
    }),
    __metadata("design:type", Array)
], BusinessDetailDto.prototype, "operatingHours", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Service location type - where the business provides services',
        enum: service_location_type_enum_1.ServiceLocationType,
        required: false,
        example: service_location_type_enum_1.ServiceLocationType.BOTH,
    }),
    __metadata("design:type", String)
], BusinessDetailDto.prototype, "serviceLocationType", void 0);
class BusinessDetailResponseDto extends api_response_dto_1.ApiResponseDto {
    constructor(code, success, message, data) {
        super(code, success, message, data);
    }
}
exports.BusinessDetailResponseDto = BusinessDetailResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], BusinessDetailResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], BusinessDetailResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Business details retrieved successfully' }),
    __metadata("design:type", String)
], BusinessDetailResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", BusinessDetailDto)
], BusinessDetailResponseDto.prototype, "data", void 0);
//# sourceMappingURL=business-detail-response.dto.js.map