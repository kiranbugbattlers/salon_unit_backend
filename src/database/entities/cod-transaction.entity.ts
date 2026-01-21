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
import { BusinessOwner } from './business-owner.entity';
import { Customer } from './customer.entity';
import { MonthlySettlement } from './monthly-settlement.entity';

export enum CODTransactionStatus {
  PENDING = 'pending', // COD collected, not yet settled
  SETTLED = 'settled', // Included in monthly settlement
  DISPUTED = 'disputed', // Payment dispute
}

@Entity('cod_transactions')
@Index(['bookingId'], { unique: true })
@Index(['businessOwnerId', 'collectedAt'])
@Index(['status'])
@Index(['settledInMonth'])
@Index(['settlementId'])
export class CODTransaction {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Booking ID this COD transaction is for' })
  @Column({ name: 'booking_id' })
  bookingId: string;

  @ApiProperty({ description: 'Business owner ID who collected the COD' })
  @Column({ name: 'business_owner_id' })
  businessOwnerId: string;

  @ApiProperty({ description: 'Customer ID who paid COD' })
  @Column({ name: 'customer_id' })
  customerId: string;

  @ApiProperty({ description: 'Total COD amount collected in INR' })
  @Column({ name: 'amount', type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @ApiProperty({ description: 'Commission amount business owner owes to company' })
  @Column({ name: 'commission_amount', type: 'decimal', precision: 10, scale: 2 })
  commissionAmount: number;

  @ApiProperty({ description: 'Net amount business owner keeps (amount - commission)' })
  @Column({ name: 'net_amount', type: 'decimal', precision: 10, scale: 2 })
  netAmount: number;

  @ApiProperty({ description: 'When COD was collected (service completion time)' })
  @Column({ name: 'collected_at', type: 'timestamp' })
  collectedAt: Date;

  @ApiProperty({ description: 'Month in which this was settled (YYYY-MM)', required: false })
  @Column({ name: 'settled_in_month', type: 'varchar', length: 7, nullable: true })
  settledInMonth?: string;

  @ApiProperty({ description: 'Settlement ID if included in settlement', required: false })
  @Column({ name: 'settlement_id', nullable: true })
  settlementId?: string;

  @ApiProperty({ enum: CODTransactionStatus, description: 'COD transaction status' })
  @Column({
    name: 'status',
    type: 'enum',
    enum: CODTransactionStatus,
    default: CODTransactionStatus.PENDING,
  })
  status: CODTransactionStatus;

  @ApiProperty({ description: 'Additional notes', required: false })
  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Booking, { nullable: false })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @ManyToOne(() => BusinessOwner, { nullable: false })
  @JoinColumn({ name: 'business_owner_id' })
  businessOwner: BusinessOwner;

  @ManyToOne(() => Customer, { nullable: false })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => MonthlySettlement, { nullable: true })
  @JoinColumn({ name: 'settlement_id' })
  settlement?: MonthlySettlement;
}
