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
exports.AdminAuthResponseDto = exports.AdminDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const auth_response_dto_1 = require("./auth-response.dto");
class AdminDto {
}
exports.AdminDto = AdminDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Admin ID', example: 'uuid' }),
    __metadata("design:type", String)
], AdminDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Admin username', example: 'admin_user' }),
    __metadata("design:type", String)
], AdminDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Admin first name', example: 'Admin', required: false }),
    __metadata("design:type", String)
], AdminDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Admin last name', example: 'User', required: false }),
    __metadata("design:type", String)
], AdminDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Admin email', example: 'admin@salon.com', required: false }),
    __metadata("design:type", String)
], AdminDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Admin full name', example: 'Admin User' }),
    __metadata("design:type", String)
], AdminDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Is admin active', example: true }),
    __metadata("design:type", Boolean)
], AdminDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last login timestamp', required: false }),
    __metadata("design:type", Date)
], AdminDto.prototype, "lastLogin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Admin role', example: 'admin' }),
    __metadata("design:type", String)
], AdminDto.prototype, "role", void 0);
class AdminAuthResponseDto {
}
exports.AdminAuthResponseDto = AdminAuthResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Admin information', type: AdminDto }),
    __metadata("design:type", AdminDto)
], AdminAuthResponseDto.prototype, "admin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'JWT tokens', type: auth_response_dto_1.TokensDto }),
    __metadata("design:type", auth_response_dto_1.TokensDto)
], AdminAuthResponseDto.prototype, "tokens", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether this is a new admin login', example: false }),
    __metadata("design:type", Boolean)
], AdminAuthResponseDto.prototype, "isNewLogin", void 0);
//# sourceMappingURL=admin-response.dto.js.map