import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Customer } from './customer.entity';
import { BusinessOwner } from './business-owner.entity';
import { Staff } from './staff.entity';
import { BookingRequestService } from './booking-request-service.entity';
import { Booking } from './booking.entity';
import { Payment } from './payment.entity';
import { ServiceLocation } from '../../common/enums';

export enum BookingRequestStatus {
  // Database-stored statuses (actual column values)
  PENDING = 'pending',                      // Initial booking request
  APPROVED = 'approved',                    // Business approved with OTP generated
  REJECTED = 'rejected',                    // Business rejected

  // Virtual filter statuses (map to database queries, not stored)
  STAFF_ASSIGNED = 'staff_assigned',        // Filter: pending + has assignedStaffId
  IN_PROGRESS = 'in-progress',              // Filter: approved + confirmedBooking.status='in-progress'
  AWAITING_PAYMENT = 'awaiting_payment',    // Filter: in-progress + payment not completed
  COMPLETED = 'completed',                  // Filter: approved + confirmedBooking.status='completed'
  CANCELLED = 'cancelled',                  // Filter: rejected + by customer
}

@Entity('booking_requests')
@Index(['businessOwnerId', 'status'])
@Index(['customerId', 'status'])
@Index(['requestedDate', 'status'])
export class BookingRequest {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @ApiProperty()
  @Column({ name: 'business_owner_id', type: 'uuid' })
  businessOwnerId: string;

  @ApiProperty({ description: 'Requested appointment date' })
  @Column({ name: 'requested_date', type: 'date' })
  @Index()
  requestedDate: Date;

  @ApiProperty({ description: 'Requested start time in HH:MM format' })
  @Column({ name: 'requested_start_time', type: 'time' })
  requestedStartTime: string;

  @ApiProperty({ description: 'Requested end time in HH:MM format' })
  @Column({ name: 'requested_end_time', type: 'time' })
  requestedEndTime: string;

  @ApiProperty({ description: 'Optional requested staff member', required: false })
  @Column({ name: 'requested_staff_id', type: 'uuid', nullable: true })
  requestedStaffId?: string;

  @ApiProperty({ enum: BookingRequestStatus })
  @Column({
    name: 'status',
    type: 'enum',
    enum: BookingRequestStatus,
    default: BookingRequestStatus.PENDING,
  })
  @Index()
  status: BookingRequestStatus;

  @ApiProperty({ description: 'Total estimated price for all services' })
  @Column({ name: 'total_estimated_price', type: 'decimal', precision: 10, scale: 2 })
  totalEstimatedPrice: number;

  @ApiProperty({ description: 'Total estimated duration in minutes' })
  @Column({ name: 'total_estimated_duration', type: 'int' })
  totalEstimatedDuration: number;

  @ApiProperty({ description: 'Requested service location', enum: ServiceLocation, required: false })
  @Column({
    name: 'service_location',
    type: 'enum',
    enum: ServiceLocation,
    default: ServiceLocation.IN_SALON,
    nullable: true,
  })
  serviceLocation?: ServiceLocation;

  @ApiProperty({ description: 'Customer special requests or notes', required: false })
  @Column({ name: 'special_requests', type: 'text', nullable: true })
  specialRequests?: string;

  @ApiProperty({ description: 'Business owner rejection reason', required: false })
  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason?: string;

  @ApiProperty({ description: 'Business owner notes', required: false })
  @Column({ name: 'business_notes', type: 'text', nullable: true })
  businessNotes?: string;

  @ApiProperty({ description: 'Assigned staff member after approval', required: false })
  @Column({ name: 'assigned_staff_id', type: 'uuid', nullable: true })
  assignedStaffId?: string;

  @ApiProperty({ description: 'Final approved start time', required: false })
  @Column({ name: 'approved_start_time', type: 'time', nullable: true })
  approvedStartTime?: string;

  @ApiProperty({ description: 'Final approved end time', required: false })
  @Column({ name: 'approved_end_time', type: 'time', nullable: true })
  approvedEndTime?: string;

  @ApiProperty({ description: 'Final approved price', required: false })
  @Column({ name: 'final_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  finalPrice?: number;

  @ApiProperty({ description: 'Service package ID if booked as a package', required: false })
  @Column({ name: 'service_package_id', type: 'uuid', nullable: true })
  servicePackageId?: string;

  @ApiProperty({ description: 'Payment ID reference', required: false })
  @Column({ name: 'payment_id', type: 'uuid', nullable: true })
  paymentId?: string;

  @ApiProperty({ description: 'Payment status', required: false })
  @Column({ name: 'payment_status', type: 'varchar', length: 50, default: 'not_required', nullable: true })
  paymentStatus?: string;

  @ApiProperty({ description: 'Customer address for at-home services (JSONB format)', required: false })
  @Column({ name: 'customer_address', type: 'jsonb', nullable: true })
  customerAddress?: {
    streetAddress: string;
    city: string;
    state: string;
    postalCode: string;
    latitude: number;
    longitude: number;
    landmark?: string;
  };

  @ApiProperty({ description: 'Delivery charge for at-home services', default: 0 })
  @Column({ name: 'delivery_charge', type: 'decimal', precision: 10, scale: 2, default: 0 })
  deliveryCharge: number;

  @ApiProperty({ description: 'Delivery distance in kilometers', required: false })
  @Column({ name: 'delivery_distance', type: 'decimal', precision: 5, scale: 2, nullable: true })
  deliveryDistance?: number;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Customer, (customer) => customer.id)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => BusinessOwner, (businessOwner) => businessOwner.id)
  @JoinColumn({ name: 'business_owner_id' })
  businessOwner: BusinessOwner;

  @ManyToOne(() => Staff, (staff) => staff.id, { nullable: true })
  @JoinColumn({ name: 'requested_staff_id' })
  requestedStaff?: Staff;

  @ManyToOne(() => Staff, (staff) => staff.id, { nullable: true })
  @JoinColumn({ name: 'assigned_staff_id' })
  assignedStaff?: Staff;

  @ManyToOne(() => Payment, { nullable: true })
  @JoinColumn({ name: 'payment_id' })
  payment?: Payment;

  @OneToMany(() => BookingRequestService, (bookingRequestService) => bookingRequestService.bookingRequest)
  bookingRequestServices: BookingRequestService[];

  @OneToOne(() => Booking, (booking) => booking.bookingRequest, { nullable: true })
  confirmedBooking?: Booking;
}