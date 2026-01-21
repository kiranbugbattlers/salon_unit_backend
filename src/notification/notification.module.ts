import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationSchedulerService } from './notification-scheduler.service';
import { NotificationRetryService } from './notification-retry.service';
import { DeviceToken } from './entities/device-token.entity';
import { NotificationLog } from './entities/notification-log.entity';
import { ScheduledNotification } from './entities/scheduled-notification.entity';
import { Booking } from '../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DeviceToken,
      NotificationLog,
      ScheduledNotification,
      Booking, // Needed for scheduler service
    ]),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationSchedulerService,
    NotificationRetryService,
  ],
  exports: [
    NotificationService,
    NotificationSchedulerService,
    NotificationRetryService,
  ],
})
export class NotificationModule {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly retryService: NotificationRetryService,
  ) {
    // Set retry service on notification service to avoid circular dependency
    this.notificationService.setRetryService(this.retryService);
  }
}
