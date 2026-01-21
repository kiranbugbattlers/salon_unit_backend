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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var IdempotencyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdempotencyService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const idempotency_key_entity_1 = require("../database/entities/idempotency-key.entity");
let IdempotencyService = IdempotencyService_1 = class IdempotencyService {
    constructor(idempotencyRepository) {
        this.idempotencyRepository = idempotencyRepository;
        this.logger = new common_1.Logger(IdempotencyService_1.name);
        this.DEFAULT_EXPIRY_HOURS = 24;
    }
    async checkIdempotencyKey(key, endpoint, userId) {
        const record = await this.idempotencyRepository.findOne({
            where: {
                idempotencyKey: key,
                endpoint,
                userId,
            },
        });
        if (!record) {
            return { exists: false };
        }
        if (new Date() > record.expiresAt) {
            await this.idempotencyRepository.delete(record.id);
            return { exists: false };
        }
        if (record.status === 'processing') {
            return {
                exists: true,
                status: 'processing',
                response: { message: 'Request is being processed. Please wait.' },
            };
        }
        return {
            exists: true,
            status: record.status,
            response: record.responsePayload,
        };
    }
    async createIdempotencyKey(key, endpoint, userId, requestPayload, expiryHours = this.DEFAULT_EXPIRY_HOURS) {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + expiryHours);
        const record = this.idempotencyRepository.create({
            idempotencyKey: key,
            endpoint,
            userId,
            requestPayload,
            status: 'processing',
            expiresAt,
        });
        await this.idempotencyRepository.save(record);
        this.logger.log(`Idempotency key created: ${key} for ${endpoint} (expires in ${expiryHours}h)`);
    }
    async markCompleted(key, endpoint, userId, response) {
        await this.idempotencyRepository.update({
            idempotencyKey: key,
            endpoint,
            userId,
        }, {
            status: 'completed',
            responsePayload: response,
            completedAt: new Date(),
        });
        this.logger.log(`Idempotency key marked as completed: ${key}`);
    }
    async markFailed(key, endpoint, userId, error) {
        await this.idempotencyRepository.update({
            idempotencyKey: key,
            endpoint,
            userId,
        }, {
            status: 'failed',
            responsePayload: { error: error.message || 'Request failed' },
            completedAt: new Date(),
        });
        this.logger.log(`Idempotency key marked as failed: ${key}`);
    }
    async cleanupExpiredKeys() {
        const result = await this.idempotencyRepository.delete({
            expiresAt: (0, typeorm_2.LessThan)(new Date()),
        });
        const deletedCount = result.affected || 0;
        if (deletedCount > 0) {
            this.logger.log(`Cleaned up ${deletedCount} expired idempotency keys`);
        }
        return deletedCount;
    }
    async getStats() {
        const total = await this.idempotencyRepository.count();
        const processing = await this.idempotencyRepository.count({
            where: { status: 'processing' },
        });
        const completed = await this.idempotencyRepository.count({
            where: { status: 'completed' },
        });
        const failed = await this.idempotencyRepository.count({
            where: { status: 'failed' },
        });
        return {
            total,
            processing,
            completed,
            failed,
        };
    }
};
exports.IdempotencyService = IdempotencyService;
exports.IdempotencyService = IdempotencyService = IdempotencyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(idempotency_key_entity_1.IdempotencyKey)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], IdempotencyService);
//# sourceMappingURL=idempotency.service.js.map