import { Injectable, Logger, NotFoundException, BadRequestException, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository, In } from 'typeorm';
import * as admin from 'firebase-admin';
import { DeviceToken, UserType } from './entities/device-token.entity';
import { NotificationLog, NotificationType, NotificationStatus } from './entities/notification-log.entity';
import { RegisterTokenDto } from './dto/register-token.dto';
import { SendNotificationDto, SendBulkNotificationDto } from './dto/send-notification.dto';
import { CustomerNotifications } from './templates/customer-notifications';
import { BusinessNotifications } from './templates/business-notifications';
import { initializeFirebase, getFirebaseMessaging } from '../config/firebase.config';

@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);
  private retryService: any; // Will be injected lazily to avoid circular dependency

  constructor(
    @InjectRepository(DeviceToken)
    private readonly deviceTokenRepository: Repository<DeviceToken>,
    @InjectRepository(NotificationLog)
    private readonly notificationLogRepository: Repository<NotificationLog>,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    try {
      initializeFirebase(this.configService);
    } catch (error) {
      this.logger.error('Failed to initialize Firebase', error);
    }
  }

  /**
   * Set retry service (called from module initialization to avoid circular dependency)
   */
  setRetryService(retryService: any) {
    this.retryService = retryService;
  }

  /**
   * Register a device token for push notifications
   * Uses upsert to handle duplicates atomically
   */
  async registerToken(userId: string, registerTokenDto: RegisterTokenDto): Promise<DeviceToken> {
    const { fcmToken, deviceType, userType, deviceInfo } = registerTokenDto;

    try {
      // Use upsert to handle insert or update atomically
      await this.deviceTokenRepository
        .createQueryBuilder()
        .insert()
        .into(DeviceToken)
        .values({
          userId,
          fcmToken,
          deviceType,
          userType,
          deviceInfo,
          isActive: true,
          lastUsedAt: new Date(),
        })
        .orUpdate(
          ['device_type', 'user_type', 'device_info', 'is_active', 'last_used_at', 'updated_at'],
          ['user_id', 'fcm_token'],
          {
            skipUpdateIfNoValuesChanged: false,
          }
        )
        .execute();

      // Fetch and return the token
      const token = await this.deviceTokenRepository.findOne({
        where: { userId, fcmToken },
      });

      if (!token) {
        throw new Error('Failed to register device token');
      }

      this.logger.log(`Device token registered/updated for user ${userId}`);
      return token;
    } catch (error) {
      this.logger.error(`Failed to register device token for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Unregister a device token
   */
  async unregisterToken(userId: string, fcmToken: string): Promise<void> {
    const token = await this.deviceTokenRepository.findOne({
      where: { userId, fcmToken },
    });

    if (token) {
      token.isActive = false;
      await this.deviceTokenRepository.save(token);
    }
  }

  /**
   * Deactivate all device tokens for a user (called on logout)
   */
  async deactivateAllUserTokens(userId: string): Promise<void> {
    await this.deviceTokenRepository.update(
      { userId, isActive: true },
      { isActive: false }
    );
    this.logger.log(`Deactivated all device tokens for user ${userId}`);
  }

  /**
   * Remove invalid token from database
   */
  private async removeInvalidToken(fcmToken: string): Promise<void> {
    await this.deviceTokenRepository.update({ fcmToken }, { isActive: false });
  }

  /**
   * Send notification to a customer using template
   */
  async sendToCustomer(userId: string, templateName: string, data: any): Promise<void> {
    const template = CustomerNotifications[templateName];
    if (!template) {
      throw new BadRequestException(`Customer notification template "${templateName}" not found`);
    }

    const notification = template(data);
    await this.sendToUser(userId, UserType.CUSTOMER, {
      notificationType: notification.type,
      title: notification.title,
      body: notification.body,
      data,
    });
  }

  /**
   * Send notification to a business owner using template
   */
  async sendToBusinessOwner(userId: string, templateName: string, data: any): Promise<void> {
    const template = BusinessNotifications[templateName];
    if (!template) {
      throw new BadRequestException(`Business notification template "${templateName}" not found`);
    }

    const notification = template(data);
    await this.sendToUser(userId, UserType.BUSINESS_OWNER, {
      notificationType: notification.type,
      title: notification.title,
      body: notification.body,
      data,
    });
  }

  /**
   * Convenience method: Notify business owner about wallet transaction
   */
  async notifyWalletTransaction(
    userId: string,
    transactionType: 'MONEY_RECEIVED' | 'PAYMENT_PENDING' | 'NEGATIVE_BALANCE' | 'WITHDRAWAL_COMPLETED',
    data: any,
  ): Promise<void> {
    const templateMap = {
      MONEY_RECEIVED: 'WALLET_MONEY_RECEIVED',
      PAYMENT_PENDING: 'WALLET_PAYMENT_PENDING',
      NEGATIVE_BALANCE: 'WALLET_NEGATIVE_BALANCE',
      WITHDRAWAL_COMPLETED: 'WALLET_WITHDRAWAL_COMPLETED',
    };

    const templateName = templateMap[transactionType];
    await this.sendToBusinessOwner(userId, templateName, data);
  }

  /**
   * Convenience method: Notify business owner about settlement update
   */
  async notifySettlementUpdate(
    userId: string,
    settlementType: 'CREDITED' | 'REQUIRES_PAYMENT',
    data: any,
  ): Promise<void> {
    const templateName = settlementType === 'CREDITED'
      ? 'WALLET_SETTLEMENT_CREDITED'
      : 'WALLET_SETTLEMENT_REQUIRES_PAYMENT';

    await this.sendToBusinessOwner(userId, templateName, data);
  }

  /**
   * Convenience method: Notify customer about wallet credit
   */
  async notifyCustomerWalletCredit(userId: string, data: any): Promise<void> {
    await this.sendToCustomer(userId, 'WALLET_CREDIT_RECEIVED', data);
  }

  /**
   * Send notification to a specific user
   */
  async sendToUser(
    userId: string,
    userType: UserType,
    notification: {
      notificationType: NotificationType;
      title: string;
      body: string;
      data?: Record<string, any>;
    },
  ): Promise<void> {
    // Get all active tokens for the user
    const tokens = await this.deviceTokenRepository.find({
      where: { userId, userType, isActive: true },
    });

    if (tokens.length === 0) {
      this.logger.warn(`No active tokens found for user ${userId} (${userType})`);

      // Log the notification attempt
      await this.notificationLogRepository.save({
        userId,
        userType,
        notificationType: notification.notificationType,
        title: notification.title,
        body: notification.body,
        data: notification.data,
        status: NotificationStatus.FAILED,
        fcmResponse: { error: 'No active tokens found' },
      });
      return;
    }

    const fcmTokens = tokens.map(t => t.fcmToken);
    await this.sendToTokens(userId, userType, fcmTokens, notification);
  }

  /**
   * Send notification to multiple users
   */
  async sendBulkNotification(bulkNotificationDto: SendBulkNotificationDto): Promise<{ successCount: number; failureCount: number }> {
    const { userIds, userType, notificationType, title, body, data } = bulkNotificationDto;

    const tokens = await this.deviceTokenRepository.find({
      where: { userId: In(userIds), userType, isActive: true },
    });

    if (tokens.length === 0) {
      this.logger.warn(`No active tokens found for bulk notification to ${userIds.length} users`);
      return { successCount: 0, failureCount: userIds.length };
    }

    const fcmTokens = tokens.map(t => t.fcmToken);
    const notification = { notificationType, title, body, data };

    // Send to all tokens
    const results = await this.sendMulticast(fcmTokens, notification);

    // Log for each user
    for (const userId of userIds) {
      await this.notificationLogRepository.save({
        userId,
        userType,
        notificationType,
        title,
        body,
        data,
        status: results.successCount > 0 ? NotificationStatus.SENT : NotificationStatus.FAILED,
        fcmTokens,
        fcmResponse: {
          successCount: results.successCount,
          failureCount: results.failureCount,
        },
        sentAt: new Date(),
      });
    }

    return results;
  }

  /**
   * Send notification to specific FCM tokens
   */
  private async sendToTokens(
    userId: string,
    userType: UserType,
    tokens: string[],
    notification: {
      notificationType: NotificationType;
      title: string;
      body: string;
      data?: Record<string, any>;
    },
  ): Promise<void> {
    if (tokens.length === 1) {
      // Single token - use send()
      await this.sendSingle(userId, userType, tokens[0], notification);
    } else {
      // Multiple tokens - use sendMulticast()
      await this.sendMulticast(tokens, notification);

      // Log the notification
      await this.notificationLogRepository.save({
        userId,
        userType,
        notificationType: notification.notificationType,
        title: notification.title,
        body: notification.body,
        data: notification.data,
        status: NotificationStatus.SENT,
        fcmTokens: tokens,
        sentAt: new Date(),
      });
    }
  }

  /**
   * Send to a single token
   */
  private async sendSingle(
    userId: string,
    userType: UserType,
    token: string,
    notification: {
      notificationType: NotificationType;
      title: string;
      body: string;
      data?: Record<string, any>;
    },
  ): Promise<void> {
    try {
      const messaging = getFirebaseMessaging();

      const convertedData = notification.data ? this.convertDataToStrings(notification.data) : {};

      const message: admin.messaging.Message = {
        token,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        // Only include data field if it has entries
        ...(Object.keys(convertedData).length > 0 ? { data: convertedData } : {}),
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

      const response = await messaging.send(message);

      this.logger.log(`Notification sent successfully to user ${userId}: ${response}`);

      // Log the notification
      await this.notificationLogRepository.save({
        userId,
        userType,
        notificationType: notification.notificationType,
        title: notification.title,
        body: notification.body,
        data: notification.data,
        status: NotificationStatus.SENT,
        fcmTokens: [token],
        fcmResponse: { messageId: response },
        sentAt: new Date(),
      });
    } catch (error) {
      this.logger.error(`Failed to send notification to user ${userId}:`, error);

      // Handle invalid token
      if (error.code === 'messaging/invalid-registration-token' || error.code === 'messaging/registration-token-not-registered') {
        await this.removeInvalidToken(token);
      }

      // Log the failed notification
      const failedLog = await this.notificationLogRepository.save({
        userId,
        userType,
        notificationType: notification.notificationType,
        title: notification.title,
        body: notification.body,
        data: notification.data,
        status: NotificationStatus.FAILED,
        fcmTokens: [token],
        fcmResponse: { error: error.message },
      });

      // Schedule retry if retry service is available
      if (this.retryService) {
        await this.retryService.scheduleRetry(failedLog, error);
      }

      throw error;
    }
  }

  /**
   * Send to multiple tokens using multicast
   */
  private async sendMulticast(
    tokens: string[],
    notification: {
      title: string;
      body: string;
      data?: Record<string, any>;
    },
  ): Promise<{ successCount: number; failureCount: number }> {
    try {
      const messaging = getFirebaseMessaging();

      const convertedData = notification.data ? this.convertDataToStrings(notification.data) : {};

      const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        // Only include data field if it has entries
        ...(Object.keys(convertedData).length > 0 ? { data: convertedData } : {}),
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

      this.logger.log(`Multicast notification: ${response.successCount} successful, ${response.failureCount} failed`);

      // Handle failed tokens
      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success && resp.error) {
            const error = resp.error;
            if (error.code === 'messaging/invalid-registration-token' || error.code === 'messaging/registration-token-not-registered') {
              this.removeInvalidToken(tokens[idx]);
            }
          }
        });
      }

      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      this.logger.error('Failed to send multicast notification:', error);
      throw error;
    }
  }

  /**
   * Get notification history for a user
   */
  async getNotificationHistory(userId: string, limit: number = 50): Promise<NotificationLog[]> {
    return this.notificationLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Convert data object to strings (FCM requirement)
   * FCM requires all data values to be strings, no nested objects, arrays, numbers, booleans, or null/undefined
   */
  private convertDataToStrings(data: Record<string, any>): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(data)) {
      // Skip null and undefined values entirely
      if (value === null || value === undefined) {
        continue;
      }
      // Convert to string
      if (typeof value === 'string') {
        result[key] = value;
      } else {
        // Stringify objects, arrays, numbers, booleans, etc.
        result[key] = JSON.stringify(value);
      }
    }
    return result;
  }
}
