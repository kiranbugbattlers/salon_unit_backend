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
import { BusinessOwner } from './business-owner.entity';
import { Booking } from './booking.entity';
import { Admin } from './admin.entity';

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  CASH = 'cash',
  ONLINE = 'online',
  UPI = 'upi',
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
}

@Entity('business_owner_transaction_history')
export class BusinessOwnerTransactionHistory {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Business owner ID' })
  @Column({ name: 'business_owner_id' })
  businessOwnerId: string;

  @ApiProperty({ description: 'Transaction date and time' })
  @Column({ name: 'transaction_date', type: 'timestamp' })
  transactionDate: Date;

  @ApiProperty({ description: 'Transaction amount' })
  @Column({ name: 'transaction_amount', type: 'decimal', precision: 12, scale: 2 })
  transactionAmount: number;

  @ApiProperty({ enum: TransactionType, description: 'Transaction type (credit/debit)' })
  @Column({
    name: 'transaction_type',
    type: 'enum',
    enum: TransactionType,
  })
  transactionType: TransactionType;

  @ApiProperty({ description: 'Previous balance before transaction' })
  @Column({ name: 'previous_balance', type: 'decimal', precision: 12, scale: 2 })
  previousBalance: number;

  @ApiProperty({ description: 'Remaining balance after transaction' })
  @Column({ name: 'remaining_balance', type: 'decimal', precision: 12, scale: 2 })
  remainingBalance: number;

  @ApiProperty({ enum: TransactionStatus, description: 'Transaction status' })
  @Column({
    name: 'status',
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.COMPLETED,
  })
  status: TransactionStatus;

  @ApiProperty({ enum: PaymentMethod, description: 'Payment method' })
  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: PaymentMethod,
    nullable: true,
  })
  paymentMethod?: PaymentMethod;

  @ApiProperty({ description: 'Transaction remarks' })
  @Column({ name: 'remarks', type: 'text', nullable: true })
  remarks?: string;

  @ApiProperty({ description: 'Related booking ID' })
  @Column({ name: 'related_booking_id', nullable: true })
  relatedBookingId?: string;

  @ApiProperty({ description: 'Admin who created this transaction' })
  @Column({ name: 'created_by_admin_id', nullable: true })
  createdByAdminId?: string;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => BusinessOwner, (businessOwner) => businessOwner.id)
  @JoinColumn({ name: 'business_owner_id' })
  businessOwner: BusinessOwner;

  @ManyToOne(() => Booking, (booking) => booking.id, { nullable: true })
  @JoinColumn({ name: 'related_booking_id' })
  relatedBooking?: Booking;

  @ManyToOne(() => Admin, (admin) => admin.id, { nullable: true })
  @JoinColumn({ name: 'created_by_admin_id' })
  createdByAdmin?: Admin;

  // Computed properties
  get isCredit(): boolean {
    return this.transactionType === TransactionType.CREDIT;
  }

  get isDebit(): boolean {
    return this.transactionType === TransactionType.DEBIT;
  }

  get isCompleted(): boolean {
    return this.status === TransactionStatus.COMPLETED;
  }
}
