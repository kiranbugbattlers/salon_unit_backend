"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationSchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../database/entities");
const scheduled_notification_entity_1 = require("./entities/scheduled-notification.entity");
const notification_log_entity_1 = require("./entities/notification-log.entity");
const notification_service_1 = require("./notification.service");
const device_token_entity_1 = require("./entities/device-token.entity");
let NotificationSchedulerService = NotificationSchedulerService_1 = class NotificationSchedulerService {
    constructor(bookingRepository, scheduledNotificationRepository, notificationService) {
        this.bookingRepository = bookingRepository;
        this.scheduledNotificationRepository = scheduledNotificationRepository;
        this.notificationService = notificationService;
        this.logger = new common_1.Logger(NotificationSchedulerService_1.name);
    }
    async scheduleRemindersForBooking(bookingId) {
        try {
            const booking = await this.bookingRepository.findOne({
                where: { id: bookingId },
                relations: ['customer', 'businessOwner', 'staff', 'customer.user', 'businessOwner.user'],
            });
            if (!booking) {
                this.logger.warn(`Booking ${bookingId} not found for scheduling reminders`);
                return;
            }
            if (booking.status !== entities_1.BookingStatus.CONFIRMED) {
                this.logger.debug(`Booking ${bookingId} is not confirmed, skipping reminder scheduling`);
                return;
            }
            const appointmentDateTime = this.getAppointmentDateTime(booking);
            if (!appointmentDateTime) {
                this.logger.warn(`Could not calculate appointment datetime for booking ${bookingId}`);
                return;
            }
            if (appointmentDateTime <= new Date()) {
                this.logger.debug(`Appointment for booking ${bookingId} is in the past, skipping reminders`);
                return;
            }
            const reminder24h = new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000);
            if (reminder24h > new Date()) {
                await this.scheduleReminder(booking, reminder24h, scheduled_notification_entity_1.ReminderType.REMINDER_24H);
            }
            const reminder2h = new Date(appointmentDateTime.getTime() - 2 * 60 * 60 * 1000);
            if (reminder2h > new Date()) {
                await this.scheduleReminder(booking, reminder2h, scheduled_notification_entity_1.ReminderType.REMINDER_2H);
            }
            this.logger.log(`Scheduled reminders for booking ${bookingId}`);
        }
        catch (error) {
            this.logger.error(`Failed to schedule reminders for booking ${bookingId}:`, error);
        }
    }
    async cancelRemindersForBooking(bookingId) {
        try {
            await this.scheduledNotificationRepository.update({
                bookingId,
                status: scheduled_notification_entity_1.ScheduledNotificationStatus.PENDING,
            }, {
                status: scheduled_notification_entity_1.ScheduledNotificationStatus.CANCELLED,
            });
            this.logger.log(`Cancelled pending reminders for booking ${bookingId}`);
        }
        catch (error) {
            this.logger.error(`Failed to cancel reminders for booking ${bookingId}:`, error);
        }
    }
    async process24HourReminders() {
        this.logger.debug('Processing 24-hour reminders...');
        await this.processReminders(scheduled_notification_entity_1.ReminderType.REMINDER_24H);
    }
    async process2HourReminders() {
        this.logger.debug('Processing 2-hour reminders...');
        await this.processReminders(scheduled_notification_entity_1.ReminderType.REMINDER_2H);
    }
    async processReminders(reminderType) {
        try {
            const dueReminders = await this.scheduledNotificationRepository.find({
                where: {
                    reminderType,
                    status: scheduled_notification_entity_1.ScheduledNotificationStatus.PENDING,
                    scheduledFor: (0, typeorm_2.LessThanOrEqual)(new Date()),
                },
                relations: ['booking', 'booking.customer', 'booking.businessOwner', 'booking.staff'],
                take: 100,
            });
            if (dueReminders.length === 0) {
                this.logger.debug(`No due ${reminderType} reminders found`);
                return;
            }
            this.logger.log(`Processing ${dueReminders.length} ${reminderType} reminders`);
            for (const reminder of dueReminders) {
                await this.sendReminder(reminder);
            }
        }
        catch (error) {
            this.logger.error(`Failed to process ${reminderType} reminders:`, error);
        }
    }
    async sendReminder(reminder) {
        try {
            const booking = reminder.booking;
            if (!booking || booking.status === entities_1.BookingStatus.CANCELLED || booking.status === entities_1.BookingStatus.COMPLETED) {
                reminder.status = scheduled_notification_entity_1.ScheduledNotificationStatus.CANCELLED;
                reminder.errorMessage = 'Booking no longer valid';
                await this.scheduledNotificationRepository.save(reminder);
                return;
            }
            const appointmentDateTime = this.getAppointmentDateTime(booking);
            const hoursUntil = reminder.reminderType === scheduled_notification_entity_1.ReminderType.REMINDER_24H ? 24 : 2;
            const dateTime = this.formatDateTime(appointmentDateTime);
            if (reminder.userType === device_token_entity_1.UserType.CUSTOMER && booking.customer) {
                await this.notificationService.sendToCustomer(booking.customer.userId, 'SERVICE_REMINDER', {
                    bookingId: booking.id,
                    dateTime,
                    salonName: booking.businessOwner?.businessName || 'the salon',
                    hoursUntil: String(hoursUntil),
                });
            }
            if (reminder.userType === device_token_entity_1.UserType.BUSINESS_OWNER && booking.businessOwner) {
                await this.notificationService.sendToBusinessOwner(booking.businessOwner.userId, 'SERVICE_REMINDER', {
                    bookingId: booking.id,
                    customerName: `${booking.customer?.firstName || ''} ${booking.customer?.lastName || ''}`.trim(),
                    dateTime,
                    hoursUntil: String(hoursUntil),
                });
            }
            reminder.status = scheduled_notification_entity_1.ScheduledNotificationStatus.SENT;
            reminder.sentAt = new Date();
            reminder.attempts += 1;
            await this.scheduledNotificationRepository.save(reminder);
            this.logger.log(`Sent ${reminder.reminderType} reminder for booking ${booking.id} to ${reminder.userType}`);
        }
        catch (error) {
            this.logger.error(`Failed to send reminder ${reminder.id} for booking ${reminder.bookingId}:`, error);
            reminder.attempts += 1;
            reminder.errorMessage = error.message;
            if (reminder.attempts >= 3) {
                reminder.status = scheduled_notification_entity_1.ScheduledNotificationStatus.FAILED;
            }
            await this.scheduledNotificationRepository.save(reminder);
        }
    }
    async scheduleReminder(booking, scheduledFor, reminderType) {
        const existing = await this.scheduledNotificationRepository.findOne({
            where: {
                bookingId: booking.id,
                userId: booking.customer.userId,
                reminderType,
            },
        });
        if (existing) {
            this.logger.debug(`Reminder ${reminderType} already exists for booking ${booking.id}, skipping`);
            return;
        }
        const customerReminder = this.scheduledNotificationRepository.create({
            bookingId: booking.id,
            userId: booking.customer.userId,
            userType: device_token_entity_1.UserType.CUSTOMER,
            notificationType: notification_log_entity_1.NotificationType.SERVICE_REMINDER,
            reminderType,
            scheduledFor,
            status: scheduled_notification_entity_1.ScheduledNotificationStatus.PENDING,
            notificationData: {
                dateTime: this.formatDateTime(this.getAppointmentDateTime(booking)),
                salonName: booking.businessOwner?.businessName,
                hoursUntil: reminderType === scheduled_notification_entity_1.ReminderType.REMINDER_24H ? 24 : 2,
            },
        });
        await this.scheduledNotificationRepository.save(customerReminder);
        const businessReminder = this.scheduledNotificationRepository.create({
            bookingId: booking.id,
            userId: booking.businessOwner.userId,
            userType: device_token_entity_1.UserType.BUSINESS_OWNER,
            notificationType: notification_log_entity_1.NotificationType.SERVICE_REMINDER,
            reminderType,
            scheduledFor,
            status: scheduled_notification_entity_1.ScheduledNotificationStatus.PENDING,
            notificationData: {
                customerName: `${booking.customer.firstName} ${booking.customer.lastName}`,
                dateTime: this.formatDateTime(this.getAppointmentDateTime(booking)),
                hoursUntil: reminderType === scheduled_notification_entity_1.ReminderType.REMINDER_24H ? 24 : 2,
            },
        });
        await this.scheduledNotificationRepository.save(businessReminder);
    }
    getAppointmentDateTime(booking) {
        try {
            const dateStr = booking.appointmentDate instanceof Date
                ? booking.appointmentDate.toISOString().split('T')[0]
                : booking.appointmentDate;
            const timeStr = booking.startTime;
            return new Date(`${dateStr}T${timeStr}`);
        }
        catch (error) {
            this.logger.error(`Failed to parse appointment datetime for booking ${booking.id}:`, error);
            return null;
        }
    }
    formatDateTime(date) {
        if (!date)
            return 'your scheduled time';
        return date.toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    }
    async cleanupOldReminders() {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const result = await this.scheduledNotificationRepository
                .createQueryBuilder()
                .delete()
                .where('status IN (:...statuses)', {
                statuses: [scheduled_notification_entity_1.ScheduledNotificationStatus.SENT, scheduled_notification_entity_1.ScheduledNotificationStatus.CANCELLED],
            })
                .andWhere('created_at < :thirtyDaysAgo', { thirtyDaysAgo })
                .execute();
            this.logger.log(`Cleaned up ${result.affected} old reminder records`);
        }
        catch (error) {
            this.logger.error('Failed to clean up old reminders:', error);
        }
    }
};
exports.NotificationSchedulerService = NotificationSchedulerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_3AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationSchedulerService.prototype, "cleanupOldReminders", null);
exports.NotificationSchedulerService = NotificationSchedulerService = NotificationSchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Booking)),
    __param(1, (0, typeorm_1.InjectRepository)(scheduled_notification_entity_1.ScheduledNotification)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        notification_service_1.NotificationService])
], NotificationSchedulerService);
//# sourceMappingURL=notification-scheduler.service.js.map