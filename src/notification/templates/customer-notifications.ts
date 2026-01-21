import { NotificationType } from '../entities/notification-log.entity';

export interface NotificationTemplate {
  type: NotificationType;
  title: string;
  body: string;
}

export const CustomerNotifications: Record<string, (data: any) => NotificationTemplate> = {
  // Booking Request Flow
  BOOKING_REQUEST_CREATED: (data: { bookingId: string; dateTime: string; salonName: string }) => ({
    type: NotificationType.BOOKING_REQUEST_CREATED,
    title: '📝 Booking Request Submitted',
    body: `Your booking request at ${data.salonName} for ${data.dateTime} has been submitted. The salon will review and respond shortly.`,
  }),

  BOOKING_REQUEST_STAFF_ASSIGNED: (data: { bookingId: string; staffName: string; dateTime: string }) => ({
    type: NotificationType.BOOKING_REQUEST_STAFF_ASSIGNED,
    title: '👤 Staff Assigned',
    body: `${data.staffName} has been assigned to your booking on ${data.dateTime}`,
  }),

  BOOKING_REQUEST_APPROVED: (data: { bookingId: string; otp: string; dateTime: string; salonName: string }) => ({
    type: NotificationType.BOOKING_REQUEST_APPROVED,
    title: '✅ Booking Request Approved',
    body: `Your booking at ${data.salonName} for ${data.dateTime} has been approved! Your service OTP is: ${data.otp}. Share this with the salon to start your service.`,
  }),

  BOOKING_REQUEST_REJECTED: (data: { bookingId: string; salonName: string; reason?: string }) => ({
    type: NotificationType.BOOKING_REQUEST_REJECTED,
    title: '❌ Booking Request Declined',
    body: data.reason
      ? `Sorry, ${data.salonName} couldn't accept your booking request. Reason: ${data.reason}`
      : `Sorry, ${data.salonName} couldn't accept your booking request. Please try booking at a different time.`,
  }),

  // Service Execution Flow
  SERVICE_OTP_SENT: (data: { bookingId: string; otp: string; salonName: string }) => ({
    type: NotificationType.SERVICE_OTP_SENT,
    title: '🔑 Service OTP',
    body: `Your OTP for service at ${data.salonName} is: ${data.otp}. Please share this with the salon to begin your service.`,
  }),

  SERVICE_STARTED: (data: { bookingId: string; salonName: string; staffName?: string }) => ({
    type: NotificationType.SERVICE_STARTED,
    title: '✨ Service Started',
    body: data.staffName
      ? `Your service with ${data.staffName} at ${data.salonName} has started. Enjoy!`
      : `Your service at ${data.salonName} has started. Enjoy!`,
  }),

  SERVICE_COMPLETED: (data: { bookingId: string; salonName: string; totalAmount?: number }) => ({
    type: NotificationType.SERVICE_COMPLETED,
    title: '🎉 Service Completed',
    body: data.totalAmount
      ? `Thank you for visiting ${data.salonName}! Your service is complete. Total: ₹${data.totalAmount}`
      : `Thank you for visiting ${data.salonName}! We hope you enjoyed your service.`,
  }),

  SERVICE_REMINDER: (data: { bookingId: string; dateTime: string; salonName: string; hoursUntil: number }) => ({
    type: NotificationType.SERVICE_REMINDER,
    title: '⏰ Service Reminder',
    body: `Reminder: Your appointment at ${data.salonName} is in ${data.hoursUntil} hour${data.hoursUntil > 1 ? 's' : ''} (${data.dateTime})`,
  }),

  // Add-On Services Flow
  ADDON_SERVICE_PENDING_APPROVAL: (data: {
    bookingId: string;
    serviceName: string;
    price: number;
    salonName: string;
  }) => ({
    type: NotificationType.ADDON_SERVICE_PENDING_APPROVAL,
    title: '➕ Additional Service Suggested',
    body: `${data.salonName} suggests adding "${data.serviceName}" (₹${data.price}) to your booking. Please approve or decline in your booking details.`,
  }),

  ADDON_SERVICE_APPROVED_BY_CUSTOMER: (data: {
    bookingId: string;
    serviceName: string;
    newTotal: number;
  }) => ({
    type: NotificationType.ADDON_SERVICE_APPROVED_BY_CUSTOMER,
    title: '✅ Add-On Service Approved',
    body: `You've approved "${data.serviceName}". Your updated total is ₹${data.newTotal}`,
  }),

  ADDON_SERVICE_REJECTED_BY_CUSTOMER: (data: {
    bookingId: string;
    serviceName: string;
  }) => ({
    type: NotificationType.ADDON_SERVICE_REJECTED_BY_CUSTOMER,
    title: '❌ Add-On Service Declined',
    body: `You've declined "${data.serviceName}" from your booking.`,
  }),

  // Booking Management
  BOOKING_RESCHEDULED: (data: { bookingId: string; newDateTime: string; salonName: string; oldDateTime?: string }) => ({
    type: NotificationType.BOOKING_RESCHEDULED,
    title: '📅 Booking Rescheduled',
    body: data.oldDateTime
      ? `Your booking at ${data.salonName} has been rescheduled from ${data.oldDateTime} to ${data.newDateTime}`
      : `Your booking at ${data.salonName} has been rescheduled to ${data.newDateTime}`,
  }),

  BOOKING_CANCELLED: (data: { bookingId: string; salonName: string; reason?: string }) => ({
    type: NotificationType.BOOKING_CANCELLED,
    title: '❌ Booking Cancelled',
    body: data.reason
      ? `Your booking at ${data.salonName} has been cancelled. Reason: ${data.reason}`
      : `Your booking at ${data.salonName} has been cancelled`,
  }),

  BOOKING_UPDATED: (data: { bookingId: string; salonName: string; changes: string }) => ({
    type: NotificationType.BOOKING_UPDATED,
    title: '📝 Booking Updated',
    body: `Your booking at ${data.salonName} has been updated: ${data.changes}`,
  }),

  // Payment Flow
  PAYMENT_COMPLETED: (data: {
    amount: number;
    bookingId: string;
    transactionId: string;
    paymentMethod?: string;
  }) => ({
    type: NotificationType.PAYMENT_COMPLETED,
    title: '💳 Payment Successful',
    body: data.paymentMethod
      ? `Payment of ₹${data.amount} completed successfully via ${data.paymentMethod}. Transaction ID: ${data.transactionId}`
      : `Payment of ₹${data.amount} was successful. Transaction ID: ${data.transactionId}`,
  }),

  PAYMENT_COD_CONFIRMED: (data: { amount: number; bookingId: string; salonName: string }) => ({
    type: NotificationType.PAYMENT_COD_CONFIRMED,
    title: '💰 Cash Payment Confirmed',
    body: `Cash payment of ₹${data.amount} for your service at ${data.salonName} has been confirmed. Thank you!`,
  }),

  PAYMENT_FAILED: (data: { amount: number; bookingId: string; reason?: string }) => ({
    type: NotificationType.PAYMENT_FAILED,
    title: '❌ Payment Failed',
    body: data.reason
      ? `Payment of ₹${data.amount} failed. Reason: ${data.reason}. Please try again.`
      : `Payment of ₹${data.amount} failed. Please try again.`,
  }),

  PAYMENT_REMINDER: (data: { amount: number; bookingId: string; salonName: string }) => ({
    type: NotificationType.PAYMENT_REMINDER,
    title: '⏰ Payment Pending',
    body: `Please complete your payment of ₹${data.amount} for your service at ${data.salonName}`,
  }),

  REFUND_PROCESSED: (data: { amount: number; bookingId: string; refundId: string }) => ({
    type: NotificationType.REFUND_PROCESSED,
    title: '💰 Refund Processed',
    body: `Refund of ₹${data.amount} has been initiated. It will reflect in your account within 5-7 business days. Refund ID: ${data.refundId}`,
  }),

  // Delivery & Location
  DELIVERY_CHARGE_CALCULATED: (data: {
    deliveryCharge: number;
    distance: number;
    salonName: string;
    totalAmount: number;
  }) => ({
    type: NotificationType.DELIVERY_CHARGE_CALCULATED,
    title: '🚗 Delivery Charge',
    body: `Delivery charge for at-home service from ${data.salonName}: ₹${data.deliveryCharge} (${data.distance} km). Total amount: ₹${data.totalAmount}`,
  }),

  // Wallet Notifications
  WALLET_CREDIT_RECEIVED: (data: {
    amount: number;
    reason: string;
    currentBalance: number;
    transactionId?: string;
  }) => ({
    type: NotificationType.WALLET_CREDIT_RECEIVED,
    title: '💰 Wallet Credit Received',
    body: `₹${data.amount} has been credited to your wallet. Reason: ${data.reason}. Current balance: ₹${data.currentBalance}`,
  }),

  // General Notifications
  PROMOTIONAL: (data: { title: string; message: string; offerCode?: string }) => ({
    type: NotificationType.PROMOTIONAL,
    title: data.title,
    body: data.offerCode
      ? `${data.message} Use code: ${data.offerCode}`
      : data.message,
  }),

  SYSTEM_UPDATE: (data: { title: string; message: string }) => ({
    type: NotificationType.SYSTEM_UPDATE,
    title: data.title,
    body: data.message,
  }),

  CUSTOM: (data: { title: string; message: string }) => ({
    type: NotificationType.CUSTOM,
    title: data.title,
    body: data.message,
  }),
};
