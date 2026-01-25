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
exports.UpdateProfileResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const customer_profile_dto_1 = require("./customer-profile.dto");
class UpdateProfileResponseDto {
    constructor(statusCode, success, message, data) {
        this.statusCode = statusCode;
        this.success = success;
        this.message = message;
        this.data = data;
    }
}
exports.UpdateProfileResponseDto = UpdateProfileResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'HTTP status code',
        example: 200,
    }),
    __metadata("design:type", Number)
], UpdateProfileResponseDto.prototype, "statusCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Success indicator',
        example: true,
    }),
    __metadata("design:type", Boolean)
], UpdateProfileResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Response message',
        example: 'Customer profile updated successfully',
    }),
    __metadata("design:type", String)
], UpdateProfileResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Updated customer profile data',
        type: customer_profile_dto_1.CustomerProfileDto,
    }),
    __metadata("design:type", customer_profile_dto_1.CustomerProfileDto)
], UpdateProfileResponseDto.prototype, "data", void 0);
//# sourceMappingURL=update-profile-response.dto.js.map