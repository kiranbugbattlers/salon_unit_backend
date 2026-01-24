import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { DeviceToken, UserType } from './entities/device-token.entity';
import { NotificationLog, NotificationType } from './entities/notification-log.entity';
import { RegisterTokenDto } from './dto/register-token.dto';
import { SendBulkNotificationDto } from './dto/send-notification.dto';
export declare class NotificationService implements OnModuleInit {
    private readonly deviceTokenRepository;
    private readonly notificationLogRepository;
    private readonly configService;
    private readonly logger;
    private retryService;
    constructor(deviceTokenRepository: Repository<DeviceToken>, notificationLogRepository: Repository<NotificationLog>, configService: ConfigService);
    onModuleInit(): void;
    setRetryService(retryService: any): void;
    registerToken(userId: string, registerTokenDto: RegisterTokenDto): Promise<DeviceToken>;
    unregisterToken(userId: string, fcmToken: string): Promise<void>;
    deactivateAllUserTokens(userId: string): Promise<void>;
    private removeInvalidToken;
    sendToCustomer(userId: string, templateName: string, data: any): Promise<void>;
    sendToBusinessOwner(userId: string, templateName: string, data: any): Promise<void>;
    notifyWalletTransaction(userId: string, transactionType: 'MONEY_RECEIVED' | 'PAYMENT_PENDING' | 'NEGATIVE_BALANCE' | 'WITHDRAWAL_COMPLETED', data: any): Promise<void>;
    notifySettlementUpdate(userId: string, settlementType: 'CREDITED' | 'REQUIRES_PAYMENT', data: any): Promise<void>;
    notifyCustomerWalletCredit(userId: string, data: any): Promise<void>;
    sendToUser(userId: string, userType: UserType, notification: {
        notificationType: NotificationType;
        title: string;
        body: string;
        data?: Record<string, any>;
    }): Promise<void>;
    sendBulkNotification(bulkNotificationDto: SendBulkNotificationDto): Promise<{
        successCount: number;
        failureCount: number;
    }>;
    private sendToTokens;
    private sendSingle;
    private sendMulticast;
    getNotificationHistory(userId: string, limit?: number): Promise<NotificationLog[]>;
    private convertDataToStrings;
}
