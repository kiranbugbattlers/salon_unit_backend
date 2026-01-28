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
  @ApiProperty({
    description: 'Unique transaction ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @PrimaryGeneratedColumn('uuid')
  transactionId: string;

  @ApiProperty({ description: 'Business owner ID' })
  @Column({ name: 'business_owner_id' })
  businessOwnerId: string;

  @ApiProperty({ description: 'Transaction date and time' })
  @Column({ name: 'transaction_date', type: 'timestamp' })
  transactionDate: Date;

  @ApiProperty({ description: 'Previous balance before transaction' })
  @Column({ name: 'previous_balance', type: 'decimal', precision: 12, scale: 2, nullable: true })
  previousBalance: number;

  @ApiProperty({ 
    description: 'Transaction amount (+ for Credit, - for Debit)',
    example: 150.00
  })
  @Column({ name: 'transaction_amount', type: 'decimal', precision: 12, scale: 2 })
  transactionAmount: number;

  @ApiProperty({ description: 'Current balance after transaction' })
  @Column({ name: 'current_balance', type: 'decimal', precision: 12, scale: 2, nullable: true })
  currentBalance: number;

  @ApiProperty({ 
    enum: TransactionType, 
    description: 'Transaction Type: Credit / Debit' 
  })
  @Column({
    name: 'transaction_type',
    type: 'enum',
    enum: TransactionType,
  })
  transactionType: TransactionType;

  @ApiProperty({ 
    enum: TransactionStatus, 
    description: 'Status: Success / Pending / Failed' 
  })
  @Column({
    name: 'status',
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.COMPLETED,
  })
  status: TransactionStatus;

  @ApiProperty({ description: 'Transaction remark' })
  @Column({ name: 'remark', type: 'text', nullable: true })
  remark?: string;

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
