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
import { ApprovalStatus } from '../../common/enums';
import { BusinessOwner } from './business-owner.entity';
import { Agent } from './agent.entity';
import { Admin } from './admin.entity';

@Entity('business_approvals')
export class BusinessApproval {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ name: 'business_owner_id' })
  businessOwnerId: string;

  @ApiProperty()
  @Column({ name: 'assigned_agent_id' })
  assignedAgentId: string;

  @ApiProperty()
  @Column({ name: 'assigned_by_admin_id', nullable: true })
  assignedByAdminId?: string;

  @ApiProperty({ enum: ApprovalStatus })
  @Column({
    name: 'status',
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
  })
  status: ApprovalStatus;

  @ApiProperty({ required: false })
  @Column({ name: 'review_notes', type: 'text', nullable: true })
  reviewNotes?: string;

  @ApiProperty({ required: false })
  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason?: string;

  @ApiProperty({ 
    description: 'UPI ID of the business owner',
    example: 'businessowner@upi',
    required: false
  })
  // @Column({ name: 'upi_id', length: 100, nullable: true })
  // upiId?: string;

  @ApiProperty({ 
    description: 'Credit limit assigned to the vendor',
    example: 50000.00,
    required: false
  })
  // @Column({ name: 'credit_limit', type: 'decimal', precision: 12, scale: 2, nullable: true })
  // creditLimit?: number;

  @ApiProperty({ 
    description: 'Vendor status',
    example: 'active',
    required: false
  })
  // @Column({ name: 'vendor_status', length: 50, nullable: true })
  // vendorStatus?: string;

  @ApiProperty({ 
    description: 'remarks when credit limit is added or modified',
    example: 'Initial credit limit set for new vendor',
    required: false
  })
  @Column({ name: 'remark', type: 'text', nullable: true })
  remark?: string;

  @ApiProperty()
  @Column({ name: 'is_auto_assigned', default: true })
  isAutoAssigned: boolean;

  @ApiProperty()
  @Column({ name: 'distance_to_agent_km', type: 'decimal', precision: 10, scale: 2, nullable: true })
  distanceToAgentKm?: number;

  @ApiProperty({ required: false })
  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt?: Date;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => BusinessOwner, (businessOwner) => businessOwner.approvals)
  @JoinColumn({ name: 'business_owner_id' })
  businessOwner: BusinessOwner;

  @ManyToOne(() => Agent, (agent) => agent.assignedApprovals)
  @JoinColumn({ name: 'assigned_agent_id' })
  assignedAgent: Agent;

  @ManyToOne(() => Admin, (admin) => admin.id, { nullable: true })
  @JoinColumn({ name: 'assigned_by_admin_id' })
  assignedByAdmin?: Admin;

  get isCompleted(): boolean {
    return this.status === ApprovalStatus.APPROVED || this.status === ApprovalStatus.REJECTED;
  }
}
