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
import { MonthlySettlement } from './monthly-settlement.entity';
import { Booking } from './booking.entity';
import { CommissionTransaction } from './commission-transaction.entity';

export enum PaymentMethodType {
  ONLINE = 'online',
  COD = 'cod',
}

@Entity('settlement_transactions')
@Index(['settlementId'])
@Index(['bookingId'])
@Index(['paymentMethod'])
export class SettlementTransaction {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Monthly settlement ID this transaction belongs to' })
  @Column({ name: 'settlement_id', type: 'uuid' })
  settlementId: string;

  @ApiProperty({ description: 'Booking ID included in this settlement' })
  @Column({ name: 'booking_id', type: 'uuid' })
  bookingId: string;

  @ApiProperty({ description: 'Commission transaction ID', required: false })
  @Column({ name: 'commission_transaction_id', type: 'uuid', nullable: true })
  commissionTransactionId?: string;

  @ApiProperty({ description: 'Booking amount' })
  @Column({ name: 'amount', type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @ApiProperty({ description: 'Commission amount charged' })
  @Column({ name: 'commission_amount', type: 'decimal', precision: 10, scale: 2 })
  commissionAmount: number;

  @ApiProperty({ description: 'Net amount (amount - commission)' })
  @Column({ name: 'net_amount', type: 'decimal', precision: 10, scale: 2 })
  netAmount: number;

  @ApiProperty({ enum: PaymentMethodType, description: 'Payment method used for this booking' })
  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: PaymentMethodType,
  })
  paymentMethod: PaymentMethodType;

  @ApiProperty({ description: 'Booking completion date' })
  @Column({ name: 'booking_completed_at', type: 'timestamp' })
  bookingCompletedAt: Date;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => MonthlySettlement, (settlement) => settlement.transactions, { nullable: false })
  @JoinColumn({ name: 'settlement_id' })
  settlement: MonthlySettlement;

  @ManyToOne(() => Booking, { nullable: false })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @ManyToOne(() => CommissionTransaction, { nullable: true })
  @JoinColumn({ name: 'commission_transaction_id' })
  commissionTransaction?: CommissionTransaction;
}
