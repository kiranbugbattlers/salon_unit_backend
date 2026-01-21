import { NotificationService } from './notification.service';
import { NotificationRetryService } from './notification-retry.service';
export declare class NotificationModule {
    private readonly notificationService;
    private readonly retryService;
    constructor(notificationService: NotificationService, retryService: NotificationRetryService);
}
