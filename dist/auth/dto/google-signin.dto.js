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
exports.GoogleSignInDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const enums_1 = require("../../common/enums");
class GoogleSignInDto {
}
exports.GoogleSignInDto = GoogleSignInDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Google ID token obtained from Flutter google_sign_in package',
        example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjI3...',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GoogleSignInDto.prototype, "idToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User role to assign after Google sign-in',
        example: 'customer',
        enum: enums_1.UserRole,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(enums_1.UserRole, {
        message: 'Role must be either customer or business_owner',
    }),
    __metadata("design:type", String)
], GoogleSignInDto.prototype, "role", void 0);
//# sourceMappingURL=google-signin.dto.js.map