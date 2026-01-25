import { NotificationType } from '../entities/notification-log.entity';
import { UserType } from '../entities/device-token.entity';
export declare class SendNotificationDto {
    userId: string;
    userType: UserType;
    notificationType: NotificationType;
    title: string;
    body: string;
    data?: Record<string, any>;
}
export declare class SendBulkNotificationDto {
    userIds: string[];
    userType: UserType;
    notificationType: NotificationType;
    title: string;
    body: string;
    data?: Record<string, any>;
}
