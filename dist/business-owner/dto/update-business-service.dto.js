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
exports.UpdateBusinessServicesDto = exports.UpdateBusinessServiceItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class UpdateBusinessServiceItemDto {
}
exports.UpdateBusinessServiceItemDto = UpdateBusinessServiceItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Service ID to update',
        example: 'service-uuid-123'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBusinessServiceItemDto.prototype, "serviceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Custom price for this service (overrides default price)',
        example: 500,
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], UpdateBusinessServiceItemDto.prototype, "customPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Custom duration in minutes for this service (overrides default duration)',
        example: 60,
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], UpdateBusinessServiceItemDto.prototype, "customDurationMinutes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether this service is active for the business',
        example: true,
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateBusinessServiceItemDto.prototype, "isActive", void 0);
class UpdateBusinessServicesDto {
}
exports.UpdateBusinessServicesDto = UpdateBusinessServicesDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of services to update',
        type: [UpdateBusinessServiceItemDto]
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => UpdateBusinessServiceItemDto),
    __metadata("design:type", Array)
], UpdateBusinessServicesDto.prototype, "services", void 0);
//# sourceMappingURL=update-business-service.dto.js.map