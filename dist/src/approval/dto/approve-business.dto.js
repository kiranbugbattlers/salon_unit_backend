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
exports.ApproveBusinessDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class ApproveBusinessDto {
}
exports.ApproveBusinessDto = ApproveBusinessDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional review notes for the approval',
        example: 'Business meets all requirements and documentation is complete.',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], ApproveBusinessDto.prototype, "reviewNotes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Credit limit to assign to the vendor',
        example: 50000,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ApproveBusinessDto.prototype, "creditLimit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Admin remarks about the vendor approval',
        example: 'Approved with standard credit terms',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], ApproveBusinessDto.prototype, "adminRemarks", void 0);
//# sourceMappingURL=approve-business.dto.js.map