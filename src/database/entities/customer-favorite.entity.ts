import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Customer } from './customer.entity';
import { BusinessOwner } from './business-owner.entity';

@Entity('customer_favorites')
@Unique('uq_customer_business_favorite', ['customerId', 'businessOwnerId'])
@Index(['customerId'])
@Index(['businessOwnerId'])
@Index(['createdAt'])
export class CustomerFavorite {
  @ApiProperty({
    description: 'Unique identifier for the favorite record',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Customer ID who favorited the business',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @ApiProperty({
    description: 'Business Owner ID that was favorited',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ name: 'business_owner_id', type: 'uuid' })
  businessOwnerId: string;

  @ApiProperty({
    description: 'Timestamp when the business was favorited',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the favorite record was last updated',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Customer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => BusinessOwner, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_owner_id' })
  businessOwner: BusinessOwner;
}
