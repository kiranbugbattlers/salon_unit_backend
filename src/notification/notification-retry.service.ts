import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import * as admin from 'firebase-admin';
import { NotificationLog, NotificationStatus, NotificationType } from './entities/notification-log.entity';
import { DeviceToken, UserType } from './entities/device-token.entity';
import { getFirebaseMessaging } from '../config/firebase.config';

@Injectable()
export class NotificationRetryService {
  private readonly logger = new Logger(NotificationRetryService.name);

  // Retry delays in minutes: 1min, 5min, 15min, 1hour, 6hours
  private readonly RETRY_DELAYS = [1, 5, 15, 60, 360];

  constructor(
    @InjectRepository(NotificationLog)
    private readonly notificationLogRepository: Repository<NotificationLog>,
    @InjectRepository(DeviceToken)
    private readonly deviceTokenRepository: Repository<DeviceToken>,
  ) {}

  /**
   * Schedule a notification for retry with exponential backoff
   */
  async scheduleRetry(notificationLog: NotificationLog, error: Error): Promise<void> {
    try {
      // Check if we should retry based on error type
      if (!this.shouldRetryError(error)) {
        this.logger.log(
          `Permanent error for notification ${notificationLog.id}, not scheduling retry: ${error.message}`,
        );
        notificationLog.status = NotificationStatus.FAILED;
        notificationLog.retryError = `Permanent error: ${error.message}`;
        await this.notificationLogRepository.save(notificationLog);
        return;
      }

      // Check if max retries reached
      if (notificationLog.retryCount >= notificationLog.maxRetries) {
        this.logger.warn(
          `Max retries (${notificationLog.maxRetries}) reached for notification ${notificationLog.id}`,
        );
        notificationLog.status = NotificationStatus.FAILED;
        notificationLog.retryError = 'Max retries exceeded';
        await this.notificationLogRepository.save(notificationLog);
        return;
      }

      // Calculate next retry time with exponential backoff
      const delayMinutes = this.RETRY_DELAYS[notificationLog.retryCount] || this.RETRY_DELAYS[this.RETRY_DELAYS.length - 1];
      const nextRetryAt = new Date(Date.now() + delayMinutes * 60 * 1000);

      // Update notification log
      notificationLog.status = NotificationStatus.FAILED;
      notificationLog.nextRetryAt = nextRetryAt;
      notificationLog.retryError = error.message;

      await this.notificationLogRepository.save(notificationLog);

      this.logger.log(
        `Scheduled retry ${notificationLog.retryCount + 1}/${notificationLog.maxRetries} for notification ${notificationLog.id} at ${nextRetryAt.toISOString()}`,
      );
    } catch (err) {
      this.logger.error(`Failed to schedule retry for notification ${notificationLog.id}:`, err);
    }
  }

  /**
   * Cron job: Process retry queue every minute
   * COMMENTED OUT to reduce terminal noise
   */
  // @Cron(CronExpression.EVERY_MINUTE)
  async processRetryQueue(): Promise<void> {
    try {
      // Find failed notifications that are ready for retry
      const failedNotifications = await this.notificationLogRepository.find({
        where: {
          status: NotificationStatus.FAILED,
          nextRetryAt: LessThanOrEqual(new Date()),
        },
        take: 50, // Process in batches
      });

      if (failedNotifications.length === 0) {
        return;
      }

      this.logger.log(`Processing ${failedNotifications.length} failed notifications for retry`);

      for (const notification of failedNotifications) {
        await this.retryNotification(notification);
      }
    } catch (error) {
      this.logger.error('Failed to process retry queue:', error);
    }
  }

  /**
   * Retry sending a failed notification
   */
  private async retryNotification(notification: NotificationLog): Promise<void> {
    try {
      this.logger.debug(`Retrying notification ${notification.id} (attempt ${notification.retryCount + 1})`);

      // Get active tokens for the user
      const tokens = await this.deviceTokenRepository.find({
        where: {
          userId: notification.userId,
          userType: notification.userType,
          isActive: true,
        },
      });

      if (tokens.length === 0) {
        this.logger.warn(
          `No active tokens found for user ${notification.userId}, marking notification as failed`,
        );
        notification.status = NotificationStatus.FAILED;
        notification.retryError = 'No active tokens found';
        notification.nextRetryAt = null;
        await this.notificationLogRepository.save(notification);
        return;
      }

      const fcmTokens = tokens.map(t => t.fcmToken);

      // Attempt to send
      const result = await this.sendNotificationRetry(notification, fcmTokens);

      if (result.success) {
        // Success - mark as sent
        notification.status = NotificationStatus.SENT;
        notification.sentAt = new Date();
        notification.nextRetryAt = null;
        notification.lastRetryAt = new Date();
        notification.retryError = null;
        await this.notificationLogRepository.save(notification);

        this.logger.log(`Successfully retried notification ${notification.id}`);
      } else {
        // Failed - schedule next retry
        notification.retryCount += 1;
        notification.lastRetryAt = new Date();
        await this.notificationLogRepository.save(notification);
        await this.scheduleRetry(notification, result.error);
      }
    } catch (error) {
      this.logger.error(`Error retrying notification ${notification.id}:`, error);

      // Update retry count and schedule next attempt
      notification.retryCount += 1;
      notification.lastRetryAt = new Date();
      await this.notificationLogRepository.save(notification);
      await this.scheduleRetry(notification, error);
    }
  }

  /**
   * Attempt to send notification
   */
  private async sendNotificationRetry(
    notification: NotificationLog,
    tokens: string[],
  ): Promise<{ success: boolean; error?: Error }> {
    try {
      const messaging = getFirebaseMessaging();

      if (tokens.length === 1) {
        // Single token
        const message: admin.messaging.Message = {
          token: tokens[0],
          notification: {
            title: notification.title,
            body: notification.body,
          },
          data: notification.data ? this.convertDataToStrings(notification.data) : {},
          android: {
            priority: 'high',
            notification: {
              sound: 'default',
              channelId: 'default',
            },
          },
          apns: {
            payload: {
              aps: {
                sound: 'default',
                badge: 1,
              },
            },
          },
        };

        await messaging.send(message);
      } else {
        // Multiple tokens - multicast
        const message: admin.messaging.MulticastMessage = {
          tokens,
          notification: {
            title: notification.title,
            body: notification.body,
          },
          data: notification.data ? this.convertDataToStrings(notification.data) : {},
          android: {
            priority: 'high',
            notification: {
              sound: 'default',
              channelId: 'default',
            },
          },
          apns: {
            payload: {
              aps: {
                sound: 'default',
                badge: 1,
              },
            },
          },
        };

        const response = await messaging.sendEachForMulticast(message);

        // Handle partial failures
        if (response.failureCount > 0) {
          response.responses.forEach((resp, idx) => {
            if (!resp.success && resp.error) {
              const error = resp.error;
              if (
                error.code === 'messaging/invalid-registration-token' ||
                error.code === 'messaging/registration-token-not-registered'
              ) {
                this.removeInvalidToken(tokens[idx]);
              }
            }
          });

          // If all failed, throw error
          if (response.successCount === 0) {
            throw new Error('All tokens failed');
          }
        }
      }

      return { success: true };
    } catch (error) {
      // Handle invalid token errors
      if (
        error.code === 'messaging/invalid-registration-token' ||
        error.code === 'messaging/registration-token-not-registered'
      ) {
        await this.removeInvalidToken(tokens[0]);
      }

      return { success: false, error };
    }
  }

  /**
   * Determine if an error should trigger a retry
   */
  private shouldRetryError(error: any): boolean {
    // Permanent errors that should not be retried
    const permanentErrorCodes = [
      'messaging/invalid-registration-token',
      'messaging/registration-token-not-registered',
      'messaging/invalid-argument',
      'messaging/invalid-recipient',
    ];

    if (error.code && permanentErrorCodes.includes(error.code)) {
      return false;
    }

    // Temporary errors that should be retried
    const retryableErrorCodes = [
      'messaging/server-unavailable',
      'messaging/internal-error',
      'messaging/timeout',
      'messaging/quota-exceeded',
      'messaging/third-party-auth-error',
    ];

    if (error.code && retryableErrorCodes.includes(error.code)) {
      return true;
    }

    // Network errors should be retried
    if (error.message && (error.message.includes('ETIMEDOUT') || error.message.includes('ECONNRESET'))) {
      return true;
    }

    // Default to retry for unknown errors
    return true;
  }

  /**
   * Remove invalid token from database
   */
  private async removeInvalidToken(fcmToken: string): Promise<void> {
    try {
      await this.deviceTokenRepository.update({ fcmToken }, { isActive: false });
      this.logger.debug(`Deactivated invalid token: ${fcmToken}`);
    } catch (error) {
      this.logger.error(`Failed to deactivate invalid token ${fcmToken}:`, error);
    }
  }

  /**
   * Convert data object to strings (FCM requirement)
   */
  private convertDataToStrings(data: Record<string, any>): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = typeof value === 'string' ? value : JSON.stringify(value);
    }
    return result;
  }

  /**
   * Get retry statistics for monitoring
   */
  async getRetryStatistics(): Promise<{
    pendingRetries: number;
    failedPermanent: number;
    avgRetryCount: number;
  }> {
    try {
      const pendingRetries = await this.notificationLogRepository.count({
        where: {
          status: NotificationStatus.FAILED,
          nextRetryAt: LessThanOrEqual(new Date()),
        },
      });

      const failedPermanent = await this.notificationLogRepository.count({
        where: {
          status: NotificationStatus.FAILED,
          nextRetryAt: null,
        },
      });

      const avgResult = await this.notificationLogRepository
        .createQueryBuilder('log')
        .select('AVG(log.retry_count)', 'avg')
        .where('log.retry_count > 0')
        .getRawOne();

      return {
        pendingRetries,
        failedPermanent,
        avgRetryCount: parseFloat(avgResult?.avg || '0'),
      };
    } catch (error) {
      this.logger.error('Failed to get retry statistics:', error);
      return {
        pendingRetries: 0,
        failedPermanent: 0,
        avgRetryCount: 0,
      };
    }
  }
}
