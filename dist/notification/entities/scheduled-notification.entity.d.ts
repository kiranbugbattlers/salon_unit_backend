import { User } from '../../database/entities/user.entity';
import { Booking } from '../../database/entities/booking.entity';
import { UserType } from './device-token.entity';
import { NotificationType } from './notification-log.entity';
export declare enum ScheduledNotificationStatus {
    PENDING = "pending",
    SENT = "sent",
    CANCELLED = "cancelled",
    FAILED = "failed"
}
export declare enum ReminderType {
    REMINDER_24H = "24h",
    REMINDER_2H = "2h"
}
export declare class ScheduledNotification {
    id: string;
    bookingId: string;
    booking: Booking;
    userId: string;
    user: User;
    userType: UserType;
    notificationType: NotificationType;
    reminderType: ReminderType;
    scheduledFor: Date;
    status: ScheduledNotificationStatus;
    sentAt: Date;
    attempts: number;
    notificationData: Record<string, any>;
    errorMessage: string;
    createdAt: Date;
    updatedAt: Date;
}
