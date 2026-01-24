export declare class IdempotencyKey {
    id: string;
    idempotencyKey: string;
    endpoint: string;
    userId: string;
    requestPayload: any;
    responsePayload?: any;
    status: 'processing' | 'completed' | 'failed';
    completedAt?: Date;
    expiresAt: Date;
    createdAt: Date;
}
