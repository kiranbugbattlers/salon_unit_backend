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

  @ApiProperty({ description: 'Settlement date' })
  @Column({ name: 'settlement_date', type: 'date' })
  settlementDate: Date;

  @ApiProperty({ description: 'Owner name' })
  @Column({ name: 'owner_name', type: 'varchar', nullable: true })
  ownerName?: string;

  @ApiProperty({ description: 'Salon name' })
  @Column({ name: 'salon_name', type: 'varchar', nullable: true })
  salonName?: string;

  @ApiProperty({ description: 'Email' })
  @Column({ name: 'email', type: 'varchar', nullable: true })
  email?: string;

  @ApiProperty({ description: 'Mobile number' })
  @Column({ name: 'mobile_number', type: 'varchar', nullable: true })
  mobileNumber?: string;

  @ApiProperty({ description: 'Address' })
  @Column({ name: 'address', type: 'text', nullable: true })
  address?: string;

  @ApiProperty({ description: 'Total transactions count' })
  @Column({ name: 'total_transactions_count', type: 'int', default: 0 })
  totalTransactionsCount: number;

  @ApiProperty({ description: 'Total transactions amount' })
  @Column({ name: 'total_transactions_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalTransactionsAmount: number;

  @ApiProperty({ description: 'Total cash amount' })
  @Column({ name: 'total_cash_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalCashAmount: number;

  @ApiProperty({ description: 'Total online amount' })
  @Column({ name: 'total_online_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalOnlineAmount: number;

  @ApiProperty({ description: 'Commission percent' })
  @Column({ name: 'commission_percent', type: 'decimal', precision: 5, scale: 2, default: 0 })
  commissionPercent: number;

  @ApiProperty({ description: 'Commission amount' })
  @Column({ name: 'commission_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  commissionAmount: number;

  @ApiProperty({ description: 'GST percent' })
  @Column({ name: 'gst_percent', type: 'decimal', precision: 5, scale: 2, default: 0 })
  gstPercent: number;

  @ApiProperty({ description: 'GST amount' })
  @Column({ name: 'gst_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  gstAmount: number;

  @ApiProperty({ description: 'Total deduction' })
  @Column({ name: 'total_deduction', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalDeduction: number;

  @ApiProperty({ description: 'Settlement amount' })
  @Column({ name: 'settlement_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  settlementAmount: number;

  @ApiProperty({ description: 'Payment status', enum: SettlementPaidStatus })
  @Column({ name: 'paid_status', type: 'enum', enum: SettlementPaidStatus, default: SettlementPaidStatus.PENDING })
  paidStatus: SettlementPaidStatus;

  @ApiProperty({ description: 'Transaction reference' })
  @Column({ name: 'transaction_reference', type: 'varchar', nullable: true })
  transactionReference?: string;

  @ApiProperty({ description: 'Paid at' })
  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt?: Date;

  @ApiProperty({ description: 'Admin notes' })
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