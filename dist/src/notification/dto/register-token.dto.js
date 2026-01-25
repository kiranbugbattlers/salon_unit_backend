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
exports.RegisterTokenDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const device_token_entity_1 = require("../entities/device-token.entity");
class RegisterTokenDto {
}
exports.RegisterTokenDto = RegisterTokenDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'FCM token received from the client device',
        example: 'fXxY_1234567890abcdefghijklmnopqrstuvwxyz...',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterTokenDto.prototype, "fcmToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of device',
        enum: device_token_entity_1.DeviceType,
        example: device_token_entity_1.DeviceType.ANDROID,
    }),
    (0, class_validator_1.IsEnum)(device_token_entity_1.DeviceType),
    __metadata("design:type", String)
], RegisterTokenDto.prototype, "deviceType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of user',
        enum: device_token_entity_1.UserType,
        example: device_token_entity_1.UserType.CUSTOMER,
    }),
    (0, class_validator_1.IsEnum)(device_token_entity_1.UserType),
    __metadata("design:type", String)
], RegisterTokenDto.prototype, "userType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Additional device information',
        required: false,
        example: {
            model: 'iPhone 14 Pro',
            osVersion: 'iOS 17.0',
            appVersion: '1.0.0',
            deviceName: 'John\'s iPhone',
        },
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], RegisterTokenDto.prototype, "deviceInfo", void 0);
//# sourceMappingURL=register-token.dto.js.map