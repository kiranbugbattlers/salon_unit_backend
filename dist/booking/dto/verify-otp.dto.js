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
exports.CompleteServiceDto = exports.VerifyBookingOtpDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class VerifyBookingOtpDto {
}
exports.VerifyBookingOtpDto = VerifyBookingOtpDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '6-digit OTP code for booking verification',
        example: '123456',
        minLength: 6,
        maxLength: 6,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(6, 6, { message: 'OTP code must be exactly 6 digits' }),
    __metadata("design:type", String)
], VerifyBookingOtpDto.prototype, "otpCode", void 0);
class CompleteServiceDto {
}
exports.CompleteServiceDto = CompleteServiceDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional notes about service completion',
        example: 'Customer satisfied with the service',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompleteServiceDto.prototype, "notes", void 0);
//# sourceMappingURL=verify-otp.dto.js.map