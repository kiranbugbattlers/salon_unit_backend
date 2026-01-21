import { Repository } from 'typeorm';
import { NotificationLog } from './entities/notification-log.entity';
import { DeviceToken } from './entities/device-token.entity';
export declare class NotificationRetryService {
    private readonly notificationLogRepository;
    private readonly deviceTokenRepository;
    private readonly logger;
    private readonly RETRY_DELAYS;
    constructor(notificationLogRepository: Repository<NotificationLog>, deviceTokenRepository: Repository<DeviceToken>);
    scheduleRetry(notificationLog: NotificationLog, error: Error): Promise<void>;
    processRetryQueue(): Promise<void>;
    private retryNotification;
    private sendNotificationRetry;
    private shouldRetryError;
    private removeInvalidToken;
    private convertDataToStrings;
    getRetryStatistics(): Promise<{
        pendingRetries: number;
        failedPermanent: number;
        avgRetryCount: number;
    }>;
}
