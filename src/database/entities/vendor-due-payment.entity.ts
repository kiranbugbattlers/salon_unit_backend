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
import { BusinessOwner } from './business-owner.entity';
import { Admin } from './admin.entity';

export enum DuePaymentStatus {
  PENDING = 'pending',
  OVERDUE = 'overdue',
  PAID = 'paid',
  PARTIALLY_PAID = 'partially_paid',
}

@Entity('vendor_due_payments')
export class VendorDuePayment {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Business owner ID' })
  @Column({ name: 'business_owner_id' })
  businessOwnerId: string;

  @ApiProperty({ description: 'Due amount' })
  @Column({ name: 'due_amount', type: 'decimal', precision: 12, scale: 2 })
  dueAmount: number;

  @ApiProperty({ description: 'Paid amount' })
  @Column({ name: 'paid_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  paidAmount: number;

  @ApiProperty({ description: 'Remaining amount' })
  @Column({ name: 'remaining_amount', type: 'decimal', precision: 12, scale: 2 })
  remainingAmount: number;

  @ApiProperty({ description: 'Alternate contact number for admin use only' })
  @Column({ name: 'alternate_number', length: 20, nullable: true })
  alternateNumber?: string;

  @ApiProperty({ description: 'Salon/business name' })
  @Column({ name: 'salon_name', length: 200, nullable: true })
  salonName?: string;

  @ApiProperty({ description: 'Owner full name' })
  @Column({ name: 'owner_name', length: 200, nullable: true })
  ownerName?: string;

  @ApiProperty({ description: 'Owner mobile number' })
  @Column({ name: 'mobile_number', length: 15, nullable: true })
  mobileNumber?: string;

  @ApiProperty({ description: 'Enable/disable status for business' })
  @Column({ name: 'is_business_enabled', type: 'boolean', default: true })
  isBusinessEnabled: boolean;

  @ApiProperty({ description: 'Due date' })
  @Column({ name: 'due_date', type: 'date' })
  dueDate: Date;

  @ApiProperty({ enum: DuePaymentStatus, description: 'Payment status' })
  @Column({
    name: 'status',
    type: 'enum',
    enum: DuePaymentStatus,
    default: DuePaymentStatus.PENDING,
  })
  status: DuePaymentStatus;

  @ApiProperty({ description: 'Payment description' })
  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Admin who created this due payment' })
  @Column({ name: 'created_by_admin_id', nullable: true })
  createdByAdminId?: string;

  @ApiProperty({ description: 'Admin who last updated this due payment' })
  @Column({ name: 'updated_by_admin_id', nullable: true })
  updatedByAdminId?: string;

  @ApiProperty({ description: 'When this due payment was marked as overdue' })
  @Column({ name: 'marked_overdue_at', type: 'timestamp', nullable: true })
  markedOverdueAt?: Date;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => BusinessOwner, (businessOwner) => businessOwner.duePayments)
  @JoinColumn({ name: 'business_owner_id' })
  businessOwner: BusinessOwner;

  @ManyToOne(() => Admin, (admin) => admin.id, { nullable: true })
  @JoinColumn({ name: 'created_by_admin_id' })
  createdByAdmin?: Admin;

  @ManyToOne(() => Admin, (admin) => admin.id, { nullable: true })
  @JoinColumn({ name: 'updated_by_admin_id' })
  updatedByAdmin?: Admin;

  // Computed properties
  get isOverdue(): boolean {
    return this.status === DuePaymentStatus.OVERDUE;
  }

  get isPaid(): boolean {
    return this.status === DuePaymentStatus.PAID;
  }

  get isPartiallyPaid(): boolean {
    return this.status === DuePaymentStatus.PARTIALLY_PAID;
  }

  get isPending(): boolean {
    return this.status === DuePaymentStatus.PENDING;
  }
}
