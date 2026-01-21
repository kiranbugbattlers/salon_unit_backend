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
import { BusinessOwner } from './business-owner.entity';

export enum SettlementPaidStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  PAID = 'paid',
  FAILED = 'failed',
}

@Entity('daily_settlements')
@Index(['businessOwnerId', 'settlementDate'], { unique: true })
@Index(['settlementDate'])
@Index(['paidStatus'])
export class DailySettlement {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Business owner ID' })
  @Column({ name: 'business_owner_id' })
  businessOwnerId: string;

  @ApiProperty({ description: 'Settlement date in YYYY-MM-DD format', example: '2026-01-07' })
  @Column({ name: 'settlement_date', type: 'date', nullable: true })
  settlementDate: Date;

  // Cached vendor details for quick access
  @ApiProperty({ description: 'Owner full name', required: false })
  @Column({ name: 'owner_name', length: 200, nullable: true })
  ownerName?: string;

  @ApiProperty({ description: 'Salon/Business name', required: false })
  @Column({ name: 'salon_name', length: 200, nullable: true })
  salonName?: string;

  @ApiProperty({ description: 'Email address', required: false })
  @Column({ name: 'email', length: 255, nullable: true })
  email?: string;

  @ApiProperty({ description: 'Mobile number', required: false })
  @Column({ name: 'mobile_number', length: 15, nullable: true })
  mobileNumber?: string;

  @ApiProperty({ description: 'Full address', required: false })
  @Column({ name: 'address', type: 'text', nullable: true })
  address?: string;

  // Transaction statistics
  @ApiProperty({ description: 'Total number of completed transactions for the day' })
  @Column({ name: 'total_transactions_count', type: 'int', default: 0 })
  totalTransactionsCount: number;

  @ApiProperty({ description: 'Total transaction amount for the day' })
  @Column({ name: 'total_transactions_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalTransactionsAmount: number;

  @ApiProperty({ description: 'Total amount collected in cash (COD) by vendor' })
  @Column({ name: 'total_cash_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalCashAmount: number;

  @ApiProperty({ description: 'Total amount collected online by admin' })
  @Column({ name: 'total_online_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalOnlineAmount: number;

  // Commission calculation (8%)
  @ApiProperty({ description: 'Commission percentage', example: 8.00 })
  @Column({ name: 'commission_percent', type: 'decimal', precision: 5, scale: 2, default: 8.00 })
  commissionPercent: number;

  @ApiProperty({ description: 'Commission amount (8% of total)' })
  @Column({ name: 'commission_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  commissionAmount: number;

  // GST on commission (18%)
  @ApiProperty({ description: 'GST percentage on commission', example: 18.00 })
  @Column({ name: 'gst_percent', type: 'decimal', precision: 5, scale: 2, default: 18.00 })
  gstPercent: number;

  @ApiProperty({ description: 'GST amount (18% of commission)' })
  @Column({ name: 'gst_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  gstAmount: number;

  // Total deduction and settlement
  @ApiProperty({ description: 'Total deduction (commission + GST)' })
  @Column({ name: 'total_deduction', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalDeduction: number;

  @ApiProperty({ description: 'Final settlement amount (total - deduction)' })
  @Column({ name: 'settlement_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  settlementAmount: number;

  // Payment status
  @ApiProperty({ enum: SettlementPaidStatus, description: 'Payment status' })
  @Column({
    name: 'paid_status',
    type: 'enum',
    enum: SettlementPaidStatus,
    default: SettlementPaidStatus.PENDING,
  })
  paidStatus: SettlementPaidStatus;

  @ApiProperty({ description: 'When payment was made', required: false })
  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt?: Date;

  @ApiProperty({ description: 'Payment transaction reference', required: false })
  @Column({ name: 'transaction_reference', length: 255, nullable: true })
  transactionReference?: string;

  @ApiProperty({ description: 'Admin notes', required: false })
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
}
