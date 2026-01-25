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
exports.CustomerAddressDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CustomerAddressDto {
}
exports.CustomerAddressDto = CustomerAddressDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Street address', example: '123 Main Street, Apt 4B' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CustomerAddressDto.prototype, "streetAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'City', example: 'Mumbai' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CustomerAddressDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'State', example: 'Maharashtra' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CustomerAddressDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Postal code', example: '400001' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CustomerAddressDto.prototype, "postalCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Latitude for delivery charge calculation',
        example: 19.0760,
        minimum: -90,
        maximum: 90
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-90),
    (0, class_validator_1.Max)(90),
    __metadata("design:type", Number)
], CustomerAddressDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Longitude for delivery charge calculation',
        example: 72.8777,
        minimum: -180,
        maximum: 180
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-180),
    (0, class_validator_1.Max)(180),
    __metadata("design:type", Number)
], CustomerAddressDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nearby landmark', example: 'Near City Mall', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CustomerAddressDto.prototype, "landmark", void 0);
//# sourceMappingURL=customer-address.dto.js.map