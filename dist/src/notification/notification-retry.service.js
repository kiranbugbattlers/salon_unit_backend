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
var NotificationRetryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRetryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_log_entity_1 = require("./entities/notification-log.entity");
const device_token_entity_1 = require("./entities/device-token.entity");
const firebase_config_1 = require("../config/firebase.config");
let NotificationRetryService = NotificationRetryService_1 = class NotificationRetryService {
    constructor(notificationLogRepository, deviceTokenRepository) {
        this.notificationLogRepository = notificationLogRepository;
        this.deviceTokenRepository = deviceTokenRepository;
        this.logger = new common_1.Logger(NotificationRetryService_1.name);
        this.RETRY_DELAYS = [1, 5, 15, 60, 360];
    }
    async scheduleRetry(notificationLog, error) {
        try {
            if (!this.shouldRetryError(error)) {
                this.logger.log(`Permanent error for notification ${notificationLog.id}, not scheduling retry: ${error.message}`);
                notificationLog.status = notification_log_entity_1.NotificationStatus.FAILED;
                notificationLog.retryError = `Permanent error: ${error.message}`;
                await this.notificationLogRepository.save(notificationLog);
                return;
            }
            if (notificationLog.retryCount >= notificationLog.maxRetries) {
                this.logger.warn(`Max retries (${notificationLog.maxRetries}) reached for notification ${notificationLog.id}`);
                notificationLog.status = notification_log_entity_1.NotificationStatus.FAILED;
                notificationLog.retryError = 'Max retries exceeded';
                await this.notificationLogRepository.save(notificationLog);
                return;
            }
            const delayMinutes = this.RETRY_DELAYS[notificationLog.retryCount] || this.RETRY_DELAYS[this.RETRY_DELAYS.length - 1];
            const nextRetryAt = new Date(Date.now() + delayMinutes * 60 * 1000);
            notificationLog.status = notification_log_entity_1.NotificationStatus.FAILED;
            notificationLog.nextRetryAt = nextRetryAt;
            notificationLog.retryError = error.message;
            await this.notificationLogRepository.save(notificationLog);
            this.logger.log(`Scheduled retry ${notificationLog.retryCount + 1}/${notificationLog.maxRetries} for notification ${notificationLog.id} at ${nextRetryAt.toISOString()}`);
        }
        catch (err) {
            this.logger.error(`Failed to schedule retry for notification ${notificationLog.id}:`, err);
        }
    }
    async processRetryQueue() {
        try {
            const failedNotifications = await this.notificationLogRepository.find({
                where: {
                    status: notification_log_entity_1.NotificationStatus.FAILED,
                    nextRetryAt: (0, typeorm_2.LessThanOrEqual)(new Date()),
                },
                take: 50,
            });
            if (failedNotifications.length === 0) {
                return;
            }
            this.logger.log(`Processing ${failedNotifications.length} failed notifications for retry`);
            for (const notification of failedNotifications) {
                await this.retryNotification(notification);
            }
        }
        catch (error) {
            this.logger.error('Failed to process retry queue:', error);
        }
    }
    async retryNotification(notification) {
        try {
            this.logger.debug(`Retrying notification ${notification.id} (attempt ${notification.retryCount + 1})`);
            const tokens = await this.deviceTokenRepository.find({
                where: {
                    userId: notification.userId,
                    userType: notification.userType,
                    isActive: true,
                },
            });
            if (tokens.length === 0) {
                this.logger.warn(`No active tokens found for user ${notification.userId}, marking notification as failed`);
                notification.status = notification_log_entity_1.NotificationStatus.FAILED;
                notification.retryError = 'No active tokens found';
                notification.nextRetryAt = null;
                await this.notificationLogRepository.save(notification);
                return;
            }
            const fcmTokens = tokens.map(t => t.fcmToken);
            const result = await this.sendNotificationRetry(notification, fcmTokens);
            if (result.success) {
                notification.status = notification_log_entity_1.NotificationStatus.SENT;
                notification.sentAt = new Date();
                notification.nextRetryAt = null;
                notification.lastRetryAt = new Date();
                notification.retryError = null;
                await this.notificationLogRepository.save(notification);
                this.logger.log(`Successfully retried notification ${notification.id}`);
            }
            else {
                notification.retryCount += 1;
                notification.lastRetryAt = new Date();
                await this.notificationLogRepository.save(notification);
                await this.scheduleRetry(notification, result.error);
            }
        }
        catch (error) {
            this.logger.error(`Error retrying notification ${notification.id}:`, error);
            notification.retryCount += 1;
            notification.lastRetryAt = new Date();
            await this.notificationLogRepository.save(notification);
            await this.scheduleRetry(notification, error);
        }
    }
    async sendNotificationRetry(notification, tokens) {
        try {
            const messaging = (0, firebase_config_1.getFirebaseMessaging)();
            if (tokens.length === 1) {
                const message = {
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
            }
            else {
                const message = {
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
                if (response.failureCount > 0) {
                    response.responses.forEach((resp, idx) => {
                        if (!resp.success && resp.error) {
                            const error = resp.error;
                            if (error.code === 'messaging/invalid-registration-token' ||
                                error.code === 'messaging/registration-token-not-registered') {
                                this.removeInvalidToken(tokens[idx]);
                            }
                        }
                    });
                    if (response.successCount === 0) {
                        throw new Error('All tokens failed');
                    }
                }
            }
            return { success: true };
        }
        catch (error) {
            if (error.code === 'messaging/invalid-registration-token' ||
                error.code === 'messaging/registration-token-not-registered') {
                await this.removeInvalidToken(tokens[0]);
            }
            return { success: false, error };
        }
    }
    shouldRetryError(error) {
        const permanentErrorCodes = [
            'messaging/invalid-registration-token',
            'messaging/registration-token-not-registered',
            'messaging/invalid-argument',
            'messaging/invalid-recipient',
        ];
        if (error.code && permanentErrorCodes.includes(error.code)) {
            return false;
        }
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
        if (error.message && (error.message.includes('ETIMEDOUT') || error.message.includes('ECONNRESET'))) {
            return true;
        }
        return true;
    }
    async removeInvalidToken(fcmToken) {
        try {
            await this.deviceTokenRepository.update({ fcmToken }, { isActive: false });
            this.logger.debug(`Deactivated invalid token: ${fcmToken}`);
        }
        catch (error) {
            this.logger.error(`Failed to deactivate invalid token ${fcmToken}:`, error);
        }
    }
    convertDataToStrings(data) {
        const result = {};
        for (const [key, value] of Object.entries(data)) {
            result[key] = typeof value === 'string' ? value : JSON.stringify(value);
        }
        return result;
    }
    async getRetryStatistics() {
        try {
            const pendingRetries = await this.notificationLogRepository.count({
                where: {
                    status: notification_log_entity_1.NotificationStatus.FAILED,
                    nextRetryAt: (0, typeorm_2.LessThanOrEqual)(new Date()),
                },
            });
            const failedPermanent = await this.notificationLogRepository.count({
                where: {
                    status: notification_log_entity_1.NotificationStatus.FAILED,
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
        }
        catch (error) {
            this.logger.error('Failed to get retry statistics:', error);
            return {
                pendingRetries: 0,
                failedPermanent: 0,
                avgRetryCount: 0,
            };
        }
    }
};
exports.NotificationRetryService = NotificationRetryService;
exports.NotificationRetryService = NotificationRetryService = NotificationRetryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_log_entity_1.NotificationLog)),
    __param(1, (0, typeorm_1.InjectRepository)(device_token_entity_1.DeviceToken)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], NotificationRetryService);
//# sourceMappingURL=notification-retry.service.js.map