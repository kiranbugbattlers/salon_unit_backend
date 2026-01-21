import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminActionAudit, AdminActionType } from '../database/entities/admin-action-audit.entity';

@Injectable()
export class AuditLoggerService {
  private readonly logger = new Logger(AuditLoggerService.name);

  constructor(
    @InjectRepository(AdminActionAudit)
    private readonly auditRepository: Repository<AdminActionAudit>,
  ) {}

  /**
   * Log an admin action for audit trail
   */
  async logAdminAction(params: {
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
  }): Promise<AdminActionAudit> {
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

      this.logger.log(
        `Admin action logged: ${params.actionType} by admin ${params.adminId} on ${params.entityType}:${params.entityId}`,
      );

      return savedLog;
    } catch (error) {
      this.logger.error(`Failed to log admin action: ${error.message}`, error.stack);
      // Don't throw - audit logging failure shouldn't break the main operation
      return null;
    }
  }

  /**
   * Get audit logs for a specific entity
   */
  async getEntityAuditLogs(
    entityType: string,
    entityId: string,
    options?: {
      page?: number;
      limit?: number;
    },
  ): Promise<{
    logs: AdminActionAudit[];
    total: number;
  }> {
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

  /**
   * Get audit logs by admin
   */
  async getAdminAuditLogs(
    adminId: string,
    options?: {
      page?: number;
      limit?: number;
      actionType?: AdminActionType;
    },
  ): Promise<{
    logs: AdminActionAudit[];
    total: number;
  }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { adminId };
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

  /**
   * Get recent audit logs (admin dashboard)
   */
  async getRecentAuditLogs(limit: number = 50): Promise<AdminActionAudit[]> {
    return await this.auditRepository.find({
      relations: ['admin'],
      order: {
        createdAt: 'DESC',
      },
      take: limit,
    });
  }

  /**
   * Search audit logs
   */
  async searchAuditLogs(params: {
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
  }> {
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
}
