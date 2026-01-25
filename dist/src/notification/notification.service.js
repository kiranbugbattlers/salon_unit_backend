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
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const typeorm_2 = require("typeorm");
const device_token_entity_1 = require("./entities/device-token.entity");
const notification_log_entity_1 = require("./entities/notification-log.entity");
const customer_notifications_1 = require("./templates/customer-notifications");
const business_notifications_1 = require("./templates/business-notifications");
const firebase_config_1 = require("../config/firebase.config");
let NotificationService = NotificationService_1 = class NotificationService {
    constructor(deviceTokenRepository, notificationLogRepository, configService) {
        this.deviceTokenRepository = deviceTokenRepository;
        this.notificationLogRepository = notificationLogRepository;
        this.configService = configService;
        this.logger = new common_1.Logger(NotificationService_1.name);
    }
    onModuleInit() {
        try {
            (0, firebase_config_1.initializeFirebase)(this.configService);
        }
        catch (error) {
            this.logger.error('Failed to initialize Firebase', error);
        }
    }
    setRetryService(retryService) {
        this.retryService = retryService;
    }
    async registerToken(userId, registerTokenDto) {
        const { fcmToken, deviceType, userType, deviceInfo } = registerTokenDto;
        try {
            await this.deviceTokenRepository
                .createQueryBuilder()
                .insert()
                .into(device_token_entity_1.DeviceToken)
                .values({
                userId,
                fcmToken,
                deviceType,
                userType,
                deviceInfo,
                isActive: true,
                lastUsedAt: new Date(),
            })
                .orUpdate(['device_type', 'user_type', 'device_info', 'is_active', 'last_used_at', 'updated_at'], ['user_id', 'fcm_token'], {
                skipUpdateIfNoValuesChanged: false,
            })
                .execute();
            const token = await this.deviceTokenRepository.findOne({
                where: { userId, fcmToken },
            });
            if (!token) {
                throw new Error('Failed to register device token');
            }
            this.logger.log(`Device token registered/updated for user ${userId}`);
            return token;
        }
        catch (error) {
            this.logger.error(`Failed to register device token for user ${userId}:`, error);
            throw error;
        }
    }
    async unregisterToken(userId, fcmToken) {
        const token = await this.deviceTokenRepository.findOne({
            where: { userId, fcmToken },
        });
        if (token) {
            token.isActive = false;
            await this.deviceTokenRepository.save(token);
        }
    }
    async deactivateAllUserTokens(userId) {
        await this.deviceTokenRepository.update({ userId, isActive: true }, { isActive: false });
        this.logger.log(`Deactivated all device tokens for user ${userId}`);
    }
    async removeInvalidToken(fcmToken) {
        await this.deviceTokenRepository.update({ fcmToken }, { isActive: false });
    }
    async sendToCustomer(userId, templateName, data) {
        const template = customer_notifications_1.CustomerNotifications[templateName];
        if (!template) {
            throw new common_1.BadRequestException(`Customer notification template "${templateName}" not found`);
        }
        const notification = template(data);
        await this.sendToUser(userId, device_token_entity_1.UserType.CUSTOMER, {
            notificationType: notification.type,
            title: notification.title,
            body: notification.body,
            data,
        });
    }
    async sendToBusinessOwner(userId, templateName, data) {
        const template = business_notifications_1.BusinessNotifications[templateName];
        if (!template) {
            throw new common_1.BadRequestException(`Business notification template "${templateName}" not found`);
        }
        const notification = template(data);
        await this.sendToUser(userId, device_token_entity_1.UserType.BUSINESS_OWNER, {
            notificationType: notification.type,
            title: notification.title,
            body: notification.body,
            data,
        });
    }
    async notifyWalletTransaction(userId, transactionType, data) {
        const templateMap = {
            MONEY_RECEIVED: 'WALLET_MONEY_RECEIVED',
            PAYMENT_PENDING: 'WALLET_PAYMENT_PENDING',
            NEGATIVE_BALANCE: 'WALLET_NEGATIVE_BALANCE',
            WITHDRAWAL_COMPLETED: 'WALLET_WITHDRAWAL_COMPLETED',
        };
        const templateName = templateMap[transactionType];
        await this.sendToBusinessOwner(userId, templateName, data);
    }
    async notifySettlementUpdate(userId, settlementType, data) {
        const templateName = settlementType === 'CREDITED'
            ? 'WALLET_SETTLEMENT_CREDITED'
            : 'WALLET_SETTLEMENT_REQUIRES_PAYMENT';
        await this.sendToBusinessOwner(userId, templateName, data);
    }
    async notifyCustomerWalletCredit(userId, data) {
        await this.sendToCustomer(userId, 'WALLET_CREDIT_RECEIVED', data);
    }
    async sendToUser(userId, userType, notification) {
        const tokens = await this.deviceTokenRepository.find({
            where: { userId, userType, isActive: true },
        });
        if (tokens.length === 0) {
            this.logger.warn(`No active tokens found for user ${userId} (${userType})`);
            await this.notificationLogRepository.save({
                userId,
                userType,
                notificationType: notification.notificationType,
                title: notification.title,
                body: notification.body,
                data: notification.data,
                status: notification_log_entity_1.NotificationStatus.FAILED,
                fcmResponse: { error: 'No active tokens found' },
            });
            return;
        }
        const fcmTokens = tokens.map(t => t.fcmToken);
        await this.sendToTokens(userId, userType, fcmTokens, notification);
    }
    async sendBulkNotification(bulkNotificationDto) {
        const { userIds, userType, notificationType, title, body, data } = bulkNotificationDto;
        const tokens = await this.deviceTokenRepository.find({
            where: { userId: (0, typeorm_2.In)(userIds), userType, isActive: true },
        });
        if (tokens.length === 0) {
            this.logger.warn(`No active tokens found for bulk notification to ${userIds.length} users`);
            return { successCount: 0, failureCount: userIds.length };
        }
        const fcmTokens = tokens.map(t => t.fcmToken);
        const notification = { notificationType, title, body, data };
        const results = await this.sendMulticast(fcmTokens, notification);
        for (const userId of userIds) {
            await this.notificationLogRepository.save({
                userId,
                userType,
                notificationType,
                title,
                body,
                data,
                status: results.successCount > 0 ? notification_log_entity_1.NotificationStatus.SENT : notification_log_entity_1.NotificationStatus.FAILED,
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
    async sendToTokens(userId, userType, tokens, notification) {
        if (tokens.length === 1) {
            await this.sendSingle(userId, userType, tokens[0], notification);
        }
        else {
            await this.sendMulticast(tokens, notification);
            await this.notificationLogRepository.save({
                userId,
                userType,
                notificationType: notification.notificationType,
                title: notification.title,
                body: notification.body,
                data: notification.data,
                status: notification_log_entity_1.NotificationStatus.SENT,
                fcmTokens: tokens,
                sentAt: new Date(),
            });
        }
    }
    async sendSingle(userId, userType, token, notification) {
        try {
            const messaging = (0, firebase_config_1.getFirebaseMessaging)();
            const convertedData = notification.data ? this.convertDataToStrings(notification.data) : {};
            const message = {
                token,
                notification: {
                    title: notification.title,
                    body: notification.body,
                },
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
            await this.notificationLogRepository.save({
                userId,
                userType,
                notificationType: notification.notificationType,
                title: notification.title,
                body: notification.body,
                data: notification.data,
                status: notification_log_entity_1.NotificationStatus.SENT,
                fcmTokens: [token],
                fcmResponse: { messageId: response },
                sentAt: new Date(),
            });
        }
        catch (error) {
            this.logger.error(`Failed to send notification to user ${userId}:`, error);
            if (error.code === 'messaging/invalid-registration-token' || error.code === 'messaging/registration-token-not-registered') {
                await this.removeInvalidToken(token);
            }
            const failedLog = await this.notificationLogRepository.save({
                userId,
                userType,
                notificationType: notification.notificationType,
                title: notification.title,
                body: notification.body,
                data: notification.data,
                status: notification_log_entity_1.NotificationStatus.FAILED,
                fcmTokens: [token],
                fcmResponse: { error: error.message },
            });
            if (this.retryService) {
                await this.retryService.scheduleRetry(failedLog, error);
            }
            throw error;
        }
    }
    async sendMulticast(tokens, notification) {
        try {
            const messaging = (0, firebase_config_1.getFirebaseMessaging)();
            const convertedData = notification.data ? this.convertDataToStrings(notification.data) : {};
            const message = {
                tokens,
                notification: {
                    title: notification.title,
                    body: notification.body,
                },
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
        }
        catch (error) {
            this.logger.error('Failed to send multicast notification:', error);
            throw error;
        }
    }
    async getNotificationHistory(userId, limit = 50) {
        return this.notificationLogRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    convertDataToStrings(data) {
        const result = {};
        for (const [key, value] of Object.entries(data)) {
            if (value === null || value === undefined) {
                continue;
            }
            if (typeof value === 'string') {
                result[key] = value;
            }
            else {
                result[key] = JSON.stringify(value);
            }
        }
        return result;
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(device_token_entity_1.DeviceToken)),
    __param(1, (0, typeorm_1.InjectRepository)(notification_log_entity_1.NotificationLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map