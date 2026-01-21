import { NotificationService } from './notification.service';
import { RegisterTokenDto } from './dto/register-token.dto';
import { SendNotificationDto, SendBulkNotificationDto } from './dto/send-notification.dto';
import { NotificationResponseDto, TokenResponseDto } from './dto/notification-response.dto';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    registerToken(req: any, registerTokenDto: RegisterTokenDto): Promise<TokenResponseDto>;
    unregisterToken(req: any, fcmToken: string): Promise<TokenResponseDto>;
    sendNotification(sendNotificationDto: SendNotificationDto): Promise<NotificationResponseDto>;
    sendBulkNotification(sendBulkNotificationDto: SendBulkNotificationDto): Promise<NotificationResponseDto>;
    getNotificationHistory(req: any, limit?: string): Promise<{
        success: boolean;
        count: number;
        notifications: import("./entities/notification-log.entity").NotificationLog[];
    }>;
}
