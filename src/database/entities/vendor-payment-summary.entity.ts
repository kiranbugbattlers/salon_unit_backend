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
import { VendorPaymentStatus } from './user-booking-history.entity';

@Entity('vendor_payment_summary')
export class VendorPaymentSummary {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Business owner ID' })
  @Column({ name: 'business_owner_id' })
  businessOwnerId: string;

  @ApiProperty({ description: 'Summary date' })
  @Column({ name: 'summary_date', type: 'date' })
  summaryDate: Date;

  @ApiProperty({ description: 'Total number of bookings' })
  @Column({ name: 'total_bookings', type: 'int', default: 0 })
  totalBookings: number;

  @ApiProperty({ description: 'Total revenue from bookings' })
  @Column({ name: 'total_revenue', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalRevenue: number;

  @ApiProperty({ description: 'Total commission deducted' })
  @Column({ name: 'total_commission', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalCommission: number;

  @ApiProperty({ description: 'Total vendor earnings' })
  @Column({ name: 'vendor_earning', type: 'decimal', precision: 12, scale: 2, default: 0 })
  vendorEarning: number;

  @ApiProperty({ description: 'Amount paid to vendor' })
  @Column({ name: 'amount_paid', type: 'decimal', precision: 12, scale: 2, default: 0 })
  amountPaid: number;

  @ApiProperty({ description: 'Amount due to vendor' })
  @Column({ name: 'amount_due', type: 'decimal', precision: 12, scale: 2, default: 0 })
  amountDue: number;

  @ApiProperty({ enum: VendorPaymentStatus, description: 'Payment status' })
  @Column({
    name: 'payment_status',
    type: 'enum',
    enum: VendorPaymentStatus,
    default: VendorPaymentStatus.PENDING,
  })
  paymentStatus: VendorPaymentStatus;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => BusinessOwner, (businessOwner) => businessOwner.id)
  @JoinColumn({ name: 'business_owner_id' })
  businessOwner: BusinessOwner;

  // Computed properties
  get isPaid(): boolean {
    return this.paymentStatus === VendorPaymentStatus.PAID;
  }

  get isOverdue(): boolean {
    return this.paymentStatus === VendorPaymentStatus.OVERDUE;
  }

  get isPartiallyPaid(): boolean {
    return this.paymentStatus === VendorPaymentStatus.PARTIALLY_PAID;
  }

  get hasDueAmount(): boolean {
    return this.amountDue > 0;
  }

  get paymentPercentage(): number {
    if (this.vendorEarning === 0) return 0;
    return (this.amountPaid / this.vendorEarning) * 100;
  }
}
