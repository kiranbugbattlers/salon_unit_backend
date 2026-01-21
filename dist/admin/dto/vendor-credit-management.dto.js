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
exports.VendorCreditStatusDto = exports.AddVendorCreditDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class AddVendorCreditDto {
}
exports.AddVendorCreditDto = AddVendorCreditDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Credit points to add to vendor',
        example: 1000,
        minimum: 0.01,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], AddVendorCreditDto.prototype, "creditPoints", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Reason for adding credit points',
        example: 'Vendor approved and account activated',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AddVendorCreditDto.prototype, "reason", void 0);
class VendorCreditStatusDto {
}
exports.VendorCreditStatusDto = VendorCreditStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current credit status',
        enum: ['active', 'overdue', 'suspended'],
        example: 'active',
    }),
    (0, class_validator_1.IsEnum)(['active', 'overdue', 'suspended']),
    __metadata("design:type", String)
], VendorCreditStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Notes about status change',
        example: 'Credit points depleted - account marked as overdue',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], VendorCreditStatusDto.prototype, "notes", void 0);
//# sourceMappingURL=vendor-credit-management.dto.js.map