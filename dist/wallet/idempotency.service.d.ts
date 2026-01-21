import { Repository } from 'typeorm';
import { IdempotencyKey } from '../database/entities/idempotency-key.entity';
export declare class IdempotencyService {
    private readonly idempotencyRepository;
    private readonly logger;
    private readonly DEFAULT_EXPIRY_HOURS;
    constructor(idempotencyRepository: Repository<IdempotencyKey>);
    checkIdempotencyKey(key: string, endpoint: string, userId: string): Promise<{
        exists: boolean;
        response?: any;
        status?: string;
    }>;
    createIdempotencyKey(key: string, endpoint: string, userId: string, requestPayload: any, expiryHours?: number): Promise<void>;
    markCompleted(key: string, endpoint: string, userId: string, response: any): Promise<void>;
    markFailed(key: string, endpoint: string, userId: string, error: any): Promise<void>;
    cleanupExpiredKeys(): Promise<number>;
    getStats(): Promise<any>;
}
