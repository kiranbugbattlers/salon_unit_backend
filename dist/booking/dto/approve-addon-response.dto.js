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
exports.ApproveAddonResponseDto = exports.ApproveAddonDataDto = exports.ApprovedServiceDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class ApprovedServiceDto {
}
exports.ApprovedServiceDto = ApprovedServiceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Booking service ID' }),
    __metadata("design:type", String)
], ApprovedServiceDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Service name' }),
    __metadata("design:type", String)
], ApprovedServiceDto.prototype, "serviceName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Service price' }),
    __metadata("design:type", Number)
], ApprovedServiceDto.prototype, "servicePrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer approved status', example: true }),
    __metadata("design:type", Boolean)
], ApprovedServiceDto.prototype, "customerApproved", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timestamp when approved' }),
    __metadata("design:type", Date)
], ApprovedServiceDto.prototype, "approvedAt", void 0);
class ApproveAddonDataDto {
}
exports.ApproveAddonDataDto = ApproveAddonDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Booking ID' }),
    __metadata("design:type", String)
], ApproveAddonDataDto.prototype, "bookingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total booking amount including approved add-ons' }),
    __metadata("design:type", Number)
], ApproveAddonDataDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total of all approved add-on services' }),
    __metadata("design:type", Number)
], ApproveAddonDataDto.prototype, "addOnServicesTotal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Details of the approved service' }),
    __metadata("design:type", ApprovedServiceDto)
], ApproveAddonDataDto.prototype, "approvedService", void 0);
class ApproveAddonResponseDto {
}
exports.ApproveAddonResponseDto = ApproveAddonResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'HTTP status code', example: 200 }),
    __metadata("design:type", Number)
], ApproveAddonResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Success status', example: true }),
    __metadata("design:type", Boolean)
], ApproveAddonResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Response message' }),
    __metadata("design:type", String)
], ApproveAddonResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Response data' }),
    __metadata("design:type", ApproveAddonDataDto)
], ApproveAddonResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Error code (optional)', required: false }),
    __metadata("design:type", String)
], ApproveAddonResponseDto.prototype, "error_code", void 0);
//# sourceMappingURL=approve-addon-response.dto.js.map