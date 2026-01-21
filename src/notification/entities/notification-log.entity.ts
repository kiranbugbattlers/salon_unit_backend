import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { UserType } from './device-token.entity';

export enum NotificationType {
  // Booking Request Flow (Customer → Business)
  BOOKING_REQUEST_CREATED = 'booking_request_created', // Customer: confirmation, Business: new request
  BOOKING_REQUEST_STAFF_ASSIGNED = 'booking_request_staff_assigned', // Customer: staff assigned notification
  BOOKING_REQUEST_APPROVED = 'booking_request_approved', // Customer: request approved with OTP
  BOOKING_REQUEST_REJECTED = 'booking_request_rejected', // Customer: request rejected with reason
  BOOKING_REQUEST_CANCELLED_BY_CUSTOMER = 'booking_request_cancelled_by_customer', // Business: customer cancelled

  // Service Execution Flow
  SERVICE_OTP_SENT = 'service_otp_sent', // Customer: OTP sent for service verification
  SERVICE_STARTED = 'service_started', // Customer: OTP verified, service in progress
  SERVICE_COMPLETED = 'service_completed', // Customer: service completed
  SERVICE_REMINDER = 'service_reminder', // Customer & Business: upcoming service reminder

  // Add-On Services Flow
  ADDON_SERVICE_PENDING_APPROVAL = 'addon_service_pending_approval', // Customer: business added service, needs approval
  ADDON_SERVICE_APPROVED_BY_CUSTOMER = 'addon_service_approved_by_customer', // Business: customer approved add-on
  ADDON_SERVICE_REJECTED_BY_CUSTOMER = 'addon_service_rejected_by_customer', // Business: customer rejected add-on
  ADDON_SERVICE_ADDED_BY_CUSTOMER = 'addon_service_added_by_customer', // Business: customer added add-on themselves

  // Booking Management
  BOOKING_RESCHEDULED = 'booking_rescheduled', // Customer & Business: booking time changed
  BOOKING_CANCELLED = 'booking_cancelled', // Customer or Business: booking cancelled
  BOOKING_UPDATED = 'booking_updated', // Customer or Business: booking details updated

  // Payment Flow
  PAYMENT_COMPLETED = 'payment_completed', // Customer: payment successful, Business: payment received
  PAYMENT_COD_CONFIRMED = 'payment_cod_confirmed', // Customer: COD confirmed, Business: COD payment to collect
  PAYMENT_FAILED = 'payment_failed', // Customer: payment failed, retry needed
  PAYMENT_REMINDER = 'payment_reminder', // Customer: reminder to complete payment
  REFUND_PROCESSED = 'refund_processed', // Customer: refund initiated

  // Delivery & Location
  DELIVERY_CHARGE_CALCULATED = 'delivery_charge_calculated', // Customer: delivery charge preview for at-home service

  // Business Approval (Business Owner Onboarding)
  BUSINESS_APPROVED = 'business_approved', // Business: business profile approved
  BUSINESS_REJECTED = 'business_rejected', // Business: business profile rejected

  // Wallet & Balance Notifications
  WALLET_MONEY_RECEIVED = 'wallet_money_received', // Business: payment from customer received in wallet
  WALLET_PAYMENT_PENDING = 'wallet_payment_pending', // Business: customer payment is pending/due
  WALLET_NEGATIVE_BALANCE = 'wallet_negative_balance', // Business: wallet balance is negative (debt alert)
  WALLET_SETTLEMENT_CREDITED = 'wallet_settlement_credited', // Business: monthly settlement credited to wallet
  WALLET_SETTLEMENT_REQUIRES_PAYMENT = 'wallet_settlement_requires_payment', // Business: negative settlement, owes money
  WALLET_WITHDRAWAL_COMPLETED = 'wallet_withdrawal_completed', // Business: payout/withdrawal successful
  WALLET_CREDIT_RECEIVED = 'wallet_credit_received', // Customer: reward points or refund credited

  // Staff Management
  STAFF_ASSIGNED = 'staff_assigned', // Staff: assigned to a booking
  SCHEDULE_CHANGED = 'schedule_changed', // Staff: work schedule updated

  // General Notifications
  PROMOTIONAL = 'promotional', // Customer: promotional offers
  SYSTEM_UPDATE = 'system_update', // All: system announcements
  CUSTOM = 'custom', // Custom notifications
}

export enum NotificationStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  PENDING = 'pending',
}

@Entity('notification_logs')
@Index(['userId', 'createdAt'])
@Index(['notificationType', 'createdAt'])
export class NotificationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'user_type',
    type: 'enum',
    enum: UserType,
  })
  userType: UserType;

  @Column({
    name: 'notification_type',
    type: 'enum',
    enum: NotificationType,
  })
  notificationType: NotificationType;

  @Column({ name: 'title', type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'body', type: 'text' })
  body: string;

  @Column({ name: 'data', type: 'jsonb', nullable: true })
  data: Record<string, any>;

  @Column({
    name: 'status',
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  status: NotificationStatus;

  @Column({ name: 'fcm_response', type: 'jsonb', nullable: true })
  fcmResponse: {
    messageId?: string;
    error?: string;
    successCount?: number;
    failureCount?: number;
  };

  @Column({ name: 'fcm_tokens', type: 'text', array: true, nullable: true })
  fcmTokens: string[];

  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true })
  sentAt: Date;

  @Column({ name: 'retry_count', type: 'int', default: 0 })
  retryCount: number;

  @Column({ name: 'max_retries', type: 'int', default: 5 })
  maxRetries: number;

  @Column({ name: 'next_retry_at', type: 'timestamptz', nullable: true })
  nextRetryAt: Date;

  @Column({ name: 'last_retry_at', type: 'timestamptz', nullable: true })
  lastRetryAt: Date;

  @Column({ name: 'retry_error', type: 'text', nullable: true })
  retryError: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
