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
exports.BusinessDocument = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const business_owner_entity_1 = require("./business-owner.entity");
const business_document_enum_1 = require("../../common/enums/business-document.enum");
let BusinessDocument = class BusinessDocument {
};
exports.BusinessDocument = BusinessDocument;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BusinessDocument.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'business_owner_id' }),
    __metadata("design:type", String)
], BusinessDocument.prototype, "businessOwnerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: business_document_enum_1.DocumentType }),
    (0, typeorm_1.Column)({
        name: 'document_type',
        type: 'enum',
        enum: business_document_enum_1.DocumentType,
    }),
    __metadata("design:type", String)
], BusinessDocument.prototype, "documentType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'document_url', type: 'text' }),
    __metadata("design:type", String)
], BusinessDocument.prototype, "documentUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: business_document_enum_1.DocumentStatus }),
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'enum',
        enum: business_document_enum_1.DocumentStatus,
        default: business_document_enum_1.DocumentStatus.PENDING,
    }),
    __metadata("design:type", String)
], BusinessDocument.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'rejection_reason', type: 'text', nullable: true }),
    __metadata("design:type", String)
], BusinessDocument.prototype, "rejectionReason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], BusinessDocument.prototype, "uploadedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'verified_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], BusinessDocument.prototype, "verifiedAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], BusinessDocument.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => business_owner_entity_1.BusinessOwner, (businessOwner) => businessOwner.documents),
    (0, typeorm_1.JoinColumn)({ name: 'business_owner_id' }),
    __metadata("design:type", business_owner_entity_1.BusinessOwner)
], BusinessDocument.prototype, "businessOwner", void 0);
exports.BusinessDocument = BusinessDocument = __decorate([
    (0, typeorm_1.Entity)('business_documents')
], BusinessDocument);
//# sourceMappingURL=business-document.entity.js.map