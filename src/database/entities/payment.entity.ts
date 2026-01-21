import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Customer } from './customer.entity';
import { BusinessOwner } from './business-owner.entity';
import { Booking } from './booking.entity';
import { BookingRequest } from './booking-request.entity';
import { PaymentStatus } from '../../common/enums';

@Entity('payments')
@Index(['bookingRequestId'])
@Index(['bookingId'])
@Index(['customerId'])
@Index(['razorpayOrderId'], { unique: true })
@Index(['razorpayPaymentId'], { unique: true, where: 'razorpay_payment_id IS NOT NULL' })
@Index(['status'])
export class Payment {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Reference to booking request' })
  @Column({ name: 'booking_request_id', type: 'uuid' })
  bookingRequestId: string;

  @ApiProperty({ description: 'Reference to confirmed booking (set after payment success)', required: false })
  @Column({ name: 'booking_id', type: 'uuid', nullable: true })
  bookingId?: string;

  @ApiProperty()
  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @ApiProperty()
  @Column({ name: 'business_owner_id', type: 'uuid' })
  businessOwnerId: string;

  // Razorpay fields
  @ApiProperty({ description: 'Razorpay Order ID (null for COD payments)', required: false })
  @Column({ name: 'razorpay_order_id', unique: true, nullable: true })
  razorpayOrderId?: string;

  @ApiProperty({ description: 'Razorpay Payment ID (set after payment capture)', required: false })
  @Column({ name: 'razorpay_payment_id', nullable: true, unique: true })
  razorpayPaymentId?: string;

  @ApiProperty({ description: 'Razorpay signature for verification', required: false })
  @Column({ name: 'razorpay_signature', nullable: true })
  razorpaySignature?: string;

  // Payment details
  @ApiProperty({ description: 'Payment amount' })
  @Column({ name: 'amount', type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @ApiProperty({ description: 'Currency code', default: 'INR' })
  @Column({ name: 'currency', length: 3, default: 'INR' })
  currency: string;

  @ApiProperty({ enum: PaymentStatus })
  @Column({
    name: 'status',
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.CREATED,
  })
  status: PaymentStatus;

  @ApiProperty({ description: 'Payment method used', required: false })
  @Column({ name: 'payment_method', nullable: true })
  paymentMethod?: string; // card, upi, netbanking, wallet

  @ApiProperty({ description: 'Card network (for card payments)', required: false })
  @Column({ name: 'card_network', nullable: true })
  cardNetwork?: string; // visa, mastercard, amex, etc.

  @ApiProperty({ description: 'Bank name (for netbanking/UPI)', required: false })
  @Column({ name: 'bank_name', nullable: true })
  bankName?: string;

  @ApiProperty({ description: 'Wallet name (for wallet payments)', required: false })
  @Column({ name: 'wallet_name', nullable: true })
  walletName?: string;

  @ApiProperty({ description: 'UPI Virtual Payment Address', required: false })
  @Column({ name: 'vpa', nullable: true })
  vpa?: string;

  @ApiProperty({ description: 'Additional Razorpay metadata (JSON)', required: false })
  @Column({ name: 'payment_metadata', type: 'jsonb', nullable: true })
  paymentMetadata?: any;

  // Refund tracking
  @ApiProperty({ description: 'Razorpay Refund ID', required: false })
  @Column({ name: 'refund_id', nullable: true })
  refundId?: string;

  @ApiProperty({ description: 'Refund amount', required: false })
  @Column({ name: 'refund_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  refundAmount?: number;

  @ApiProperty({ description: 'Refund status', required: false })
  @Column({ name: 'refund_status', nullable: true })
  refundStatus?: string; // processed, failed, pending

  @ApiProperty({ description: 'Reason for refund', required: false })
  @Column({ name: 'refund_reason', type: 'text', nullable: true })
  refundReason?: string;

  @ApiProperty({ description: 'Refund initiated timestamp', required: false })
  @Column({ name: 'refund_initiated_at', type: 'timestamp', nullable: true })
  refundInitiatedAt?: Date;

  @ApiProperty({ description: 'Refund processed timestamp', required: false })
  @Column({ name: 'refund_processed_at', type: 'timestamp', nullable: true })
  refundProcessedAt?: Date;

  // Error handling
  @ApiProperty({ description: 'Error code if payment failed', required: false })
  @Column({ name: 'error_code', nullable: true })
  errorCode?: string;

  @ApiProperty({ description: 'Error description if payment failed', required: false })
  @Column({ name: 'error_description', type: 'text', nullable: true })
  errorDescription?: string;

  @ApiProperty({ description: 'Number of retry attempts', default: 0 })
  @Column({ name: 'retry_count', type: 'int', default: 0 })
  retryCount: number;

  // Timestamps
  @ApiProperty({ description: 'When customer attempted payment', required: false })
  @Column({ name: 'payment_attempted_at', type: 'timestamp', nullable: true })
  paymentAttemptedAt?: Date;

  @ApiProperty({ description: 'When payment was completed', required: false })
  @Column({ name: 'payment_completed_at', type: 'timestamp', nullable: true })
  paymentCompletedAt?: Date;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => BookingRequest, { nullable: false })
  @JoinColumn({ name: 'booking_request_id' })
  bookingRequest: BookingRequest;

  @ManyToOne(() => Booking, { nullable: true })
  @JoinColumn({ name: 'booking_id' })
  booking?: Booking;

  @ManyToOne(() => Customer, { nullable: false })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => BusinessOwner, { nullable: false })
  @JoinColumn({ name: 'business_owner_id' })
  businessOwner: BusinessOwner;
}
