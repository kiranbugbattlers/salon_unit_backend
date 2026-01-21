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
var AuditLoggerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLoggerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const admin_action_audit_entity_1 = require("../database/entities/admin-action-audit.entity");
let AuditLoggerService = AuditLoggerService_1 = class AuditLoggerService {
    constructor(auditRepository) {
        this.auditRepository = auditRepository;
        this.logger = new common_1.Logger(AuditLoggerService_1.name);
    }
    async logAdminAction(params) {
        try {
            const auditLog = this.auditRepository.create({
                adminId: params.adminId,
                actionType: params.actionType,
                entityType: params.entityType,
                entityId: params.entityId,
                stateBefore: params.stateBefore,
                stateAfter: params.stateAfter,
                reason: params.reason,
                notes: params.notes,
                ipAddress: params.ipAddress,
                userAgent: params.userAgent,
                metadata: params.metadata,
            });
            const savedLog = await this.auditRepository.save(auditLog);
            this.logger.log(`Admin action logged: ${params.actionType} by admin ${params.adminId} on ${params.entityType}:${params.entityId}`);
            return savedLog;
        }
        catch (error) {
            this.logger.error(`Failed to log admin action: ${error.message}`, error.stack);
            return null;
        }
    }
    async getEntityAuditLogs(entityType, entityId, options) {
        const page = options?.page || 1;
        const limit = options?.limit || 20;
        const skip = (page - 1) * limit;
        const [logs, total] = await this.auditRepository.findAndCount({
            where: {
                entityType,
                entityId,
            },
            relations: ['admin'],
            order: {
                createdAt: 'DESC',
            },
            skip,
            take: limit,
        });
        return { logs, total };
    }
    async getAdminAuditLogs(adminId, options) {
        const page = options?.page || 1;
        const limit = options?.limit || 20;
        const skip = (page - 1) * limit;
        const where = { adminId };
        if (options?.actionType) {
            where.actionType = options.actionType;
        }
        const [logs, total] = await this.auditRepository.findAndCount({
            where,
            relations: ['admin'],
            order: {
                createdAt: 'DESC',
            },
            skip,
            take: limit,
        });
        return { logs, total };
    }
    async getRecentAuditLogs(limit = 50) {
        return await this.auditRepository.find({
            relations: ['admin'],
            order: {
                createdAt: 'DESC',
            },
            take: limit,
        });
    }
    async searchAuditLogs(params) {
        const page = params.page || 1;
        const limit = params.limit || 20;
        const skip = (page - 1) * limit;
        const queryBuilder = this.auditRepository
            .createQueryBuilder('audit')
            .leftJoinAndSelect('audit.admin', 'admin');
        if (params.adminId) {
            queryBuilder.andWhere('audit.adminId = :adminId', { adminId: params.adminId });
        }
        if (params.actionType) {
            queryBuilder.andWhere('audit.actionType = :actionType', { actionType: params.actionType });
        }
        if (params.entityType) {
            queryBuilder.andWhere('audit.entityType = :entityType', { entityType: params.entityType });
        }
        if (params.startDate) {
            queryBuilder.andWhere('audit.createdAt >= :startDate', { startDate: params.startDate });
        }
        if (params.endDate) {
            queryBuilder.andWhere('audit.createdAt <= :endDate', { endDate: params.endDate });
        }
        queryBuilder
            .orderBy('audit.createdAt', 'DESC')
            .skip(skip)
            .take(limit);
        const [logs, total] = await queryBuilder.getManyAndCount();
        return { logs, total };
    }
};
exports.AuditLoggerService = AuditLoggerService;
exports.AuditLoggerService = AuditLoggerService = AuditLoggerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(admin_action_audit_entity_1.AdminActionAudit)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AuditLoggerService);
//# sourceMappingURL=audit-logger.service.js.map