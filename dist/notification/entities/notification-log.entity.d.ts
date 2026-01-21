import { User } from '../../database/entities/user.entity';
import { UserType } from './device-token.entity';
export declare enum NotificationType {
    BOOKING_REQUEST_CREATED = "booking_request_created",
    BOOKING_REQUEST_STAFF_ASSIGNED = "booking_request_staff_assigned",
    BOOKING_REQUEST_APPROVED = "booking_request_approved",
    BOOKING_REQUEST_REJECTED = "booking_request_rejected",
    BOOKING_REQUEST_CANCELLED_BY_CUSTOMER = "booking_request_cancelled_by_customer",
    SERVICE_OTP_SENT = "service_otp_sent",
    SERVICE_STARTED = "service_started",
    SERVICE_COMPLETED = "service_completed",
    SERVICE_REMINDER = "service_reminder",
    ADDON_SERVICE_PENDING_APPROVAL = "addon_service_pending_approval",
    ADDON_SERVICE_APPROVED_BY_CUSTOMER = "addon_service_approved_by_customer",
    ADDON_SERVICE_REJECTED_BY_CUSTOMER = "addon_service_rejected_by_customer",
    ADDON_SERVICE_ADDED_BY_CUSTOMER = "addon_service_added_by_customer",
    BOOKING_RESCHEDULED = "booking_rescheduled",
    BOOKING_CANCELLED = "booking_cancelled",
    BOOKING_UPDATED = "booking_updated",
    PAYMENT_COMPLETED = "payment_completed",
    PAYMENT_COD_CONFIRMED = "payment_cod_confirmed",
    PAYMENT_FAILED = "payment_failed",
    PAYMENT_REMINDER = "payment_reminder",
    REFUND_PROCESSED = "refund_processed",
    DELIVERY_CHARGE_CALCULATED = "delivery_charge_calculated",
    BUSINESS_APPROVED = "business_approved",
    BUSINESS_REJECTED = "business_rejected",
    WALLET_MONEY_RECEIVED = "wallet_money_received",
    WALLET_PAYMENT_PENDING = "wallet_payment_pending",
    WALLET_NEGATIVE_BALANCE = "wallet_negative_balance",
    WALLET_SETTLEMENT_CREDITED = "wallet_settlement_credited",
    WALLET_SETTLEMENT_REQUIRES_PAYMENT = "wallet_settlement_requires_payment",
    WALLET_WITHDRAWAL_COMPLETED = "wallet_withdrawal_completed",
    WALLET_CREDIT_RECEIVED = "wallet_credit_received",
    STAFF_ASSIGNED = "staff_assigned",
    SCHEDULE_CHANGED = "schedule_changed",
    PROMOTIONAL = "promotional",
    SYSTEM_UPDATE = "system_update",
    CUSTOM = "custom"
}
export declare enum NotificationStatus {
    SENT = "sent",
    DELIVERED = "delivered",
    FAILED = "failed",
    PENDING = "pending"
}
export declare class NotificationLog {
    id: string;
    userId: string;
    user: User;
    userType: UserType;
    notificationType: NotificationType;
    title: string;
    body: string;
    data: Record<string, any>;
    status: NotificationStatus;
    fcmResponse: {
        messageId?: string;
        error?: string;
        successCount?: number;
        failureCount?: number;
    };
    fcmTokens: string[];
    sentAt: Date;
    retryCount: number;
    maxRetries: number;
    nextRetryAt: Date;
    lastRetryAt: Date;
    retryError: string;
    createdAt: Date;
}
