import { NotificationType } from '../entities/notification-log.entity';

export interface NotificationTemplate {
  type: NotificationType;
  title: string;
  body: string;
}

export const BusinessNotifications: Record<string, (data: any) => NotificationTemplate> = {
  // Booking Request Flow
  BOOKING_REQUEST_CREATED: (data: {
    bookingId: string;
    customerName: string;
    dateTime: string;
    services: string;
    serviceLocation: string;
  }) => ({
    type: NotificationType.BOOKING_REQUEST_CREATED,
    title: '🔔 New Booking Request',
    body: `${data.customerName} has requested a ${data.serviceLocation} booking for ${data.services} on ${data.dateTime}. Please review and respond.`,
  }),

  BOOKING_REQUEST_CANCELLED_BY_CUSTOMER: (data: {
    bookingId: string;
    customerName: string;
    dateTime: string;
    reason?: string;
  }) => ({
    type: NotificationType.BOOKING_REQUEST_CANCELLED_BY_CUSTOMER,
    title: '❌ Customer Cancelled Request',
    body: data.reason
      ? `${data.customerName} cancelled their booking request for ${data.dateTime}. Reason: ${data.reason}`
      : `${data.customerName} cancelled their booking request for ${data.dateTime}`,
  }),

  // Service Execution Flow
  SERVICE_STARTED: (data: { bookingId: string; customerName: string; staffName?: string }) => ({
    type: NotificationType.SERVICE_STARTED,
    title: '✨ Service Started',
    body: data.staffName
      ? `${data.staffName} has started service for ${data.customerName}`
      : `Service has started for ${data.customerName}`,
  }),

  SERVICE_COMPLETED: (data: {
    bookingId: string;
    customerName: string;
    totalAmount: number;
    commissionAmount?: number;
  }) => ({
    type: NotificationType.SERVICE_COMPLETED,
    title: '✅ Service Completed',
    body: data.commissionAmount
      ? `Service completed for ${data.customerName}. Total: ₹${data.totalAmount} (Commission: ₹${data.commissionAmount})`
      : `Service completed for ${data.customerName}. Total: ₹${data.totalAmount}`,
  }),

  SERVICE_REMINDER: (data: { bookingId: string; customerName: string; dateTime: string; hoursUntil: number }) => ({
    type: NotificationType.SERVICE_REMINDER,
    title: '⏰ Upcoming Service',
    body: `Reminder: ${data.customerName}'s appointment is in ${data.hoursUntil} hour${data.hoursUntil > 1 ? 's' : ''} (${data.dateTime})`,
  }),

  // Add-On Services Flow
  ADDON_SERVICE_APPROVED_BY_CUSTOMER: (data: {
    bookingId: string;
    customerName: string;
    serviceName: string;
    price: number;
  }) => ({
    type: NotificationType.ADDON_SERVICE_APPROVED_BY_CUSTOMER,
    title: '✅ Add-On Service Approved',
    body: `${data.customerName} approved the add-on service "${data.serviceName}" (₹${data.price})`,
  }),

  ADDON_SERVICE_REJECTED_BY_CUSTOMER: (data: {
    bookingId: string;
    customerName: string;
    serviceName: string;
  }) => ({
    type: NotificationType.ADDON_SERVICE_REJECTED_BY_CUSTOMER,
    title: '❌ Add-On Service Declined',
    body: `${data.customerName} declined the add-on service "${data.serviceName}"`,
  }),

  ADDON_SERVICE_ADDED_BY_CUSTOMER: (data: {
    bookingId: string;
    customerName: string;
    serviceName: string;
    price: number;
    newTotal: number;
  }) => ({
    type: NotificationType.ADDON_SERVICE_ADDED_BY_CUSTOMER,
    title: '➕ Customer Added Service',
    body: `${data.customerName} added "${data.serviceName}" (₹${data.price}) to their booking. New total: ₹${data.newTotal}`,
  }),

  // Booking Management
  BOOKING_RESCHEDULED: (data: {
    bookingId: string;
    customerName: string;
    newDateTime: string;
    oldDateTime?: string;
  }) => ({
    type: NotificationType.BOOKING_RESCHEDULED,
    title: '📅 Booking Rescheduled',
    body: data.oldDateTime
      ? `${data.customerName}'s booking has been rescheduled from ${data.oldDateTime} to ${data.newDateTime}`
      : `${data.customerName}'s booking has been rescheduled to ${data.newDateTime}`,
  }),

  BOOKING_CANCELLED: (data: { bookingId: string; customerName: string; dateTime: string; reason?: string }) => ({
    type: NotificationType.BOOKING_CANCELLED,
    title: '❌ Booking Cancelled',
    body: data.reason
      ? `${data.customerName} cancelled their booking for ${data.dateTime}. Reason: ${data.reason}`
      : `${data.customerName} cancelled their booking for ${data.dateTime}`,
  }),

  BOOKING_UPDATED: (data: { bookingId: string; customerName: string; changes: string }) => ({
    type: NotificationType.BOOKING_UPDATED,
    title: '📝 Booking Updated',
    body: `${data.customerName}'s booking has been updated: ${data.changes}`,
  }),

  // Payment Flow
  PAYMENT_COMPLETED: (data: {
    amount: number;
    bookingId: string;
    customerName: string;
    paymentMethod?: string;
    transactionId?: string;
  }) => ({
    type: NotificationType.PAYMENT_COMPLETED,
    title: '💰 Payment Received',
    body: data.paymentMethod
      ? `Payment of ₹${data.amount} received from ${data.customerName} via ${data.paymentMethod}`
      : `Payment of ₹${data.amount} received from ${data.customerName}`,
  }),

  PAYMENT_COD_CONFIRMED: (data: { amount: number; bookingId: string; customerName: string }) => ({
    type: NotificationType.PAYMENT_COD_CONFIRMED,
    title: '💵 Cash Payment to Collect',
    body: `${data.customerName} will pay ₹${data.amount} in cash. Please collect payment before/after service.`,
  }),

  PAYMENT_REMINDER: (data: { amount: number; bookingId: string; customerName: string }) => ({
    type: NotificationType.PAYMENT_REMINDER,
    title: '⏰ Payment Pending',
    body: `${data.customerName} hasn't completed payment of ₹${data.amount} yet. Service cannot be marked as complete until payment is received.`,
  }),

  // Business Approval (Onboarding)
  BUSINESS_APPROVED: (data: { businessName: string }) => ({
    type: NotificationType.BUSINESS_APPROVED,
    title: '✅ Business Approved',
    body: `Congratulations! Your business "${data.businessName}" has been approved and is now live on Style+. You can start accepting bookings!`,
  }),

  BUSINESS_REJECTED: (data: { businessName: string; reason?: string }) => ({
    type: NotificationType.BUSINESS_REJECTED,
    title: '❌ Business Application Declined',
    body: data.reason
      ? `Your business "${data.businessName}" application was not approved. Reason: ${data.reason}. Please contact support for assistance.`
      : `Your business "${data.businessName}" application was not approved. Please contact support for more details.`,
  }),

  // Wallet & Balance Notifications
  WALLET_MONEY_RECEIVED: (data: {
    amount: number;
    customerName: string;
    bookingId?: string;
    currentBalance: number;
  }) => ({
    type: NotificationType.WALLET_MONEY_RECEIVED,
    title: '💰 Payment Received',
    body: `₹${data.amount} received from ${data.customerName}. Current balance: ₹${data.currentBalance}`,
  }),

  WALLET_PAYMENT_PENDING: (data: { amount: number; customerName: string; bookingId: string; dueDate?: string }) => ({
    type: NotificationType.WALLET_PAYMENT_PENDING,
    title: '⏰ Payment Pending',
    body: data.dueDate
      ? `Payment of ₹${data.amount} from ${data.customerName} is pending. Due by ${data.dueDate}`
      : `Payment of ₹${data.amount} from ${data.customerName} is pending`,
  }),

  WALLET_NEGATIVE_BALANCE: (data: { balance: number; amountOwed: number }) => ({
    type: NotificationType.WALLET_NEGATIVE_BALANCE,
    title: '⚠️ Negative Balance Alert',
    body: `Your wallet balance is ₹${data.balance}. You owe ₹${Math.abs(data.amountOwed)} to the platform. Please settle the outstanding amount.`,
  }),

  WALLET_SETTLEMENT_CREDITED: (data: {
    amount: number;
    settlementPeriod: string;
    currentBalance: number;
    settlementId?: string;
  }) => ({
    type: NotificationType.WALLET_SETTLEMENT_CREDITED,
    title: '💸 Settlement Credited',
    body: `Monthly settlement of ₹${data.amount} for ${data.settlementPeriod} has been credited to your wallet. Current balance: ₹${data.currentBalance}`,
  }),

  WALLET_SETTLEMENT_REQUIRES_PAYMENT: (data: {
    amount: number;
    settlementPeriod: string;
    dueDate?: string;
    settlementId?: string;
  }) => ({
    type: NotificationType.WALLET_SETTLEMENT_REQUIRES_PAYMENT,
    title: '⚠️ Payment Required',
    body: data.dueDate
      ? `Your settlement for ${data.settlementPeriod} shows you owe ₹${Math.abs(data.amount)} to the platform. Please pay by ${data.dueDate}`
      : `Your settlement for ${data.settlementPeriod} shows you owe ₹${Math.abs(data.amount)} to the platform`,
  }),

  WALLET_WITHDRAWAL_COMPLETED: (data: {
    amount: number;
    transactionId?: string;
    bankAccount?: string;
    currentBalance: number;
  }) => ({
    type: NotificationType.WALLET_WITHDRAWAL_COMPLETED,
    title: '✅ Withdrawal Successful',
    body: data.bankAccount
      ? `₹${data.amount} has been transferred to your bank account ${data.bankAccount}. Current balance: ₹${data.currentBalance}`
      : `₹${data.amount} has been successfully withdrawn. Current balance: ₹${data.currentBalance}`,
  }),

  // Staff Management
  STAFF_ASSIGNED: (data: { bookingId: string; staffName: string; customerName: string; dateTime: string }) => ({
    type: NotificationType.STAFF_ASSIGNED,
    title: '👤 Staff Assigned',
    body: `${data.staffName} has been assigned to ${data.customerName}'s booking on ${data.dateTime}`,
  }),

  SCHEDULE_CHANGED: (data: { staffName?: string; date: string; changes: string }) => ({
    type: NotificationType.SCHEDULE_CHANGED,
    title: '📅 Schedule Updated',
    body: data.staffName
      ? `Schedule for ${data.staffName} on ${data.date} has been updated: ${data.changes}`
      : `Schedule for ${data.date} has been updated: ${data.changes}`,
  }),

  // General Notifications
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
