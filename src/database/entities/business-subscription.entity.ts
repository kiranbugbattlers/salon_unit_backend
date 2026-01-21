import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionStatus } from '../../common/enums';
import { BusinessOwner } from './business-owner.entity';
import { SubscriptionPlan } from './subscription-plan.entity';
import { SubscriptionTransaction } from './subscription-transaction.entity';

@Entity('business_subscriptions')
export class BusinessSubscription {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ name: 'business_owner_id' })
  businessOwnerId: string;

  @ApiProperty()
  @Column({ name: 'subscription_plan_id' })
  subscriptionPlanId: string;

  @ApiProperty({ enum: SubscriptionStatus })
  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status: SubscriptionStatus;

  @ApiProperty()
  @Column({ name: 'started_at', type: 'timestamp' })
  startedAt: Date;

  @ApiProperty({ required: false })
  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @ApiProperty()
  @Column({ name: 'auto_renew', default: false })
  autoRenew: boolean;

  @ApiProperty({ required: false })
  @Column({ name: 'payment_method_id', length: 255, nullable: true })
  paymentMethodId?: string;

  @ApiProperty({ required: false })
  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason?: string;

  @ApiProperty({ required: false })
  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt?: Date;

  @ApiProperty({ required: false })
  @Column({ name: 'razorpay_order_id', length: 255, nullable: true })
  razorpayOrderId?: string;

  @ApiProperty({ required: false })
  @Column({ name: 'razorpay_payment_id', length: 255, nullable: true })
  razorpayPaymentId?: string;

  @ApiProperty({ required: false })
  @Column({ name: 'last_payment_attempt_at', type: 'timestamp', nullable: true })
  lastPaymentAttemptAt?: Date;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => BusinessOwner, (businessOwner) => businessOwner.id)
  @JoinColumn({ name: 'business_owner_id' })
  businessOwner: BusinessOwner;

  @ManyToOne(() => SubscriptionPlan, (plan) => plan.businessSubscriptions)
  @JoinColumn({ name: 'subscription_plan_id' })
  subscriptionPlan: SubscriptionPlan;

  @OneToMany(() => SubscriptionTransaction, (transaction) => transaction.businessSubscription)
  transactions: SubscriptionTransaction[];

  get isActive(): boolean {
    return this.status === SubscriptionStatus.ACTIVE && !this.isExpired;
  }

  get isExpired(): boolean {
    if (!this.expiresAt) {
      return false; // One-time subscriptions don't expire
    }
    return new Date() > this.expiresAt;
  }

  get daysUntilExpiry(): number | null {
    if (!this.expiresAt) {
      return null;
    }
    const diffTime = this.expiresAt.getTime() - new Date().getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get isNearExpiry(): boolean {
    const days = this.daysUntilExpiry;
    return days !== null && days <= 7 && days > 0;
  }
}