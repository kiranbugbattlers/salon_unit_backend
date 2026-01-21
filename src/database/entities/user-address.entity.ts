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
import { User } from './user.entity';

@Entity('user_addresses')
export class UserAddress {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ name: 'user_id' })
  userId: string;

  @ApiProperty({ enum: AddressType })
  @Column({
    name: 'address_type',
    type: 'enum',
    enum: AddressType,
    default: AddressType.HOME,
  })
  addressType: AddressType;

  @ApiProperty({ required: false })
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude?: number;

  @ApiProperty({ required: false })
  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude?: number;

  @ApiProperty()
  @Column({ name: 'street_address' })
  streetAddress: string;

  @ApiProperty()
  @Column({ name: 'address_line_1' })
  addressLine1: string;

  @ApiProperty({ required: false })
  @Column({ name: 'address_line_2', nullable: true })
  addressLine2?: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
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

  @ManyToOne(() => User, (user) => user.addresses)
  @JoinColumn({ name: 'user_id' })
  user: User;
}