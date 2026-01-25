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
exports.RefreshToken = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const user_entity_1 = require("./user.entity");
let RefreshToken = class RefreshToken {
};
exports.RefreshToken = RefreshToken;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RefreshToken.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], RefreshToken.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'token_hash' }),
    __metadata("design:type", String)
], RefreshToken.prototype, "tokenHash", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'expires_at' }),
    __metadata("design:type", Date)
], RefreshToken.prototype, "expiresAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'is_revoked', default: false }),
    __metadata("design:type", Boolean)
], RefreshToken.prototype, "isRevoked", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'device_info', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], RefreshToken.prototype, "deviceInfo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], RefreshToken.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.refreshTokens),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], RefreshToken.prototype, "user", void 0);
exports.RefreshToken = RefreshToken = __decorate([
    (0, typeorm_1.Entity)('refresh_tokens')
], RefreshToken);
//# sourceMappingURL=refresh-token.entity.js.map