import { NotificationType } from '../entities/notification-log.entity';
export interface NotificationTemplate {
    type: NotificationType;
    title: string;
    body: string;
}
export declare const CustomerNotifications: Record<string, (data: any) => NotificationTemplate>;
