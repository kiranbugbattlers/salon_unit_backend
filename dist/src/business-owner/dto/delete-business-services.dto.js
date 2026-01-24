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
exports.DeleteBusinessServicesResponseDto = exports.DeleteBusinessServicesDataDto = exports.DeletedBusinessServiceDto = exports.DeleteBusinessServicesDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const api_response_dto_1 = require("../../common/dto/api-response.dto");
class DeleteBusinessServicesDto {
}
exports.DeleteBusinessServicesDto = DeleteBusinessServicesDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of business service IDs to delete permanently',
        example: ['uuid-business-service-1', 'uuid-business-service-2'],
        type: [String],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1, { message: 'At least one business service ID must be provided' }),
    (0, class_validator_1.IsUUID)(4, { each: true, message: 'Each business service ID must be a valid UUID' }),
    (0, class_validator_1.IsNotEmpty)({ each: true, message: 'Business service IDs cannot be empty' }),
    __metadata("design:type", Array)
], DeleteBusinessServicesDto.prototype, "businessServiceIds", void 0);
class DeletedBusinessServiceDto {
}
exports.DeletedBusinessServiceDto = DeletedBusinessServiceDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], DeletedBusinessServiceDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], DeletedBusinessServiceDto.prototype, "reason", void 0);
class DeleteBusinessServicesDataDto {
}
exports.DeleteBusinessServicesDataDto = DeleteBusinessServicesDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String] }),
    __metadata("design:type", Array)
], DeleteBusinessServicesDataDto.prototype, "deleted", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [DeletedBusinessServiceDto] }),
    __metadata("design:type", Array)
], DeleteBusinessServicesDataDto.prototype, "failed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], DeleteBusinessServicesDataDto.prototype, "total", void 0);
class DeleteBusinessServicesResponseDto extends api_response_dto_1.ApiResponseDto {
    constructor(code = 200, success = true, message = 'Business services deleted successfully', data) {
        super(code, success, message, data);
    }
}
exports.DeleteBusinessServicesResponseDto = DeleteBusinessServicesResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], DeleteBusinessServicesResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], DeleteBusinessServicesResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Business services deleted successfully' }),
    __metadata("design:type", String)
], DeleteBusinessServicesResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: DeleteBusinessServicesDataDto }),
    __metadata("design:type", DeleteBusinessServicesDataDto)
], DeleteBusinessServicesResponseDto.prototype, "data", void 0);
//# sourceMappingURL=delete-business-services.dto.js.map