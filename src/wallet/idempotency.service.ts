import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { IdempotencyKey } from '../database/entities/idempotency-key.entity';

@Injectable()
export class IdempotencyService {
  private readonly logger = new Logger(IdempotencyService.name);
  private readonly DEFAULT_EXPIRY_HOURS = 24;

  constructor(
    @InjectRepository(IdempotencyKey)
    private readonly idempotencyRepository: Repository<IdempotencyKey>,
  ) {}

  /**
   * Check if an idempotency key has been used before
   * Returns cached response if found
   */
  async checkIdempotencyKey(
    key: string,
    endpoint: string,
    userId: string,
  ): Promise<{ exists: boolean; response?: any; status?: string }> {
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

    // Check if expired
    if (new Date() > record.expiresAt) {
      // Delete expired record
      await this.idempotencyRepository.delete(record.id);
      return { exists: false };
    }

    // If still processing, return that status
    if (record.status === 'processing') {
      return {
        exists: true,
        status: 'processing',
        response: { message: 'Request is being processed. Please wait.' },
      };
    }

    // Return cached response
    return {
      exists: true,
      status: record.status,
      response: record.responsePayload,
    };
  }

  /**
   * Create a new idempotency key record
   */
  async createIdempotencyKey(
    key: string,
    endpoint: string,
    userId: string,
    requestPayload: any,
    expiryHours: number = this.DEFAULT_EXPIRY_HOURS,
  ): Promise<void> {
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

  /**
   * Mark idempotency key as completed and store response
   */
  async markCompleted(
    key: string,
    endpoint: string,
    userId: string,
    response: any,
  ): Promise<void> {
    await this.idempotencyRepository.update(
      {
        idempotencyKey: key,
        endpoint,
        userId,
      },
      {
        status: 'completed',
        responsePayload: response,
        completedAt: new Date(),
      },
    );

    this.logger.log(`Idempotency key marked as completed: ${key}`);
  }

  /**
   * Mark idempotency key as failed
   */
  async markFailed(
    key: string,
    endpoint: string,
    userId: string,
    error: any,
  ): Promise<void> {
    await this.idempotencyRepository.update(
      {
        idempotencyKey: key,
        endpoint,
        userId,
      },
      {
        status: 'failed',
        responsePayload: { error: error.message || 'Request failed' },
        completedAt: new Date(),
      },
    );

    this.logger.log(`Idempotency key marked as failed: ${key}`);
  }

  /**
   * Clean up expired idempotency keys (run via cron)
   */
  async cleanupExpiredKeys(): Promise<number> {
    const result = await this.idempotencyRepository.delete({
      expiresAt: LessThan(new Date()),
    });

    const deletedCount = result.affected || 0;

    if (deletedCount > 0) {
      this.logger.log(`Cleaned up ${deletedCount} expired idempotency keys`);
    }

    return deletedCount;
  }

  /**
   * Get idempotency key usage stats
   */
  async getStats(): Promise<any> {
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
}
