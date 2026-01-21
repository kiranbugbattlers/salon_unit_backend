import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Booking } from './booking.entity';
import { BusinessService } from './business-service.entity';
import { Service } from './service.entity';
import { Staff } from './staff.entity';
import { ServicePackage } from './service-package.entity';

@Entity('booking_services')
@Index(['bookingId', 'isAddOn'])
export class BookingService {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Booking ID' })
  @Column({ name: 'booking_id', type: 'uuid' })
  @Index()
  bookingId: string;

  @ApiProperty({ description: 'Business service ID' })
  @Column({ name: 'business_service_id', type: 'uuid' })
  businessServiceId: string;

  @ApiProperty({ description: 'Service ID' })
  @Column({ name: 'service_id', type: 'uuid' })
  serviceId: string;

  @ApiProperty({ description: 'Service name (denormalized for performance)' })
  @Column({ name: 'service_name', type: 'varchar', length: 255 })
  serviceName: string;

  @ApiProperty({ description: 'Price for this service' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @ApiProperty({ description: 'Price for this service (alias for price)' })
  @Column({ name: 'service_price', type: 'decimal', precision: 10, scale: 2 })
  servicePrice: number;

  @ApiProperty({ description: 'Duration in minutes' })
  @Column({ name: 'duration_minutes', type: 'int' })
  durationMinutes: number;

  @ApiProperty({ description: 'Duration for this service (alias for durationMinutes)' })
  @Column({ name: 'service_duration', type: 'int' })
  serviceDuration: number;

  @ApiProperty({ description: 'TRUE if service was added during IN_PROGRESS status', default: false })
  @Column({ name: 'is_add_on', type: 'boolean', default: false })
  @Index()
  isAddOn: boolean;

  @ApiProperty({ description: 'Timestamp when add-on service was added', required: false })
  @Column({ name: 'added_at', type: 'timestamp', nullable: true })
  addedAt?: Date;

  @ApiProperty({ description: 'Staff ID who added the service', required: false })
  @Column({ name: 'added_by_staff_id', type: 'uuid', nullable: true })
  addedByStaffId?: string;

  @ApiProperty({ description: 'Customer approval for add-on service', default: true })
  @Column({ name: 'customer_approved', type: 'boolean', default: true })
  customerApproved: boolean;

  @ApiProperty({ description: 'Timestamp when customer approved the add-on service', required: false })
  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @ApiProperty({ description: 'Timestamp when customer rejected the add-on service', required: false })
  @Column({ name: 'rejected_at', type: 'timestamp', nullable: true })
  rejectedAt?: Date;

  @ApiProperty({ description: 'Package ID if service is part of a package', required: false })
  @Column({ name: 'package_id', type: 'uuid', nullable: true })
  packageId?: string;

  @ApiProperty({ description: 'Package name if service is part of a package', required: false })
  @Column({ name: 'package_name', type: 'varchar', length: 255, nullable: true })
  packageName?: string;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Booking, (booking) => booking.bookingServices)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @ManyToOne(() => BusinessService)
  @JoinColumn({ name: 'business_service_id' })
  businessService: BusinessService;

  @ManyToOne(() => Service)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @ManyToOne(() => Staff, { nullable: true })
  @JoinColumn({ name: 'added_by_staff_id' })
  addedByStaff?: Staff;

  @ManyToOne(() => ServicePackage, { nullable: true })
  @JoinColumn({ name: 'package_id' })
  package?: ServicePackage;
}
