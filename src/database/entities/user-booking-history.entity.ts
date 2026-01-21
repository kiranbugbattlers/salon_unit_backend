import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { Booking } from './booking.entity';
import { BusinessOwner } from './business-owner.entity';
import { PaymentMethod } from './business-owner-transaction-history.entity';

export enum BookingPaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  REFUNDED = 'refunded',
  PARTIALLY_PAID = 'partially_paid',
}

export enum VendorPaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  PARTIALLY_PAID = 'partially_paid',
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

@Entity('user_booking_history')
export class UserBookingHistory {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'User ID' })
  @Column({ name: 'user_id' })
  userId: string;

  @ApiProperty({ description: 'Booking ID' })
  @Column({ name: 'booking_id', nullable: true })
  bookingId?: string;

  @ApiProperty({ description: 'Business owner ID' })
  @Column({ name: 'business_owner_id' })
  businessOwnerId: string;

  @ApiProperty({ description: 'Customer name' })
  @Column({ name: 'customer_name', length: 200 })
  customerName: string;

  @ApiProperty({ description: 'Customer mobile number' })
  @Column({ name: 'customer_mobile', length: 15 })
  customerMobile: string;

  @ApiProperty({ description: 'Booking date and time' })
  @Column({ name: 'booking_date', type: 'timestamp' })
  bookingDate: Date;

  @ApiProperty({ description: 'Booking amount' })
  @Column({ name: 'booking_amount', type: 'decimal', precision: 12, scale: 2 })
  bookingAmount: number;

  @ApiProperty({ enum: BookingPaymentStatus, description: 'Payment status' })
  @Column({
    name: 'payment_status',
    type: 'enum',
    enum: BookingPaymentStatus,
    default: BookingPaymentStatus.PENDING,
  })
  paymentStatus: BookingPaymentStatus;

  @ApiProperty({ enum: PaymentMethod, description: 'Payment method' })
  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: PaymentMethod,
    nullable: true,
  })
  paymentMethod?: PaymentMethod;

  @ApiProperty({ enum: VendorPaymentStatus, description: 'Vendor payment status' })
  @Column({
    name: 'vendor_payment_status',
    type: 'enum',
    enum: VendorPaymentStatus,
    default: VendorPaymentStatus.PENDING,
  })
  vendorPaymentStatus: VendorPaymentStatus;

  @ApiProperty({ description: 'Amount paid to vendor' })
  @Column({ name: 'vendor_paid_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  vendorPaidAmount: number;

  @ApiProperty({ description: 'Vendor payment date' })
  @Column({ name: 'vendor_payment_date', type: 'timestamp', nullable: true })
  vendorPaymentDate?: Date;

  @ApiProperty({ description: 'Commission amount' })
  @Column({ name: 'commission_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  commissionAmount: number;

  @ApiProperty({ description: 'Vendor earning amount' })
  @Column({ name: 'vendor_earning', type: 'decimal', precision: 12, scale: 2 })
  vendorEarning: number;

  @ApiProperty({ enum: BookingStatus, description: 'Booking status' })
  @Column({
    name: 'booking_status',
    type: 'enum',
    enum: BookingStatus,
  })
  bookingStatus: BookingStatus;

  @ApiProperty({ description: 'Booking remarks' })
  @Column({ name: 'remarks', type: 'text', nullable: true })
  remarks?: string;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Booking, (booking) => booking.id, { nullable: true })
  @JoinColumn({ name: 'booking_id' })
  booking?: Booking;

  @ManyToOne(() => BusinessOwner, (businessOwner) => businessOwner.id)
  @JoinColumn({ name: 'business_owner_id' })
  businessOwner: BusinessOwner;

  // Computed properties
  get isPaid(): boolean {
    return this.paymentStatus === BookingPaymentStatus.PAID;
  }

  get isVendorPaid(): boolean {
    return this.vendorPaymentStatus === VendorPaymentStatus.PAID;
  }

  get isCompleted(): boolean {
    return this.bookingStatus === BookingStatus.COMPLETED;
  }

  get isCancelled(): boolean {
    return this.bookingStatus === BookingStatus.CANCELLED;
  }
}
