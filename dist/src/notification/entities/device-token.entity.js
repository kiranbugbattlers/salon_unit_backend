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
exports.DeviceToken = exports.UserType = exports.DeviceType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../database/entities/user.entity");
var DeviceType;
(function (DeviceType) {
    DeviceType["IOS"] = "ios";
    DeviceType["ANDROID"] = "android";
    DeviceType["WEB"] = "web";
})(DeviceType || (exports.DeviceType = DeviceType = {}));
var UserType;
(function (UserType) {
    UserType["CUSTOMER"] = "customer";
    UserType["BUSINESS_OWNER"] = "business_owner";
    UserType["STAFF"] = "staff";
    UserType["ADMIN"] = "admin";
})(UserType || (exports.UserType = UserType = {}));
let DeviceToken = class DeviceToken {
};
exports.DeviceToken = DeviceToken;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DeviceToken.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'uuid' }),
    __metadata("design:type", String)
], DeviceToken.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], DeviceToken.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'user_type',
        type: 'enum',
        enum: UserType,
    }),
    __metadata("design:type", String)
], DeviceToken.prototype, "userType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fcm_token', type: 'varchar', length: 500 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], DeviceToken.prototype, "fcmToken", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'device_type',
        type: 'enum',
        enum: DeviceType,
    }),
    __metadata("design:type", String)
], DeviceToken.prototype, "deviceType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'device_info', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], DeviceToken.prototype, "deviceInfo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], DeviceToken.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_used_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], DeviceToken.prototype, "lastUsedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], DeviceToken.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], DeviceToken.prototype, "updatedAt", void 0);
exports.DeviceToken = DeviceToken = __decorate([
    (0, typeorm_1.Entity)('device_tokens'),
    (0, typeorm_1.Index)(['userId', 'fcmToken'], { unique: true })
], DeviceToken);
//# sourceMappingURL=device-token.entity.js.map