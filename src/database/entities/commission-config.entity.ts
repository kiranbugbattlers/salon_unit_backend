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
import { Admin } from './admin.entity';

@Entity('commission_configs')
@Index(['isActive', 'effectiveFrom', 'effectiveUntil'])
@Index(['effectiveFrom'])
export class CommissionConfig {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Commission percentage charged from business owner (0-100)' })
  @Column({
    name: 'business_owner_commission_percent',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  businessOwnerCommissionPercent: number;

  @ApiProperty({ description: 'Reward percentage given to customer (0-100)' })
  @Column({
    name: 'customer_reward_percent',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  customerRewardPercent: number;

  @ApiProperty({ description: 'Whether this configuration is active' })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Date from which this config is effective' })
  @Column({ name: 'effective_from', type: 'date' })
  effectiveFrom: Date;

  @ApiProperty({ description: 'Date until which this config is effective', required: false })
  @Column({ name: 'effective_until', type: 'date', nullable: true })
  effectiveUntil?: Date;

  @ApiProperty({ description: 'Admin who created this configuration' })
  @Column({ name: 'created_by_admin_id' })
  createdByAdminId: string;

  @ApiProperty({ description: 'Notes about this configuration change', required: false })
  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Admin, { nullable: false })
  @JoinColumn({ name: 'created_by_admin_id' })
  createdBy: Admin;
}
