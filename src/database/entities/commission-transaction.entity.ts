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
import { Booking } from './booking.entity';
import { Payment } from './payment.entity';
import { BusinessOwner } from './business-owner.entity';
import { Customer } from './customer.entity';
import { WalletTransaction } from './wallet-transaction.entity';
import { CommissionConfig } from './commission-config.entity';

export enum CommissionTransactionStatus {
  CALCULATED = 'calculated',
  APPLIED = 'applied',
  REVERSED = 'reversed',
  FAILED = 'failed',
}

@Entity('commission_transactions')
@Index(['bookingId'])
@Index(['paymentId'])
@Index(['businessOwnerId', 'calculatedAt'])
@Index(['customerId', 'calculatedAt'])
@Index(['status'])
export class CommissionTransaction {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Booking ID this commission is for' })
  @Column({ name: 'booking_id', type: 'uuid' })
  bookingId: string;

  @ApiProperty({ description: 'Payment ID related to this commission', required: false })
  @Column({ name: 'payment_id', type: 'uuid', nullable: true })
  paymentId?: string;

  @ApiProperty({ description: 'Business owner ID' })
  @Column({ name: 'business_owner_id', type: 'uuid' })
  businessOwnerId: string;

  @ApiProperty({ description: 'Customer ID' })
  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @ApiProperty({ description: 'Commission config ID used for calculation' })
  @Column({ name: 'commission_config_id', type: 'uuid' })
  commissionConfigId: string;

  @ApiProperty({ description: 'Total booking amount' })
  @Column({ name: 'booking_amount', type: 'decimal', precision: 10, scale: 2 })
  bookingAmount: number;

  @ApiProperty({ description: 'Business owner commission percentage applied' })
  @Column({
    name: 'business_owner_commission_percent',
    type: 'decimal',
    precision: 5,
    scale: 2,
  })
  businessOwnerCommissionPercent: number;

  @ApiProperty({ description: 'Business owner commission amount in INR' })
  @Column({
    name: 'business_owner_commission_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  businessOwnerCommissionAmount: number;

  @ApiProperty({ description: 'GST percentage applied' })
  @Column({
    name: 'gst_percent',
    type: 'decimal',
    precision: 5,
    scale: 2,
  })
  gstPercent: number;

  @ApiProperty({ description: 'GST amount in INR' })
  @Column({
    name: 'gst_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  gstAmount: number;

  @ApiProperty({ description: 'Business owner wallet transaction ID', required: false })
  @Column({ name: 'business_owner_wallet_transaction_id', type: 'uuid', nullable: true })
  businessOwnerWalletTransactionId?: string;

  @ApiProperty({ description: 'Customer wallet transaction ID', required: false })
  @Column({ name: 'customer_wallet_transaction_id', type: 'uuid', nullable: true })
  customerWalletTransactionId?: string;

  @ApiProperty({ enum: CommissionTransactionStatus, description: 'Commission status' })
  @Column({
    name: 'status',
    type: 'enum',
    enum: CommissionTransactionStatus,
    default: CommissionTransactionStatus.CALCULATED,
  })
  status: CommissionTransactionStatus;

  @ApiProperty({ description: 'When commission was calculated' })
  @Column({ name: 'calculated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  calculatedAt: Date;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Booking, { nullable: false })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @ManyToOne(() => Payment, { nullable: true })
  @JoinColumn({ name: 'payment_id' })
  payment?: Payment;

  @ManyToOne(() => BusinessOwner, { nullable: false })
  @JoinColumn({ name: 'business_owner_id' })
  businessOwner: BusinessOwner;

  @ManyToOne(() => Customer, { nullable: false })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => CommissionConfig, { nullable: false })
  @JoinColumn({ name: 'commission_config_id' })
  commissionConfig: CommissionConfig;

  @ManyToOne(() => WalletTransaction, { nullable: true })
  @JoinColumn({ name: 'business_owner_wallet_transaction_id' })
  businessOwnerWalletTransaction?: WalletTransaction;

  @ManyToOne(() => WalletTransaction, { nullable: true })
  @JoinColumn({ name: 'customer_wallet_transaction_id' })
  customerWalletTransaction?: WalletTransaction;
}
