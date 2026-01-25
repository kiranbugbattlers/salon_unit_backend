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
exports.ApprovalRequestDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const enums_1 = require("../../common/enums");
class ApprovalRequestDto {
}
exports.ApprovalRequestDto = ApprovalRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ApprovalRequestDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ApprovalRequestDto.prototype, "businessOwnerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ApprovalRequestDto.prototype, "businessName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ApprovalRequestDto.prototype, "businessDescription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ApprovalRequestDto.prototype, "businessAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ApprovalRequestDto.prototype, "businessOwnerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ApprovalRequestDto.prototype, "businessOwnerPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], ApprovalRequestDto.prototype, "businessOwnerEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ApprovalRequestDto.prototype, "assignedAgentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ApprovalRequestDto.prototype, "assignedAgentName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.ApprovalStatus }),
    __metadata("design:type", String)
], ApprovalRequestDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], ApprovalRequestDto.prototype, "reviewNotes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], ApprovalRequestDto.prototype, "rejectionReason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], ApprovalRequestDto.prototype, "isAutoAssigned", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Number)
], ApprovalRequestDto.prototype, "distanceToAgentKm", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], ApprovalRequestDto.prototype, "assignedByAdminId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Date)
], ApprovalRequestDto.prototype, "reviewedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], ApprovalRequestDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], ApprovalRequestDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'UPI ID of the business owner',
        required: false
    }),
    __metadata("design:type", String)
], ApprovalRequestDto.prototype, "upiId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Credit limit assigned to the vendor',
        required: false
    }),
    __metadata("design:type", Number)
], ApprovalRequestDto.prototype, "creditLimit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vendor status',
        required: false
    }),
    __metadata("design:type", String)
], ApprovalRequestDto.prototype, "vendorStatus", void 0);
//# sourceMappingURL=approval-request.dto.js.map