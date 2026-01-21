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
exports.UpdateDeliverySettingsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UpdateDeliverySettingsDto {
}
exports.UpdateDeliverySettingsDto = UpdateDeliverySettingsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Enable/disable delivery charges for at-home services',
        example: true,
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateDeliverySettingsDto.prototype, "deliveryChargesEnabled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Base delivery charge (fixed amount)',
        example: 50,
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateDeliverySettingsDto.prototype, "baseDeliveryCharge", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Charge per kilometer for distance-based pricing',
        example: 10,
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateDeliverySettingsDto.prototype, "perKmCharge", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Free delivery up to this distance (in km)',
        example: 5,
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateDeliverySettingsDto.prototype, "freeDeliveryUptoKm", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Maximum delivery distance allowed (in km)',
        example: 20,
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateDeliverySettingsDto.prototype, "maxDeliveryDistanceKm", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Minimum order amount for free delivery',
        example: 1000,
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateDeliverySettingsDto.prototype, "freeDeliveryAboveAmount", void 0);
//# sourceMappingURL=update-delivery-settings.dto.js.map