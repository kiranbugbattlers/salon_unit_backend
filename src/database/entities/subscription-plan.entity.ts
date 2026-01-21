import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BillingType } from '../../common/enums';
import { BusinessSubscription } from './business-subscription.entity';

@Entity('subscription_plans')
export class SubscriptionPlan {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ length: 100 })
  name: string;

  @ApiProperty()
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ enum: BillingType })
  @Column({
    name: 'billing_type',
    type: 'enum',
    enum: BillingType,
  })
  billingType: BillingType;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @ApiProperty()
  @Column({ length: 3, default: 'USD' })
  currency: string;

  @ApiProperty()
  @Column({ type: 'json' })
  features: string[];

  @ApiProperty()
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => BusinessSubscription, (subscription) => subscription.subscriptionPlan)
  businessSubscriptions: BusinessSubscription[];

  get formattedPrice(): string {
    return `${this.currency} ${this.price}`;
  }

  get isRecurring(): boolean {
    return this.billingType === BillingType.MONTHLY || this.billingType === BillingType.YEARLY;
  }
}