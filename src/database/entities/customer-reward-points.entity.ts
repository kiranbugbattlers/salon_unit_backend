import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Customer } from './customer.entity';

export enum RewardTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
}

@Entity('customer_reward_points')
@Index(['customerId'], { unique: true })
@Index(['tier'])
export class CustomerRewardPoints {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Customer ID' })
  @Column({ name: 'customer_id' })
  customerId: string;

  @ApiProperty({ description: 'Current available points balance' })
  @Column({ name: 'total_points', type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalPoints: number;

  @ApiProperty({ description: 'Lifetime points earned' })
  @Column({ name: 'total_earned', type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalEarned: number;

  @ApiProperty({ description: 'Lifetime points redeemed/used' })
  @Column({ name: 'total_redeemed', type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalRedeemed: number;

  @ApiProperty({ description: 'Points expiring soon' })
  @Column({ name: 'expiring_points', type: 'decimal', precision: 10, scale: 2, default: 0 })
  expiringPoints: number;

  @ApiProperty({ description: 'Next expiry date for points', required: false })
  @Column({ name: 'next_expiry_date', type: 'date', nullable: true })
  nextExpiryDate?: Date;

  @ApiProperty({ enum: RewardTier, description: 'Customer tier based on total bookings' })
  @Column({
    name: 'tier',
    type: 'enum',
    enum: RewardTier,
    default: RewardTier.BRONZE,
  })
  tier: RewardTier;

  @ApiProperty({ description: 'Total bookings completed' })
  @Column({ name: 'total_bookings', type: 'int', default: 0 })
  totalBookings: number;

  @ApiProperty({ description: 'Last points earned timestamp', required: false })
  @Column({ name: 'last_earned_at', type: 'timestamp', nullable: true })
  lastEarnedAt?: Date;

  @ApiProperty({ description: 'Last points redeemed timestamp', required: false })
  @Column({ name: 'last_redeemed_at', type: 'timestamp', nullable: true })
  lastRedeemedAt?: Date;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToOne(() => Customer, { nullable: false })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;
}
