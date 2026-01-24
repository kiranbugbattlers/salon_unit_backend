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
exports.BusinessMediaDeleteResponseDto = exports.BusinessMediaListResponseDto = exports.BusinessMediaUploadResponseDto = exports.BusinessMediaUploadDataDto = exports.BusinessMediaListDataDto = exports.BusinessMediaUploadDto = exports.BusinessMediaDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const api_response_dto_1 = require("../../common/dto/api-response.dto");
class BusinessMediaDto {
}
exports.BusinessMediaDto = BusinessMediaDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BusinessMediaDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['image', 'video'] }),
    __metadata("design:type", String)
], BusinessMediaDto.prototype, "mediaType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BusinessMediaDto.prototype, "mediaUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], BusinessMediaDto.prototype, "cdnUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], BusinessMediaDto.prototype, "thumbnailUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], BusinessMediaDto.prototype, "fileName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Number)
], BusinessMediaDto.prototype, "fileSize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], BusinessMediaDto.prototype, "mimeType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], BusinessMediaDto.prototype, "displayOrder", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], BusinessMediaDto.prototype, "createdAt", void 0);
class BusinessMediaUploadDto {
}
exports.BusinessMediaUploadDto = BusinessMediaUploadDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BusinessMediaUploadDto.prototype, "mediaId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BusinessMediaUploadDto.prototype, "mediaUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BusinessMediaUploadDto.prototype, "cdnUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BusinessMediaUploadDto.prototype, "s3Key", void 0);
class BusinessMediaListDataDto {
}
exports.BusinessMediaListDataDto = BusinessMediaListDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [BusinessMediaDto] }),
    __metadata("design:type", Array)
], BusinessMediaListDataDto.prototype, "media", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], BusinessMediaListDataDto.prototype, "count", void 0);
class BusinessMediaUploadDataDto {
}
exports.BusinessMediaUploadDataDto = BusinessMediaUploadDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [BusinessMediaUploadDto] }),
    __metadata("design:type", Array)
], BusinessMediaUploadDataDto.prototype, "media", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], BusinessMediaUploadDataDto.prototype, "count", void 0);
class BusinessMediaUploadResponseDto extends api_response_dto_1.ApiResponseDto {
    constructor(code, success, message, data) {
        super(code, success, message, data);
    }
}
exports.BusinessMediaUploadResponseDto = BusinessMediaUploadResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 201 }),
    __metadata("design:type", Number)
], BusinessMediaUploadResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], BusinessMediaUploadResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Business media uploaded successfully' }),
    __metadata("design:type", String)
], BusinessMediaUploadResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: BusinessMediaUploadDataDto }),
    __metadata("design:type", BusinessMediaUploadDataDto)
], BusinessMediaUploadResponseDto.prototype, "data", void 0);
class BusinessMediaListResponseDto extends api_response_dto_1.ApiResponseDto {
    constructor(code, success, message, data) {
        super(code, success, message, data);
    }
}
exports.BusinessMediaListResponseDto = BusinessMediaListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], BusinessMediaListResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], BusinessMediaListResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Business media retrieved successfully' }),
    __metadata("design:type", String)
], BusinessMediaListResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: BusinessMediaListDataDto }),
    __metadata("design:type", BusinessMediaListDataDto)
], BusinessMediaListResponseDto.prototype, "data", void 0);
class BusinessMediaDeleteResponseDto extends api_response_dto_1.ApiResponseDto {
    constructor(code = 200, success = true, message = 'Business media deleted successfully') {
        super(code, success, message, null);
    }
}
exports.BusinessMediaDeleteResponseDto = BusinessMediaDeleteResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], BusinessMediaDeleteResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], BusinessMediaDeleteResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Business media deleted successfully' }),
    __metadata("design:type", String)
], BusinessMediaDeleteResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: null }),
    __metadata("design:type", void 0)
], BusinessMediaDeleteResponseDto.prototype, "data", void 0);
//# sourceMappingURL=business-media.dto.js.map