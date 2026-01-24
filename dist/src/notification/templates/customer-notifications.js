"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerNotifications = void 0;
const notification_log_entity_1 = require("../entities/notification-log.entity");
exports.CustomerNotifications = {
    BOOKING_REQUEST_CREATED: (data) => ({
        type: notification_log_entity_1.NotificationType.BOOKING_REQUEST_CREATED,
        title: '📝 Booking Request Submitted',
        body: `Your booking request at ${data.salonName} for ${data.dateTime} has been submitted. The salon will review and respond shortly.`,
    }),
    BOOKING_REQUEST_STAFF_ASSIGNED: (data) => ({
        type: notification_log_entity_1.NotificationType.BOOKING_REQUEST_STAFF_ASSIGNED,
        title: '👤 Staff Assigned',
        body: `${data.staffName} has been assigned to your booking on ${data.dateTime}`,
    }),
    BOOKING_REQUEST_APPROVED: (data) => ({
        type: notification_log_entity_1.NotificationType.BOOKING_REQUEST_APPROVED,
        title: '✅ Booking Request Approved',
        body: `Your booking at ${data.salonName} for ${data.dateTime} has been approved! Your service OTP is: ${data.otp}. Share this with the salon to start your service.`,
    }),
    BOOKING_REQUEST_REJECTED: (data) => ({
        type: notification_log_entity_1.NotificationType.BOOKING_REQUEST_REJECTED,
        title: '❌ Booking Request Declined',
        body: data.reason
            ? `Sorry, ${data.salonName} couldn't accept your booking request. Reason: ${data.reason}`
            : `Sorry, ${data.salonName} couldn't accept your booking request. Please try booking at a different time.`,
    }),
    SERVICE_OTP_SENT: (data) => ({
        type: notification_log_entity_1.NotificationType.SERVICE_OTP_SENT,
        title: '🔑 Service OTP',
        body: `Your OTP for service at ${data.salonName} is: ${data.otp}. Please share this with the salon to begin your service.`,
    }),
    SERVICE_STARTED: (data) => ({
        type: notification_log_entity_1.NotificationType.SERVICE_STARTED,
        title: '✨ Service Started',
        body: data.staffName
            ? `Your service with ${data.staffName} at ${data.salonName} has started. Enjoy!`
            : `Your service at ${data.salonName} has started. Enjoy!`,
    }),
    SERVICE_COMPLETED: (data) => ({
        type: notification_log_entity_1.NotificationType.SERVICE_COMPLETED,
        title: '🎉 Service Completed',
        body: data.totalAmount
            ? `Thank you for visiting ${data.salonName}! Your service is complete. Total: ₹${data.totalAmount}`
            : `Thank you for visiting ${data.salonName}! We hope you enjoyed your service.`,
    }),
    SERVICE_REMINDER: (data) => ({
        type: notification_log_entity_1.NotificationType.SERVICE_REMINDER,
        title: '⏰ Service Reminder',
        body: `Reminder: Your appointment at ${data.salonName} is in ${data.hoursUntil} hour${data.hoursUntil > 1 ? 's' : ''} (${data.dateTime})`,
    }),
    ADDON_SERVICE_PENDING_APPROVAL: (data) => ({
        type: notification_log_entity_1.NotificationType.ADDON_SERVICE_PENDING_APPROVAL,
        title: '➕ Additional Service Suggested',
        body: `${data.salonName} suggests adding "${data.serviceName}" (₹${data.price}) to your booking. Please approve or decline in your booking details.`,
    }),
    ADDON_SERVICE_APPROVED_BY_CUSTOMER: (data) => ({
        type: notification_log_entity_1.NotificationType.ADDON_SERVICE_APPROVED_BY_CUSTOMER,
        title: '✅ Add-On Service Approved',
        body: `You've approved "${data.serviceName}". Your updated total is ₹${data.newTotal}`,
    }),
    ADDON_SERVICE_REJECTED_BY_CUSTOMER: (data) => ({
        type: notification_log_entity_1.NotificationType.ADDON_SERVICE_REJECTED_BY_CUSTOMER,
        title: '❌ Add-On Service Declined',
        body: `You've declined "${data.serviceName}" from your booking.`,
    }),
    BOOKING_RESCHEDULED: (data) => ({
        type: notification_log_entity_1.NotificationType.BOOKING_RESCHEDULED,
        title: '📅 Booking Rescheduled',
        body: data.oldDateTime
            ? `Your booking at ${data.salonName} has been rescheduled from ${data.oldDateTime} to ${data.newDateTime}`
            : `Your booking at ${data.salonName} has been rescheduled to ${data.newDateTime}`,
    }),
    BOOKING_CANCELLED: (data) => ({
        type: notification_log_entity_1.NotificationType.BOOKING_CANCELLED,
        title: '❌ Booking Cancelled',
        body: data.reason
            ? `Your booking at ${data.salonName} has been cancelled. Reason: ${data.reason}`
            : `Your booking at ${data.salonName} has been cancelled`,
    }),
    BOOKING_UPDATED: (data) => ({
        type: notification_log_entity_1.NotificationType.BOOKING_UPDATED,
        title: '📝 Booking Updated',
        body: `Your booking at ${data.salonName} has been updated: ${data.changes}`,
    }),
    PAYMENT_COMPLETED: (data) => ({
        type: notification_log_entity_1.NotificationType.PAYMENT_COMPLETED,
        title: '💳 Payment Successful',
        body: data.paymentMethod
            ? `Payment of ₹${data.amount} completed successfully via ${data.paymentMethod}. Transaction ID: ${data.transactionId}`
            : `Payment of ₹${data.amount} was successful. Transaction ID: ${data.transactionId}`,
    }),
    PAYMENT_COD_CONFIRMED: (data) => ({
        type: notification_log_entity_1.NotificationType.PAYMENT_COD_CONFIRMED,
        title: '💰 Cash Payment Confirmed',
        body: `Cash payment of ₹${data.amount} for your service at ${data.salonName} has been confirmed. Thank you!`,
    }),
    PAYMENT_FAILED: (data) => ({
        type: notification_log_entity_1.NotificationType.PAYMENT_FAILED,
        title: '❌ Payment Failed',
        body: data.reason
            ? `Payment of ₹${data.amount} failed. Reason: ${data.reason}. Please try again.`
            : `Payment of ₹${data.amount} failed. Please try again.`,
    }),
    PAYMENT_REMINDER: (data) => ({
        type: notification_log_entity_1.NotificationType.PAYMENT_REMINDER,
        title: '⏰ Payment Pending',
        body: `Please complete your payment of ₹${data.amount} for your service at ${data.salonName}`,
    }),
    REFUND_PROCESSED: (data) => ({
        type: notification_log_entity_1.NotificationType.REFUND_PROCESSED,
        title: '💰 Refund Processed',
        body: `Refund of ₹${data.amount} has been initiated. It will reflect in your account within 5-7 business days. Refund ID: ${data.refundId}`,
    }),
    DELIVERY_CHARGE_CALCULATED: (data) => ({
        type: notification_log_entity_1.NotificationType.DELIVERY_CHARGE_CALCULATED,
        title: '🚗 Delivery Charge',
        body: `Delivery charge for at-home service from ${data.salonName}: ₹${data.deliveryCharge} (${data.distance} km). Total amount: ₹${data.totalAmount}`,
    }),
    WALLET_CREDIT_RECEIVED: (data) => ({
        type: notification_log_entity_1.NotificationType.WALLET_CREDIT_RECEIVED,
        title: '💰 Wallet Credit Received',
        body: `₹${data.amount} has been credited to your wallet. Reason: ${data.reason}. Current balance: ₹${data.currentBalance}`,
    }),
    PROMOTIONAL: (data) => ({
        type: notification_log_entity_1.NotificationType.PROMOTIONAL,
        title: data.title,
        body: data.offerCode
            ? `${data.message} Use code: ${data.offerCode}`
            : data.message,
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
//# sourceMappingURL=customer-notifications.js.map