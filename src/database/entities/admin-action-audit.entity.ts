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
import { Admin } from './admin.entity';

export enum AdminActionType {
  WALLET_ADJUSTMENT = 'wallet_adjustment',
  DEFAULTER_MARK = 'defaulter_mark',
  DEFAULTER_RESTORE = 'defaulter_restore',
  COMMISSION_CONFIG_CREATE = 'commission_config_create',
  SETTLEMENT_MANUAL_GENERATE = 'settlement_manual_generate',
  PAYOUT_PROCESS = 'payout_process',
  PAYOUT_MARK_PAID = 'payout_mark_paid',
  WALLET_FREEZE = 'wallet_freeze',
  WALLET_UNFREEZE = 'wallet_unfreeze',
  BANKING_INFO_VERIFY = 'banking_info_verify',
  TRANSACTION_REVERSE = 'transaction_reverse',
}

@Entity('admin_actions_audit')
@Index(['adminId', 'createdAt'])
@Index(['actionType', 'createdAt'])
@Index(['entityType', 'entityId'])
export class AdminActionAudit {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Admin who performed the action' })
  @Column({ name: 'admin_id' })
  adminId: string;

  @ApiProperty({ enum: AdminActionType, description: 'Type of action performed' })
  @Column({
    name: 'action_type',
    type: 'enum',
    enum: AdminActionType,
  })
  actionType: AdminActionType;

  @ApiProperty({ description: 'Entity type affected (wallet, business_owner, etc.)' })
  @Column({ name: 'entity_type', length: 50 })
  entityType: string;

  @ApiProperty({ description: 'ID of the entity affected' })
  @Column({ name: 'entity_id' })
  entityId: string;

  @ApiProperty({ description: 'State before action (JSON)', required: false })
  @Column({ name: 'state_before', type: 'jsonb', nullable: true })
  stateBefore?: any;

  @ApiProperty({ description: 'State after action (JSON)', required: false })
  @Column({ name: 'state_after', type: 'jsonb', nullable: true })
  stateAfter?: any;

  @ApiProperty({ description: 'Reason for action' })
  @Column({ name: 'reason', type: 'text' })
  reason: string;

  @ApiProperty({ description: 'Additional notes', required: false })
  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({ description: 'IP address of admin' })
  @Column({ name: 'ip_address', length: 45 })
  ipAddress: string;

  @ApiProperty({ description: 'User agent of admin', required: false })
  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  @ApiProperty({ description: 'Additional metadata (JSON)', required: false })
  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata?: any;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Admin, { nullable: false })
  @JoinColumn({ name: 'admin_id' })
  admin: Admin;
}
