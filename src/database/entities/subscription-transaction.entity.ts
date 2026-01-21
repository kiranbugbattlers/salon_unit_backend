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
import { TransactionStatus } from '../../common/enums';
import { BusinessSubscription } from './business-subscription.entity';

@Entity('subscription_transactions')
export class SubscriptionTransaction {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ name: 'business_subscription_id', type: 'uuid' })
  businessSubscriptionId: string;

  @ApiProperty({ required: false })
  @Column({ name: 'transaction_id', length: 255, nullable: true })
  transactionId?: string;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @ApiProperty()
  @Column({ length: 3, default: 'USD' })
  currency: string;

  @ApiProperty({ enum: TransactionStatus })
  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @ApiProperty({ required: false })
  @Column({ name: 'payment_method', length: 50, nullable: true })
  paymentMethod?: string;

  @ApiProperty({ required: false })
  @Column({ name: 'payment_provider', length: 50, nullable: true })
  paymentProvider?: string;

  @ApiProperty({ required: false })
  @Column({ name: 'provider_transaction_id', length: 255, nullable: true })
  providerTransactionId?: string;

  @ApiProperty({ required: false })
  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason?: string;

  @ApiProperty({ required: false })
  @Column({ name: 'refund_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  refundAmount?: number;

  @ApiProperty({ required: false })
  @Column({ name: 'refunded_at', type: 'timestamp', nullable: true })
  refundedAt?: Date;

  @ApiProperty()
  @Column({ name: 'transaction_date', type: 'timestamp' })
  transactionDate: Date;

  @ApiProperty({ required: false })
  @Column({ name: 'metadata', type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @ApiProperty({ required: false })
  @Column({ name: 'razorpay_order_id', length: 255, nullable: true })
  razorpayOrderId?: string;

  @ApiProperty({ required: false })
  @Column({ name: 'razorpay_payment_id', length: 255, nullable: true })
  razorpayPaymentId?: string;

  @ApiProperty({ required: false })
  @Column({ name: 'razorpay_signature', length: 255, nullable: true })
  razorpaySignature?: string;

  @ApiProperty({ required: false })
  @Column({ name: 'payment_attempted_at', type: 'timestamp', nullable: true })
  paymentAttemptedAt?: Date;

  @ApiProperty({ required: false })
  @Column({ name: 'payment_completed_at', type: 'timestamp', nullable: true })
  paymentCompletedAt?: Date;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => BusinessSubscription, (subscription) => subscription.transactions)
  @JoinColumn({ name: 'business_subscription_id' })
  businessSubscription: BusinessSubscription;

  get formattedAmount(): string {
    return `${this.currency} ${this.amount}`;
  }

  get isSuccessful(): boolean {
    return this.status === TransactionStatus.COMPLETED;
  }

  get isFailed(): boolean {
    return this.status === TransactionStatus.FAILED;
  }

  get isPending(): boolean {
    return this.status === TransactionStatus.PENDING;
  }

  get isRefunded(): boolean {
    return this.status === TransactionStatus.REFUNDED;
  }

  get netAmount(): number {
    if (this.isRefunded && this.refundAmount) {
      return this.amount - this.refundAmount;
    }
    return this.amount;
  }
}