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
exports.CustomerAddServicesDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CustomerAddServicesDto {
    validate() {
        if (!this.businessServiceIds && !this.servicePackageIds) {
            throw new Error('At least one of businessServiceIds or servicePackageIds must be provided');
        }
        return true;
    }
}
exports.CustomerAddServicesDto = CustomerAddServicesDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of business service IDs to add as add-ons',
        example: ['123e4567-e89b-12d3-a456-426614174000'],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], CustomerAddServicesDto.prototype, "businessServiceIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of service package IDs to add as add-ons',
        example: ['123e4567-e89b-12d3-a456-426614174001'],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], CustomerAddServicesDto.prototype, "servicePackageIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional notes about the add-on services',
        example: 'Customer requested during service',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CustomerAddServicesDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => !o.businessServiceIds && !o.servicePackageIds),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CustomerAddServicesDto.prototype, "validate", null);
//# sourceMappingURL=customer-add-services.dto.js.map