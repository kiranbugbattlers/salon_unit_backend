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
import { BusinessOwner } from './business-owner.entity';

@Entity('business_operating_hours')
@Index(['businessOwnerId', 'dayOfWeek'])
@Unique(['businessOwnerId', 'dayOfWeek'])
export class BusinessOperatingHours {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ name: 'business_owner_id' })
  businessOwnerId: string;

  @ApiProperty({ description: 'Day of week (0=Sunday, 1=Monday, ..., 6=Saturday)' })
  @Column({ name: 'day_of_week', type: 'int' })
  @Index()
  dayOfWeek: number;

  @ApiProperty({ description: 'Opening time in 24-hour format (HH:MM)' })
  @Column({ name: 'open_time', type: 'time' })
  openTime: string;

  @ApiProperty({ description: 'Closing time in 24-hour format (HH:MM)' })
  @Column({ name: 'close_time', type: 'time' })
  closeTime: string;

  @ApiProperty({ description: 'Whether business is closed on this day' })
  @Column({ name: 'is_closed', default: false })
  isClosed: boolean;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => BusinessOwner, (businessOwner) => businessOwner.id)
  @JoinColumn({ name: 'business_owner_id' })
  businessOwner: BusinessOwner;
}