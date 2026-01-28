import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BusinessOwner } from './business-owner.entity';
import { SettlementTransaction } from './settlement-transaction.entity';

export enum SettlementStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REQUIRES_PAYMENT = 'requires_payment', // When business owner needs to pay company (negative balance)
  PAYMENT_RECEIVED = 'payment_received', // Business owner payment received
}

@Entity('monthly_settlements')
@Index(['businessOwnerId', 'settlementMonth'], { unique: true })
@Index(['status'])
@Index(['settlementMonth'])
export class MonthlySettlement {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Business owner ID' })
  @Column({ name: 'business_owner_id' })
  businessOwnerId: string;

  @ApiProperty({ description: 'Settlement month in YYYY-MM format', example: '2024-01' })
  @Column({ name: 'settlement_month', type: 'varchar', length: 10, nullable: true })
  settlementMonth: string;

  @ApiProperty({ description: 'Total booking amount for the month' })
  @Column({ name: 'total_booking_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalBookingAmount: number;

  @ApiProperty({ description: 'Total commission amount for the month' })
  @Column({ name: 'total_commission_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalCommissionAmount: number;

  @ApiProperty({ description: 'Net amount payable to business owner (can be negative)' })
  @Column({ name: 'net_payable_to_business_owner', type: 'decimal', precision: 12, scale: 2 })
  netPayableToBusinessOwner: number;

  @ApiProperty({ description: 'Total COD amount collected by business owner' })
  @Column({ name: 'total_cod_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalCODAmount: number;

  @ApiProperty({ description: 'Total online payment amount collected by company' })
  @Column({ name: 'total_online_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalOnlineAmount: number;

  @ApiProperty({ description: 'Number of bookings included in settlement' })
  @Column({ name: 'booking_count', type: 'int', default: 0 })
  bookingCount: number;

  @ApiProperty({ enum: SettlementStatus, description: 'Settlement status' })
  @Column({
    name: 'status',
    type: 'enum',
    enum: SettlementStatus,
    default: SettlementStatus.PENDING,
  })
  status: SettlementStatus;

  @ApiProperty({ description: 'Razorpay payout ID', required: false })
  @Column({ name: 'razorpay_payout_id', nullable: true })
  razorpayPayoutId?: string;

  @ApiProperty({ description: 'Razorpay fund account ID', required: false })
  @Column({ name: 'razorpay_fund_account_id', nullable: true })
  razorpayFundAccountId?: string;

  @ApiProperty({ description: 'When payout was initiated', required: false })
  @Column({ name: 'payout_initiated_at', type: 'timestamp', nullable: true })
  payoutInitiatedAt?: Date;

  @ApiProperty({ description: 'When payout was completed', required: false })
  @Column({ name: 'payout_completed_at', type: 'timestamp', nullable: true })
  payoutCompletedAt?: Date;

  @ApiProperty({ description: 'Failure reason if payout failed', required: false })
  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason?: string;

  @ApiProperty({ description: 'Payout status from Razorpay', required: false })
  @Column({ name: 'payout_status', nullable: true })
  payoutStatus?: string;

  @ApiProperty({ description: 'Payout mode (IMPS, NEFT, etc.)', required: false })
  @Column({ name: 'payout_mode', nullable: true })
  payoutMode?: string;

  @ApiProperty({ description: 'Payout UTR number', required: false })
  @Column({ name: 'payout_utr', nullable: true })
  payoutUtr?: string;

  @ApiProperty({ description: 'Payout metadata from Razorpay', required: false })
  @Column({ name: 'payout_metadata', type: 'jsonb', nullable: true })
  payoutMetadata?: any;

  @ApiProperty({ description: 'Number of retry attempts', required: false })
  @Column({ name: 'retry_count', type: 'int', default: 0 })
  retryCount?: number;

  @ApiProperty({ description: 'Last retry timestamp', required: false })
  @Column({ name: 'last_retry_at', type: 'timestamp', nullable: true })
  lastRetryAt?: Date;

  @ApiProperty({ description: 'Additional metadata (JSON)', required: false })
  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata?: any;

  @ApiProperty({ description: 'Notes from admin', required: false })
  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  adminNotes?: string;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => BusinessOwner, { nullable: false })
  @JoinColumn({ name: 'business_owner_id' })
  businessOwner: BusinessOwner;

  @OneToMany(() => SettlementTransaction, (transaction) => transaction.settlement)
  transactions: SettlementTransaction[];
}
