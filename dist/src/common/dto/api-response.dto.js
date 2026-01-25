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
exports.VerifyOtpResponseDto = exports.SendOtpResponseDto = exports.ApiResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class ApiResponseDto {
    constructor(code, success, message, data) {
        this.code = code;
        this.success = success;
        this.message = message;
        this.data = data;
    }
}
exports.ApiResponseDto = ApiResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], ApiResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], ApiResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Operation completed successfully' }),
    __metadata("design:type", String)
], ApiResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], ApiResponseDto.prototype, "data", void 0);
class SendOtpResponseDto extends ApiResponseDto {
    constructor(code = 200, success = true, message = 'OTP sent successfully') {
        super(code, success, message);
    }
}
exports.SendOtpResponseDto = SendOtpResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], SendOtpResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], SendOtpResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'OTP sent successfully' }),
    __metadata("design:type", String)
], SendOtpResponseDto.prototype, "message", void 0);
class VerifyOtpResponseDto extends ApiResponseDto {
    constructor(code, success, message, data) {
        super(code, success, message, data);
    }
}
exports.VerifyOtpResponseDto = VerifyOtpResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], VerifyOtpResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], VerifyOtpResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'OTP verified successfully' }),
    __metadata("design:type", String)
], VerifyOtpResponseDto.prototype, "message", void 0);
//# sourceMappingURL=api-response.dto.js.map