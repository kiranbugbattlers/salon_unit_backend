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
exports.StaffServiceListResponseDto = exports.StaffServiceResponseDto = exports.StaffBasicServiceResponseDto = exports.StaffServiceCategoryResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class StaffServiceCategoryResponseDto {
}
exports.StaffServiceCategoryResponseDto = StaffServiceCategoryResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], StaffServiceCategoryResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], StaffServiceCategoryResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], StaffServiceCategoryResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], StaffServiceCategoryResponseDto.prototype, "isActive", void 0);
class StaffBasicServiceResponseDto {
}
exports.StaffBasicServiceResponseDto = StaffBasicServiceResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], StaffBasicServiceResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], StaffBasicServiceResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], StaffBasicServiceResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], StaffBasicServiceResponseDto.prototype, "basePrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], StaffBasicServiceResponseDto.prototype, "baseDurationMinutes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], StaffBasicServiceResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: StaffServiceCategoryResponseDto }),
    __metadata("design:type", StaffServiceCategoryResponseDto)
], StaffBasicServiceResponseDto.prototype, "category", void 0);
class StaffServiceResponseDto {
}
exports.StaffServiceResponseDto = StaffServiceResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], StaffServiceResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], StaffServiceResponseDto.prototype, "staffId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], StaffServiceResponseDto.prototype, "serviceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], StaffServiceResponseDto.prototype, "customPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], StaffServiceResponseDto.prototype, "customDurationMinutes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], StaffServiceResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], StaffServiceResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: StaffBasicServiceResponseDto }),
    __metadata("design:type", StaffBasicServiceResponseDto)
], StaffServiceResponseDto.prototype, "service", void 0);
class StaffServiceListResponseDto {
}
exports.StaffServiceListResponseDto = StaffServiceListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [StaffServiceResponseDto] }),
    __metadata("design:type", Array)
], StaffServiceListResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], StaffServiceListResponseDto.prototype, "total", void 0);
//# sourceMappingURL=service-response.dto.js.map