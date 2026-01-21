import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Wallet } from './wallet.entity';
import { Booking } from './booking.entity';
import { Payment } from './payment.entity';
import { MonthlySettlement } from './monthly-settlement.entity';

export enum WalletTransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export enum WalletTransactionCategory {
  BOOKING_PAYMENT = 'booking_payment',
  COMMISSION = 'commission',
  COMMISSION_PAYMENT = 'commission_payment',
  SETTLEMENT = 'settlement',
  REWARD_POINTS = 'reward_points',
  REFUND = 'refund',
  ADJUSTMENT = 'adjustment',
  WITHDRAWAL = 'withdrawal',
}

export enum WalletTransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REVERSED = 'reversed',
}

@Entity('wallet_transactions')
@Index(['walletId', 'createdAt'])
@Index(['type', 'category'])
@Index(['bookingId'])
@Index(['paymentId'])
@Index(['settlementId'])
@Index(['status'])
export class WalletTransaction {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Wallet ID this transaction belongs to' })
  @Column({ name: 'wallet_id', type: 'uuid' })
  walletId: string;

  @ApiProperty({ enum: WalletTransactionType, description: 'Transaction type: credit or debit' })
  @Column({
    name: 'type',
    type: 'enum',
    enum: WalletTransactionType,
  })
  type: WalletTransactionType;

  @ApiProperty({ enum: WalletTransactionCategory, description: 'Transaction category' })
  @Column({
    name: 'category',
    type: 'enum',
    enum: WalletTransactionCategory,
  })
  category: WalletTransactionCategory;

  @ApiProperty({ description: 'Transaction amount in INR' })
  @Column({ name: 'amount', type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @ApiProperty({ description: 'Wallet balance before this transaction' })
  @Column({ name: 'balance_before', type: 'decimal', precision: 12, scale: 2 })
  balanceBefore: number;

  @ApiProperty({ description: 'Wallet balance after this transaction' })
  @Column({ name: 'balance_after', type: 'decimal', precision: 12, scale: 2 })
  balanceAfter: number;

  @ApiProperty({ description: 'Related booking ID', required: false })
  @Column({ name: 'booking_id', type: 'uuid', nullable: true })
  bookingId?: string;

  @ApiProperty({ description: 'Related payment ID', required: false })
  @Column({ name: 'payment_id', type: 'uuid', nullable: true })
  paymentId?: string;

  @ApiProperty({ description: 'Related settlement ID', required: false })
  @Column({ name: 'settlement_id', type: 'uuid', nullable: true })
  settlementId?: string;

  @ApiProperty({ description: 'Transaction description' })
  @Column({ name: 'description', type: 'text' })
  description: string;

  @ApiProperty({ description: 'Additional metadata (JSON)', required: false })
  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata?: any;

  @ApiProperty({ enum: WalletTransactionStatus, description: 'Transaction status' })
  @Column({
    name: 'status',
    type: 'enum',
    enum: WalletTransactionStatus,
    default: WalletTransactionStatus.COMPLETED,
  })
  status: WalletTransactionStatus;

  @ApiProperty({ description: 'Transaction timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Wallet, (wallet) => wallet.transactions, { nullable: false })
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet;

  @ManyToOne(() => Booking, { nullable: true })
  @JoinColumn({ name: 'booking_id' })
  booking?: Booking;

  @ManyToOne(() => Payment, { nullable: true })
  @JoinColumn({ name: 'payment_id' })
  payment?: Payment;

  @ManyToOne(() => MonthlySettlement, { nullable: true })
  @JoinColumn({ name: 'settlement_id' })
  settlement?: MonthlySettlement;
}
