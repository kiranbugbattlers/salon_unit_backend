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
import { AddressType } from '../../common/enums';
import { BusinessOwner } from './business-owner.entity';

@Entity('business_addresses')
export class BusinessAddress {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ name: 'business_owner_id' })
  businessOwnerId: string;

  @ApiProperty({ enum: AddressType })
  @Column({
    name: 'address_type',
    type: 'enum',
    enum: AddressType,
    default: AddressType.BUSINESS,
  })
  addressType: AddressType;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 8 })
  latitude: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 11, scale: 8 })
  longitude: number;

  @ApiProperty()
  @Column({ name: 'street_address', length: 500 })
  streetAddress: string;

  @ApiProperty({ required: false })
  @Column({ name: 'address_line1', length: 255, nullable: true })
  addressLine1?: string;

  @ApiProperty({ required: false })
  @Column({ name: 'address_line2', length: 255, nullable: true })
  addressLine2?: string;

  @ApiProperty({ required: false })
  @Column({ length: 100, nullable: true })
  landmark?: string;

  @ApiProperty()
  @Column({ length: 100 })
  city: string;

  @ApiProperty()
  @Column({ length: 100 })
  state: string;

  @ApiProperty()
  @Column({ name: 'postal_code', length: 20 })
  postalCode: string;

  @ApiProperty()
  @Column({ length: 100, default: 'India' })
  country: string;

  @ApiProperty()
  @Column({ name: 'is_primary', default: false })
  isPrimary: boolean;

  @ApiProperty()
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => BusinessOwner, (businessOwner) => businessOwner.addresses)
  @JoinColumn({ name: 'business_owner_id' })
  businessOwner: BusinessOwner;
}