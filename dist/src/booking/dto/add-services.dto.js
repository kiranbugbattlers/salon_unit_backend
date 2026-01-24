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
exports.AddServicesDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class AddServicesDto {
}
exports.AddServicesDto = AddServicesDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Business service IDs to add as add-ons',
        example: ['123e4567-e89b-12d3-a456-426614174000', '456e7890-e12b-34c5-d678-901234567890'],
        required: false,
        type: [String]
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], AddServicesDto.prototype, "businessServiceIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Service package IDs to add as add-ons',
        example: ['789e0123-e45f-67g8-h901-234567890123'],
        required: false,
        type: [String]
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], AddServicesDto.prototype, "servicePackageIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Notes about add-on services',
        example: 'Customer requested hair coloring after consultation',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddServicesDto.prototype, "notes", void 0);
//# sourceMappingURL=add-services.dto.js.map