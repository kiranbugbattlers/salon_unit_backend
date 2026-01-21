import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { StaffOverrideType } from '../../common/enums';
import { Staff } from './staff.entity';

@Entity('staff_schedule_overrides')
@Index(['staffId', 'date'])
@Unique(['staffId', 'date'])
export class StaffScheduleOverride {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ name: 'staff_id' })
  staffId: string;

  @ApiProperty()
  @Column({ type: 'date' })
  @Index()
  date: Date;

  @ApiProperty({ enum: StaffOverrideType })
  @Column({
    name: 'override_type',
    type: 'enum',
    enum: StaffOverrideType,
  })
  overrideType: StaffOverrideType;

  @ApiProperty({ required: false })
  @Column({ name: 'start_time', type: 'time', nullable: true })
  startTime?: string;

  @ApiProperty({ required: false })
  @Column({ name: 'end_time', type: 'time', nullable: true })
  endTime?: string;

  @ApiProperty({ required: false })
  @Column({ length: 255, nullable: true })
  reason?: string;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Staff, (staff) => staff.scheduleOverrides)
  @JoinColumn({ name: 'staff_id' })
  staff: Staff;
}