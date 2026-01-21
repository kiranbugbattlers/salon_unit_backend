import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Booking } from './booking.entity';
import { Customer } from './customer.entity';
import { BusinessOwner } from './business-owner.entity';

@Entity('reviews')
export class Review {
  @ApiProperty({ description: 'Unique identifier of the review' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID of the booking being reviewed' })
  @Column({ name: 'booking_id' })
  bookingId: string;

  @ApiProperty({ description: 'ID of the customer who wrote the review' })
  @Column({ name: 'customer_id' })
  customerId: string;

  @ApiProperty({ description: 'ID of the business owner being reviewed' })
  @Column({ name: 'business_owner_id' })
  businessOwnerId: string;

  @ApiProperty({ description: 'Rating given (1-5)' })
  @Column({ type: 'smallint' })
  rating: number;

  @ApiProperty({ description: 'Review comment', required: false })
  @Column({ type: 'text', nullable: true })
  comment?: string;

  @ApiProperty({ description: 'Whether the review is approved to be shown publicly' })
  @Column({ default: true })
  isApproved: boolean;

  @ApiProperty({ description: 'Date when the review was created' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Date when the review was last updated' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne('Booking', 'reviews', {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @ManyToOne(() => Customer, (customer) => customer.reviews)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => BusinessOwner, (businessOwner) => businessOwner.reviews)
  @JoinColumn({ name: 'business_owner_id' })
  businessOwner: BusinessOwner;
}
