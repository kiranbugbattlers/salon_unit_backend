import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BusinessOwner } from '../../database/entities/business-owner.entity';
import { Wallet } from '../../database/entities/wallet.entity';

export enum CommissionPaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity('commission_payments')
export class CommissionPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'business_owner_id' })
  businessOwnerId: string;

  @ManyToOne(() => BusinessOwner)
  @JoinColumn({ name: 'business_owner_id' })
  businessOwner: BusinessOwner;

  @Column({ name: 'wallet_id' })
  walletId: string;

  @ManyToOne(() => Wallet)
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: string;

  @Column({ name: 'razorpay_order_id', nullable: true })
  razorpayOrderId: string;

  @Column({ name: 'razorpay_payment_id', nullable: true })
  razorpayPaymentId: string;

  @Column({ name: 'razorpay_signature', nullable: true })
  razorpaySignature: string;

  @Column({
    type: 'enum',
    enum: CommissionPaymentStatus,
    default: CommissionPaymentStatus.PENDING,
  })
  status: CommissionPaymentStatus;

  @Column({ name: 'balance_before', type: 'decimal', precision: 10, scale: 2 })
  balanceBefore: string;

  @Column({ name: 'balance_after', type: 'decimal', precision: 10, scale: 2, nullable: true })
  balanceAfter: string;

  @Column({ name: 'payment_method', nullable: true })
  paymentMethod: string;

  @Column({ name: 'payment_description', nullable: true })
  paymentDescription: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason: string;

  @Column({ name: 'defaulter_removed', type: 'boolean', default: false })
  defaulterRemoved: boolean;

  @Column({ name: 'processed_at', type: 'timestamp', nullable: true })
  processedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
