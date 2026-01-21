import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BusinessOwner } from './business-owner.entity';

@Entity('business_settings')
export class BusinessSettings {
  @ApiProperty({ description: 'Business owner ID (primary key)' })
  @PrimaryColumn({ name: 'business_owner_id', type: 'uuid' })
  businessOwnerId: string;

  @ApiProperty({ description: 'Enable at-home service delivery charges', default: true })
  @Column({ name: 'delivery_charges_enabled', type: 'boolean', default: true })
  deliveryChargesEnabled: boolean;

  @ApiProperty({ description: 'Base delivery charge (fixed amount)', default: 0 })
  @Column({ name: 'base_delivery_charge', type: 'decimal', precision: 10, scale: 2, default: 0 })
  baseDeliveryCharge: number;

  @ApiProperty({ description: 'Charge per kilometer for distance-based pricing', default: 10 })
  @Column({ name: 'per_km_charge', type: 'decimal', precision: 10, scale: 2, default: 10 })
  perKmCharge: number;

  @ApiProperty({ description: 'Free delivery up to this distance (in km)', default: 5 })
  @Column({ name: 'free_delivery_upto_km', type: 'decimal', precision: 5, scale: 2, default: 5 })
  freeDeliveryUptoKm: number;

  @ApiProperty({ description: 'Maximum delivery distance allowed (in km)', default: 20 })
  @Column({ name: 'max_delivery_distance_km', type: 'decimal', precision: 5, scale: 2, default: 20 })
  maxDeliveryDistanceKm: number;

  @ApiProperty({ description: 'Minimum order amount for free delivery', default: 1000 })
  @Column({ name: 'free_delivery_above_amount', type: 'decimal', precision: 10, scale: 2, default: 1000 })
  freeDeliveryAboveAmount: number;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToOne(() => BusinessOwner)
  @JoinColumn({ name: 'business_owner_id' })
  businessOwner: BusinessOwner;
}
