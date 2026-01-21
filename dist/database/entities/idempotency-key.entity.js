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
exports.IdempotencyKey = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
let IdempotencyKey = class IdempotencyKey {
};
exports.IdempotencyKey = IdempotencyKey;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], IdempotencyKey.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The idempotency key provided by the client' }),
    (0, typeorm_1.Column)({ name: 'idempotency_key', length: 255 }),
    __metadata("design:type", String)
], IdempotencyKey.prototype, "idempotencyKey", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The API endpoint this key is for' }),
    (0, typeorm_1.Column)({ name: 'endpoint', length: 255 }),
    __metadata("design:type", String)
], IdempotencyKey.prototype, "endpoint", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The user ID making the request' }),
    (0, typeorm_1.Column)({ name: 'user_id', length: 255 }),
    __metadata("design:type", String)
], IdempotencyKey.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The original request payload' }),
    (0, typeorm_1.Column)({ name: 'request_payload', type: 'jsonb' }),
    __metadata("design:type", Object)
], IdempotencyKey.prototype, "requestPayload", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The response payload', required: false }),
    (0, typeorm_1.Column)({ name: 'response_payload', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], IdempotencyKey.prototype, "responsePayload", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: ['processing', 'completed', 'failed'],
        description: 'Current status of the request'
    }),
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'enum',
        enum: ['processing', 'completed', 'failed'],
        default: 'processing',
    }),
    __metadata("design:type", String)
], IdempotencyKey.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'When the request was completed', required: false }),
    (0, typeorm_1.Column)({ name: 'completed_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], IdempotencyKey.prototype, "completedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'When this key expires' }),
    (0, typeorm_1.Column)({ name: 'expires_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], IdempotencyKey.prototype, "expiresAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], IdempotencyKey.prototype, "createdAt", void 0);
exports.IdempotencyKey = IdempotencyKey = __decorate([
    (0, typeorm_1.Entity)('idempotency_keys'),
    (0, typeorm_1.Index)(['idempotencyKey', 'endpoint', 'userId'], { unique: true }),
    (0, typeorm_1.Index)(['expiresAt'])
], IdempotencyKey);
//# sourceMappingURL=idempotency-key.entity.js.map