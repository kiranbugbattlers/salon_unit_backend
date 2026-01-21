import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThan, In } from 'typeorm';
import { Booking, BookingStatus } from '../database/entities';
import { ScheduledNotification, ScheduledNotificationStatus, ReminderType } from './entities/scheduled-notification.entity';
import { NotificationType } from './entities/notification-log.entity';
import { NotificationService } from './notification.service';
import { UserType } from './entities/device-token.entity';

@Injectable()
export class NotificationSchedulerService {
  private readonly logger = new Logger(NotificationSchedulerService.name);

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(ScheduledNotification)
    private readonly scheduledNotificationRepository: Repository<ScheduledNotification>,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Schedule reminders for newly confirmed bookings
   * Called when a booking is approved or created
   */
  async scheduleRemindersForBooking(bookingId: string): Promise<void> {
    try {
      const booking = await this.bookingRepository.findOne({
        where: { id: bookingId },
        relations: ['customer', 'businessOwner', 'staff', 'customer.user', 'businessOwner.user'],
      });

      if (!booking) {
        this.logger.warn(`Booking ${bookingId} not found for scheduling reminders`);
        return;
      }

      // Only schedule for confirmed bookings
      if (booking.status !== BookingStatus.CONFIRMED) {
        this.logger.debug(`Booking ${bookingId} is not confirmed, skipping reminder scheduling`);
        return;
      }

      // Calculate appointment datetime
      const appointmentDateTime = this.getAppointmentDateTime(booking);
      if (!appointmentDateTime) {
        this.logger.warn(`Could not calculate appointment datetime for booking ${bookingId}`);
        return;
      }

      // Check if appointment is in the future
      if (appointmentDateTime <= new Date()) {
        this.logger.debug(`Appointment for booking ${bookingId} is in the past, skipping reminders`);
        return;
      }

      // Schedule 24-hour reminder
      const reminder24h = new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000);
      if (reminder24h > new Date()) {
        await this.scheduleReminder(booking, reminder24h, ReminderType.REMINDER_24H);
      }

      // Schedule 2-hour reminder
      const reminder2h = new Date(appointmentDateTime.getTime() - 2 * 60 * 60 * 1000);
      if (reminder2h > new Date()) {
        await this.scheduleReminder(booking, reminder2h, ReminderType.REMINDER_2H);
      }

      this.logger.log(`Scheduled reminders for booking ${bookingId}`);
    } catch (error) {
      this.logger.error(`Failed to schedule reminders for booking ${bookingId}:`, error);
    }
  }

  /**
   * Cancel all pending reminders for a booking (when cancelled/rescheduled)
   */
  async cancelRemindersForBooking(bookingId: string): Promise<void> {
    try {
      await this.scheduledNotificationRepository.update(
        {
          bookingId,
          status: ScheduledNotificationStatus.PENDING,
        },
        {
          status: ScheduledNotificationStatus.CANCELLED,
        },
      );

      this.logger.log(`Cancelled pending reminders for booking ${bookingId}`);
    } catch (error) {
      this.logger.error(`Failed to cancel reminders for booking ${bookingId}:`, error);
    }
  }

  /**
   * Cron job: Process 24-hour reminders (runs every hour)
   */
  @Cron(CronExpression.EVERY_HOUR)
  async process24HourReminders(): Promise<void> {
    this.logger.debug('Processing 24-hour reminders...');
    await this.processReminders(ReminderType.REMINDER_24H);
  }

  /**
   * Cron job: Process 2-hour reminders (runs every 15 minutes)
   */
  @Cron(CronExpression.EVERY_30_MINUTES)
  async process2HourReminders(): Promise<void> {
    this.logger.debug('Processing 2-hour reminders...');
    await this.processReminders(ReminderType.REMINDER_2H);
  }

  /**
   * Process pending reminders of a specific type
   */
  private async processReminders(reminderType: ReminderType): Promise<void> {
    try {
      // Find all pending reminders that are due
      const dueReminders = await this.scheduledNotificationRepository.find({
        where: {
          reminderType,
          status: ScheduledNotificationStatus.PENDING,
          scheduledFor: LessThanOrEqual(new Date()),
        },
        relations: ['booking', 'booking.customer', 'booking.businessOwner', 'booking.staff'],
        take: 100, // Process in batches
      });

      if (dueReminders.length === 0) {
        this.logger.debug(`No due ${reminderType} reminders found`);
        return;
      }

      this.logger.log(`Processing ${dueReminders.length} ${reminderType} reminders`);

      for (const reminder of dueReminders) {
        await this.sendReminder(reminder);
      }
    } catch (error) {
      this.logger.error(`Failed to process ${reminderType} reminders:`, error);
    }
  }

  /**
   * Send a scheduled reminder notification
   */
  private async sendReminder(reminder: ScheduledNotification): Promise<void> {
    try {
      const booking = reminder.booking;

      // Check if booking is still valid
      if (!booking || booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.COMPLETED) {
        reminder.status = ScheduledNotificationStatus.CANCELLED;
        reminder.errorMessage = 'Booking no longer valid';
        await this.scheduledNotificationRepository.save(reminder);
        return;
      }

      // Prepare notification data
      const appointmentDateTime = this.getAppointmentDateTime(booking);
      const hoursUntil = reminder.reminderType === ReminderType.REMINDER_24H ? 24 : 2;
      const dateTime = this.formatDateTime(appointmentDateTime);

      // Send to customer
      if (reminder.userType === UserType.CUSTOMER && booking.customer) {
        await this.notificationService.sendToCustomer(booking.customer.userId, 'SERVICE_REMINDER', {
          bookingId: booking.id,
          dateTime,
          salonName: booking.businessOwner?.businessName || 'the salon',
          hoursUntil: String(hoursUntil),
        });
      }

      // Send to business owner
      if (reminder.userType === UserType.BUSINESS_OWNER && booking.businessOwner) {
        await this.notificationService.sendToBusinessOwner(booking.businessOwner.userId, 'SERVICE_REMINDER', {
          bookingId: booking.id,
          customerName: `${booking.customer?.firstName || ''} ${booking.customer?.lastName || ''}`.trim(),
          dateTime,
          hoursUntil: String(hoursUntil),
        });
      }

      // Mark as sent
      reminder.status = ScheduledNotificationStatus.SENT;
      reminder.sentAt = new Date();
      reminder.attempts += 1;
      await this.scheduledNotificationRepository.save(reminder);

      this.logger.log(
        `Sent ${reminder.reminderType} reminder for booking ${booking.id} to ${reminder.userType}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send reminder ${reminder.id} for booking ${reminder.bookingId}:`,
        error,
      );

      // Update reminder with error
      reminder.attempts += 1;
      reminder.errorMessage = error.message;

      // Mark as failed if max attempts reached
      if (reminder.attempts >= 3) {
        reminder.status = ScheduledNotificationStatus.FAILED;
      }

      await this.scheduledNotificationRepository.save(reminder);
    }
  }

  /**
   * Schedule a reminder for a specific time
   */
  private async scheduleReminder(
    booking: Booking,
    scheduledFor: Date,
    reminderType: ReminderType,
  ): Promise<void> {
    // Check if reminder already exists
    const existing = await this.scheduledNotificationRepository.findOne({
      where: {
        bookingId: booking.id,
        userId: booking.customer.userId,
        reminderType,
      },
    });

    if (existing) {
      this.logger.debug(
        `Reminder ${reminderType} already exists for booking ${booking.id}, skipping`,
      );
      return;
    }

    // Create reminder for customer
    const customerReminder = this.scheduledNotificationRepository.create({
      bookingId: booking.id,
      userId: booking.customer.userId,
      userType: UserType.CUSTOMER,
      notificationType: NotificationType.SERVICE_REMINDER,
      reminderType,
      scheduledFor,
      status: ScheduledNotificationStatus.PENDING,
      notificationData: {
        dateTime: this.formatDateTime(this.getAppointmentDateTime(booking)),
        salonName: booking.businessOwner?.businessName,
        hoursUntil: reminderType === ReminderType.REMINDER_24H ? 24 : 2,
      },
    });

    await this.scheduledNotificationRepository.save(customerReminder);

    // Create reminder for business owner
    const businessReminder = this.scheduledNotificationRepository.create({
      bookingId: booking.id,
      userId: booking.businessOwner.userId,
      userType: UserType.BUSINESS_OWNER,
      notificationType: NotificationType.SERVICE_REMINDER,
      reminderType,
      scheduledFor,
      status: ScheduledNotificationStatus.PENDING,
      notificationData: {
        customerName: `${booking.customer.firstName} ${booking.customer.lastName}`,
        dateTime: this.formatDateTime(this.getAppointmentDateTime(booking)),
        hoursUntil: reminderType === ReminderType.REMINDER_24H ? 24 : 2,
      },
    });

    await this.scheduledNotificationRepository.save(businessReminder);
  }

  /**
   * Get appointment datetime from booking
   */
  private getAppointmentDateTime(booking: Booking): Date | null {
    try {
      const dateStr =
        booking.appointmentDate instanceof Date
          ? booking.appointmentDate.toISOString().split('T')[0]
          : booking.appointmentDate;
      const timeStr = booking.startTime;

      return new Date(`${dateStr}T${timeStr}`);
    } catch (error) {
      this.logger.error(`Failed to parse appointment datetime for booking ${booking.id}:`, error);
      return null;
    }
  }

  /**
   * Format datetime for display
   */
  private formatDateTime(date: Date | null): string {
    if (!date) return 'your scheduled time';

    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  /**
   * Clean up old completed/cancelled reminders (runs daily)
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupOldReminders(): Promise<void> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await this.scheduledNotificationRepository
        .createQueryBuilder()
        .delete()
        .where('status IN (:...statuses)', {
          statuses: [ScheduledNotificationStatus.SENT, ScheduledNotificationStatus.CANCELLED],
        })
        .andWhere('created_at < :thirtyDaysAgo', { thirtyDaysAgo })
        .execute();

      this.logger.log(`Cleaned up ${result.affected} old reminder records`);
    } catch (error) {
      this.logger.error('Failed to clean up old reminders:', error);
    }
  }
}
