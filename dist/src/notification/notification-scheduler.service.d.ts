import { Repository } from 'typeorm';
import { Booking } from '../database/entities';
import { ScheduledNotification } from './entities/scheduled-notification.entity';
import { NotificationService } from './notification.service';
export declare class NotificationSchedulerService {
    private readonly bookingRepository;
    private readonly scheduledNotificationRepository;
    private readonly notificationService;
    private readonly logger;
    constructor(bookingRepository: Repository<Booking>, scheduledNotificationRepository: Repository<ScheduledNotification>, notificationService: NotificationService);
    scheduleRemindersForBooking(bookingId: string): Promise<void>;
    cancelRemindersForBooking(bookingId: string): Promise<void>;
    process24HourReminders(): Promise<void>;
    process2HourReminders(): Promise<void>;
    private processReminders;
    private sendReminder;
    private scheduleReminder;
    private getAppointmentDateTime;
    private formatDateTime;
    cleanupOldReminders(): Promise<void>;
}
