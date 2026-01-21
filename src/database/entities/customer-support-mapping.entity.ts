import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Customer } from './customer.entity';
import { SupportMember } from './support-member.entity';
import { Admin } from './admin.entity';

@Entity('customer_support_mappings')
@Index(['customerId'])
@Index(['supportMemberId'])
@Index(['adminId'])
@Index(['isActive'])
@Unique(['customerId', 'isActive']) // Only one active assignment per customer
export class CustomerSupportMapping {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Customer ID' })
  @Column({ name: 'customer_id' })
  customerId: string;

  @ApiProperty({ description: 'Support member ID (null if assigned to admin)', required: false })
  @Column({ name: 'support_member_id', nullable: true })
  supportMemberId?: string;

  @ApiProperty({ description: 'Admin ID (fallback when no support members)', required: false })
  @Column({ name: 'admin_id', nullable: true })
  adminId?: string;

  @ApiProperty({ description: 'When the assignment was made' })
  @Column({ name: 'assigned_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  assignedAt: Date;

  @ApiProperty({ description: 'Whether this is the active assignment', default: true })
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Notes about the assignment or transfer', required: false })
  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Customer, { nullable: false })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => SupportMember, (member) => member.customerMappings, { nullable: true })
  @JoinColumn({ name: 'support_member_id' })
  supportMember?: SupportMember;

  @ManyToOne(() => Admin, { nullable: true })
  @JoinColumn({ name: 'admin_id' })
  admin?: Admin;
}
