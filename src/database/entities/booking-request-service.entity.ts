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
import { BookingRequest } from './booking-request.entity';
import { BusinessService } from './business-service.entity';

@Entity('booking_request_services')
@Index(['bookingRequestId', 'businessServiceId'])
@Unique(['bookingRequestId', 'businessServiceId'])
export class BookingRequestService {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ name: 'booking_request_id', type: 'uuid' })
  bookingRequestId: string;

  @ApiProperty()
  @Column({ name: 'business_service_id', type: 'uuid' })
  businessServiceId: string;

  @ApiProperty({ description: 'Quantity of this service requested' })
  @Column({ name: 'quantity', type: 'int', default: 1 })
  quantity: number;

  @ApiProperty({ description: 'Estimated price for this service (custom price from business service)' })
  @Column({ name: 'estimated_price', type: 'decimal', precision: 10, scale: 2 })
  estimatedPrice: number;

  @ApiProperty({ description: 'Estimated duration for this service in minutes (custom duration from business service)' })
  @Column({ name: 'estimated_duration', type: 'int' })
  estimatedDuration: number;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => BookingRequest, (bookingRequest) => bookingRequest.bookingRequestServices)
  @JoinColumn({ name: 'booking_request_id' })
  bookingRequest: BookingRequest;

  @ManyToOne(() => BusinessService, (businessService) => businessService.id)
  @JoinColumn({ name: 'business_service_id' })
  businessService: BusinessService;
}