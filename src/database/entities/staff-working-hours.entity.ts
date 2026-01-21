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
import { Staff } from './staff.entity';

@Entity('staff_working_hours')
@Index(['staffId', 'dayOfWeek', 'isActive'])
@Unique(['staffId', 'dayOfWeek'])
export class StaffWorkingHours {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ name: 'staff_id' })
  staffId: string;

  @ApiProperty({ description: 'Day of week (0=Sunday, 1=Monday, ..., 6=Saturday)' })
  @Column({ name: 'day_of_week', type: 'int' })
  @Index()
  dayOfWeek: number;

  @ApiProperty({ description: 'Start working time in HH:MM format' })
  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @ApiProperty({ description: 'End working time in HH:MM format' })
  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @ApiProperty({ description: 'Whether staff is available on this day' })
  @Column({ name: 'is_active', default: true })
  @Index()
  isActive: boolean;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Staff, (staff) => staff.id)
  @JoinColumn({ name: 'staff_id' })
  staff: Staff;
}