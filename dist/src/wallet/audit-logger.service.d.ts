import { Repository } from 'typeorm';
import { AdminActionAudit, AdminActionType } from '../database/entities/admin-action-audit.entity';
export declare class AuditLoggerService {
    private readonly auditRepository;
    private readonly logger;
    constructor(auditRepository: Repository<AdminActionAudit>);
    logAdminAction(params: {
        adminId: string;
        actionType: AdminActionType;
        entityType: string;
        entityId: string;
        stateBefore?: any;
        stateAfter?: any;
        reason: string;
        notes?: string;
        ipAddress: string;
        userAgent?: string;
        metadata?: any;
    }): Promise<AdminActionAudit>;
    getEntityAuditLogs(entityType: string, entityId: string, options?: {
        page?: number;
        limit?: number;
    }): Promise<{
        logs: AdminActionAudit[];
        total: number;
    }>;
    getAdminAuditLogs(adminId: string, options?: {
        page?: number;
        limit?: number;
        actionType?: AdminActionType;
    }): Promise<{
        logs: AdminActionAudit[];
        total: number;
    }>;
    getRecentAuditLogs(limit?: number): Promise<AdminActionAudit[]>;
    searchAuditLogs(params: {
        adminId?: string;
        actionType?: AdminActionType;
        entityType?: string;
        startDate?: Date;
        endDate?: Date;
        page?: number;
        limit?: number;
    }): Promise<{
        logs: AdminActionAudit[];
        total: number;
    }>;
}
