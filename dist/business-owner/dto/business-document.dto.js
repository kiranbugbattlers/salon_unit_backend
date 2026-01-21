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
exports.BusinessDocumentListResponseDto = exports.BusinessDocumentResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const business_document_enum_1 = require("../../common/enums/business-document.enum");
class BusinessDocumentResponseDto {
}
exports.BusinessDocumentResponseDto = BusinessDocumentResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BusinessDocumentResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BusinessDocumentResponseDto.prototype, "businessOwnerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: business_document_enum_1.DocumentType }),
    __metadata("design:type", String)
], BusinessDocumentResponseDto.prototype, "documentType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BusinessDocumentResponseDto.prototype, "documentUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: business_document_enum_1.DocumentStatus }),
    __metadata("design:type", String)
], BusinessDocumentResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], BusinessDocumentResponseDto.prototype, "rejectionReason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], BusinessDocumentResponseDto.prototype, "uploadedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Date)
], BusinessDocumentResponseDto.prototype, "verifiedAt", void 0);
class BusinessDocumentListResponseDto {
}
exports.BusinessDocumentListResponseDto = BusinessDocumentListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [BusinessDocumentResponseDto] }),
    __metadata("design:type", Array)
], BusinessDocumentListResponseDto.prototype, "documents", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], BusinessDocumentListResponseDto.prototype, "allRequiredUploaded", void 0);
//# sourceMappingURL=business-document.dto.js.map