import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Customer } from './customer.entity';
import { BusinessOwner } from './business-owner.entity';
import { Staff } from './staff.entity';
import { Service } from './service.entity';
import { BookingRequest } from './booking-request.entity';
import { BookingStatus, ServiceLocation } from '../../common/enums';
import { PaymentMethodType } from './settlement-transaction.entity';
import { CommissionTransaction } from './commission-transaction.entity';
import { BookingService } from './booking-service.entity';
import { Review } from './review.entity';

@Entity('bookings')
@Index(['businessOwnerId', 'appointmentDate', 'status'])
@Index(['staffId', 'appointmentDate', 'status'])
@Index(['customerId', 'appointmentDate'])
export class Booking {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @ApiProperty()
  @Column({ name: 'business_owner_id', type: 'uuid' })
  businessOwnerId: string;

  @ApiProperty()
  @Column({ name: 'staff_id', type: 'uuid' })
  staffId: string;

  @ApiProperty()
  @Column({ name: 'service_id', type: 'uuid' })
  serviceId: string;

  @ApiProperty({ description: 'Date of the appointment' })
  @Column({ name: 'appointment_date', type: 'date' })
  @Index()
  appointmentDate: Date;

  @ApiProperty({ description: 'Start time in HH:MM format' })
  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @ApiProperty({ description: 'End time in HH:MM format' })
  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @ApiProperty({ enum: ServiceLocation })
  @Column({
    name: 'service_location',
    type: 'enum',
    enum: ServiceLocation,
    default: ServiceLocation.IN_SALON,
  })
  serviceLocation: ServiceLocation;

  @ApiProperty({ required: false })
  @Column({ name: 'special_requests', type: 'text', nullable: true })
  specialRequests?: string;

  @ApiProperty({ description: 'Total amount for the service' })
  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @ApiProperty({ enum: BookingStatus })
  @Column({
    name: 'status',
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  @Index()
  status: BookingStatus;

  @ApiProperty({ required: false })
  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason?: string;

  @ApiProperty({ required: false })
  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt?: Date;

  @ApiProperty({ description: 'Reference to the booking request that created this booking', required: false })
  @Column({ name: 'booking_request_id', type: 'uuid', nullable: true })
  bookingRequestId?: string;

  @ApiProperty({ description: '6-digit OTP for booking verification' })
  @Column({ name: 'otp_code', length: 6 })
  otpCode: string;

  @ApiProperty({ description: 'Timestamp when OTP was verified', required: false })
  @Column({ name: 'otp_verified_at', type: 'timestamp', nullable: true })
  otpVerifiedAt?: Date;

  @ApiProperty({ description: 'Timestamp when service was started', required: false })
  @Column({ name: 'service_started_at', type: 'timestamp', nullable: true })
  serviceStartedAt?: Date;

  @ApiProperty({ description: 'Timestamp when service was completed', required: false })
  @Column({ name: 'service_completed_at', type: 'timestamp', nullable: true })
  serviceCompletedAt?: Date;

  @ApiProperty({ description: 'Payment method used', enum: PaymentMethodType, required: false })
  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: PaymentMethodType,
    default: PaymentMethodType.ONLINE,
    nullable: true,
  })
  paymentMethod?: PaymentMethodType;

  @ApiProperty({ description: 'Commission transaction ID', required: false })
  @Column({ name: 'commission_transaction_id', type: 'uuid', nullable: true })
  commissionTransactionId?: string;

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

  @ApiProperty({ description: 'Flag indicating if payment has been completed', default: false })
  @Column({ name: 'payment_completed', type: 'boolean', default: false })
  paymentCompleted: boolean;

  @ApiProperty({ description: 'Total cost of add-on services added during service', default: 0 })
  @Column({ name: 'add_on_services_total', type: 'decimal', precision: 10, scale: 2, default: 0 })
  addOnServicesTotal: number;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Customer, (customer) => customer.id)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => BusinessOwner)
  @JoinColumn({ name: 'business_owner_id' })
  businessOwner: BusinessOwner;

  @ManyToOne(() => Staff, (staff) => staff.id)
  @JoinColumn({ name: 'staff_id' })
  staff: Staff;

  @ManyToOne(() => Service, (service) => service.id)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @OneToOne(() => BookingRequest, (bookingRequest) => bookingRequest.confirmedBooking, { nullable: true })
  @JoinColumn({ name: 'booking_request_id' })
  bookingRequest?: BookingRequest;

  @ManyToOne(() => CommissionTransaction, { nullable: true })
  @JoinColumn({ name: 'commission_transaction_id' })
  commissionTransaction?: CommissionTransaction;

  @OneToMany(() => BookingService, (bookingService) => bookingService.booking)
  bookingServices: BookingService[];

  @OneToMany(() => Review, (review) => review.booking, {
    cascade: true
  })
  reviews: Review[];
}