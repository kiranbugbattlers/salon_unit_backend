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
exports.MessageResponseDto = exports.MessageData = exports.ProfilePictureResponseDto = exports.ProfilePictureData = exports.StaffListResponseDto = exports.StaffListData = exports.StaffResponseDto = exports.StaffData = void 0;
const swagger_1 = require("@nestjs/swagger");
const enums_1 = require("../../common/enums");
const api_response_dto_1 = require("../../common/dto/api-response.dto");
class StaffData {
}
exports.StaffData = StaffData;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], StaffData.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], StaffData.prototype, "businessOwnerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], StaffData.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], StaffData.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], StaffData.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], StaffData.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], StaffData.prototype, "dateOfBirth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.Gender }),
    __metadata("design:type", String)
], StaffData.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], StaffData.prototype, "profilePic", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], StaffData.prototype, "profilePicCdnUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], StaffData.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Lunch break start time in HH:MM format', nullable: true }),
    __metadata("design:type", String)
], StaffData.prototype, "lunchStartTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Lunch break end time in HH:MM format', nullable: true }),
    __metadata("design:type", String)
], StaffData.prototype, "lunchEndTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], StaffData.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], StaffData.prototype, "updatedAt", void 0);
class StaffResponseDto extends api_response_dto_1.ApiResponseDto {
    constructor(code = 200, success = true, message, data) {
        super(code, success, message, data);
    }
}
exports.StaffResponseDto = StaffResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], StaffResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], StaffResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Staff member retrieved successfully' }),
    __metadata("design:type", String)
], StaffResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", StaffData)
], StaffResponseDto.prototype, "data", void 0);
class StaffListData {
}
exports.StaffListData = StaffListData;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [StaffData] }),
    __metadata("design:type", Array)
], StaffListData.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], StaffListData.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], StaffListData.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], StaffListData.prototype, "limit", void 0);
class StaffListResponseDto extends api_response_dto_1.ApiResponseDto {
    constructor(code = 200, success = true, message, data) {
        super(code, success, message, data);
    }
}
exports.StaffListResponseDto = StaffListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], StaffListResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], StaffListResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Staff members retrieved successfully' }),
    __metadata("design:type", String)
], StaffListResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", StaffListData)
], StaffListResponseDto.prototype, "data", void 0);
class ProfilePictureData {
}
exports.ProfilePictureData = ProfilePictureData;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Direct S3 URL' }),
    __metadata("design:type", String)
], ProfilePictureData.prototype, "profilePic", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'CDN URL (recommended for faster loading)' }),
    __metadata("design:type", String)
], ProfilePictureData.prototype, "profilePicCdnUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'S3 key for management' }),
    __metadata("design:type", String)
], ProfilePictureData.prototype, "profilePicS3Key", void 0);
class ProfilePictureResponseDto extends api_response_dto_1.ApiResponseDto {
    constructor(code = 201, success = true, message, data) {
        super(code, success, message, data);
    }
}
exports.ProfilePictureResponseDto = ProfilePictureResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 201 }),
    __metadata("design:type", Number)
], ProfilePictureResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], ProfilePictureResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Profile picture uploaded successfully' }),
    __metadata("design:type", String)
], ProfilePictureResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", ProfilePictureData)
], ProfilePictureResponseDto.prototype, "data", void 0);
class MessageData {
}
exports.MessageData = MessageData;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Operation completed successfully' }),
    __metadata("design:type", String)
], MessageData.prototype, "message", void 0);
class MessageResponseDto extends api_response_dto_1.ApiResponseDto {
    constructor(code = 200, success = true, message, data) {
        super(code, success, message, data);
    }
}
exports.MessageResponseDto = MessageResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], MessageResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], MessageResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Operation completed successfully' }),
    __metadata("design:type", String)
], MessageResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", MessageData)
], MessageResponseDto.prototype, "data", void 0);
//# sourceMappingURL=staff-response.dto.js.map