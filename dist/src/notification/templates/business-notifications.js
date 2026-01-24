"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessNotifications = void 0;
const notification_log_entity_1 = require("../entities/notification-log.entity");
exports.BusinessNotifications = {
    BOOKING_REQUEST_CREATED: (data) => ({
        type: notification_log_entity_1.NotificationType.BOOKING_REQUEST_CREATED,
        title: '🔔 New Booking Request',
        body: `${data.customerName} has requested a ${data.serviceLocation} booking for ${data.services} on ${data.dateTime}. Please review and respond.`,
    }),
    BOOKING_REQUEST_CANCELLED_BY_CUSTOMER: (data) => ({
        type: notification_log_entity_1.NotificationType.BOOKING_REQUEST_CANCELLED_BY_CUSTOMER,
        title: '❌ Customer Cancelled Request',
        body: data.reason
            ? `${data.customerName} cancelled their booking request for ${data.dateTime}. Reason: ${data.reason}`
            : `${data.customerName} cancelled their booking request for ${data.dateTime}`,
    }),
    SERVICE_STARTED: (data) => ({
        type: notification_log_entity_1.NotificationType.SERVICE_STARTED,
        title: '✨ Service Started',
        body: data.staffName
            ? `${data.staffName} has started service for ${data.customerName}`
            : `Service has started for ${data.customerName}`,
    }),
    SERVICE_COMPLETED: (data) => ({
        type: notification_log_entity_1.NotificationType.SERVICE_COMPLETED,
        title: '✅ Service Completed',
        body: data.commissionAmount
            ? `Service completed for ${data.customerName}. Total: ₹${data.totalAmount} (Commission: ₹${data.commissionAmount})`
            : `Service completed for ${data.customerName}. Total: ₹${data.totalAmount}`,
    }),
    SERVICE_REMINDER: (data) => ({
        type: notification_log_entity_1.NotificationType.SERVICE_REMINDER,
        title: '⏰ Upcoming Service',
        body: `Reminder: ${data.customerName}'s appointment is in ${data.hoursUntil} hour${data.hoursUntil > 1 ? 's' : ''} (${data.dateTime})`,
    }),
    ADDON_SERVICE_APPROVED_BY_CUSTOMER: (data) => ({
        type: notification_log_entity_1.NotificationType.ADDON_SERVICE_APPROVED_BY_CUSTOMER,
        title: '✅ Add-On Service Approved',
        body: `${data.customerName} approved the add-on service "${data.serviceName}" (₹${data.price})`,
    }),
    ADDON_SERVICE_REJECTED_BY_CUSTOMER: (data) => ({
        type: notification_log_entity_1.NotificationType.ADDON_SERVICE_REJECTED_BY_CUSTOMER,
        title: '❌ Add-On Service Declined',
        body: `${data.customerName} declined the add-on service "${data.serviceName}"`,
    }),
    ADDON_SERVICE_ADDED_BY_CUSTOMER: (data) => ({
        type: notification_log_entity_1.NotificationType.ADDON_SERVICE_ADDED_BY_CUSTOMER,
        title: '➕ Customer Added Service',
        body: `${data.customerName} added "${data.serviceName}" (₹${data.price}) to their booking. New total: ₹${data.newTotal}`,
    }),
    BOOKING_RESCHEDULED: (data) => ({
        type: notification_log_entity_1.NotificationType.BOOKING_RESCHEDULED,
        title: '📅 Booking Rescheduled',
        body: data.oldDateTime
            ? `${data.customerName}'s booking has been rescheduled from ${data.oldDateTime} to ${data.newDateTime}`
            : `${data.customerName}'s booking has been rescheduled to ${data.newDateTime}`,
    }),
    BOOKING_CANCELLED: (data) => ({
        type: notification_log_entity_1.NotificationType.BOOKING_CANCELLED,
        title: '❌ Booking Cancelled',
        body: data.reason
            ? `${data.customerName} cancelled their booking for ${data.dateTime}. Reason: ${data.reason}`
            : `${data.customerName} cancelled their booking for ${data.dateTime}`,
    }),
    BOOKING_UPDATED: (data) => ({
        type: notification_log_entity_1.NotificationType.BOOKING_UPDATED,
        title: '📝 Booking Updated',
        body: `${data.customerName}'s booking has been updated: ${data.changes}`,
    }),
    PAYMENT_COMPLETED: (data) => ({
        type: notification_log_entity_1.NotificationType.PAYMENT_COMPLETED,
        title: '💰 Payment Received',
        body: data.paymentMethod
            ? `Payment of ₹${data.amount} received from ${data.customerName} via ${data.paymentMethod}`
            : `Payment of ₹${data.amount} received from ${data.customerName}`,
    }),
    PAYMENT_COD_CONFIRMED: (data) => ({
        type: notification_log_entity_1.NotificationType.PAYMENT_COD_CONFIRMED,
        title: '💵 Cash Payment to Collect',
        body: `${data.customerName} will pay ₹${data.amount} in cash. Please collect payment before/after service.`,
    }),
    PAYMENT_REMINDER: (data) => ({
        type: notification_log_entity_1.NotificationType.PAYMENT_REMINDER,
        title: '⏰ Payment Pending',
        body: `${data.customerName} hasn't completed payment of ₹${data.amount} yet. Service cannot be marked as complete until payment is received.`,
    }),
    BUSINESS_APPROVED: (data) => ({
        type: notification_log_entity_1.NotificationType.BUSINESS_APPROVED,
        title: '✅ Business Approved',
        body: `Congratulations! Your business "${data.businessName}" has been approved and is now live on Style+. You can start accepting bookings!`,
    }),
    BUSINESS_REJECTED: (data) => ({
        type: notification_log_entity_1.NotificationType.BUSINESS_REJECTED,
        title: '❌ Business Application Declined',
        body: data.reason
            ? `Your business "${data.businessName}" application was not approved. Reason: ${data.reason}. Please contact support for assistance.`
            : `Your business "${data.businessName}" application was not approved. Please contact support for more details.`,
    }),
    WALLET_MONEY_RECEIVED: (data) => ({
        type: notification_log_entity_1.NotificationType.WALLET_MONEY_RECEIVED,
        title: '💰 Payment Received',
        body: `₹${data.amount} received from ${data.customerName}. Current balance: ₹${data.currentBalance}`,
    }),
    WALLET_PAYMENT_PENDING: (data) => ({
        type: notification_log_entity_1.NotificationType.WALLET_PAYMENT_PENDING,
        title: '⏰ Payment Pending',
        body: data.dueDate
            ? `Payment of ₹${data.amount} from ${data.customerName} is pending. Due by ${data.dueDate}`
            : `Payment of ₹${data.amount} from ${data.customerName} is pending`,
    }),
    WALLET_NEGATIVE_BALANCE: (data) => ({
        type: notification_log_entity_1.NotificationType.WALLET_NEGATIVE_BALANCE,
        title: '⚠️ Negative Balance Alert',
        body: `Your wallet balance is ₹${data.balance}. You owe ₹${Math.abs(data.amountOwed)} to the platform. Please settle the outstanding amount.`,
    }),
    WALLET_SETTLEMENT_CREDITED: (data) => ({
        type: notification_log_entity_1.NotificationType.WALLET_SETTLEMENT_CREDITED,
        title: '💸 Settlement Credited',
        body: `Monthly settlement of ₹${data.amount} for ${data.settlementPeriod} has been credited to your wallet. Current balance: ₹${data.currentBalance}`,
    }),
    WALLET_SETTLEMENT_REQUIRES_PAYMENT: (data) => ({
        type: notification_log_entity_1.NotificationType.WALLET_SETTLEMENT_REQUIRES_PAYMENT,
        title: '⚠️ Payment Required',
        body: data.dueDate
            ? `Your settlement for ${data.settlementPeriod} shows you owe ₹${Math.abs(data.amount)} to the platform. Please pay by ${data.dueDate}`
            : `Your settlement for ${data.settlementPeriod} shows you owe ₹${Math.abs(data.amount)} to the platform`,
    }),
    WALLET_WITHDRAWAL_COMPLETED: (data) => ({
        type: notification_log_entity_1.NotificationType.WALLET_WITHDRAWAL_COMPLETED,
        title: '✅ Withdrawal Successful',
        body: data.bankAccount
            ? `₹${data.amount} has been transferred to your bank account ${data.bankAccount}. Current balance: ₹${data.currentBalance}`
            : `₹${data.amount} has been successfully withdrawn. Current balance: ₹${data.currentBalance}`,
    }),
    STAFF_ASSIGNED: (data) => ({
        type: notification_log_entity_1.NotificationType.STAFF_ASSIGNED,
        title: '👤 Staff Assigned',
        body: `${data.staffName} has been assigned to ${data.customerName}'s booking on ${data.dateTime}`,
    }),
    SCHEDULE_CHANGED: (data) => ({
        type: notification_log_entity_1.NotificationType.SCHEDULE_CHANGED,
        title: '📅 Schedule Updated',
        body: data.staffName
            ? `Schedule for ${data.staffName} on ${data.date} has been updated: ${data.changes}`
            : `Schedule for ${data.date} has been updated: ${data.changes}`,
    }),
    SYSTEM_UPDATE: (data) => ({
        type: notification_log_entity_1.NotificationType.SYSTEM_UPDATE,
        title: data.title,
        body: data.message,
    }),
    CUSTOM: (data) => ({
        type: notification_log_entity_1.NotificationType.CUSTOM,
        title: data.title,
        body: data.message,
    }),
};
//# sourceMappingURL=business-notifications.js.map