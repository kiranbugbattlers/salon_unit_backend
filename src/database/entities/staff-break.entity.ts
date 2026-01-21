import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BreakType } from '../../common/enums';
import { Staff } from './staff.entity';

@Entity('staff_breaks')
@Index(['staffId', 'dayOfWeek', 'isActive'])
export class StaffBreak {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ name: 'staff_id' })
  staffId: string;

  @ApiProperty({ description: '0=Sunday, 1=Monday, ..., 6=Saturday' })
  @Column({ name: 'day_of_week', type: 'int' })
  @Index()
  dayOfWeek: number;

  @ApiProperty()
  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @ApiProperty()
  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @ApiProperty({ enum: BreakType })
  @Column({
    name: 'break_type',
    type: 'enum',
    enum: BreakType,
  })
  breakType: BreakType;

  @ApiProperty()
  @Column({ name: 'is_recurring', default: true })
  isRecurring: boolean;

  @ApiProperty()
  @Column({ name: 'is_active', default: true })
  @Index()
  isActive: boolean;

  @ApiProperty({ required: false })
  @Column({ name: 'effective_from', type: 'date', nullable: true })
  effectiveFrom?: Date;

  @ApiProperty({ required: false })
  @Column({ name: 'effective_to', type: 'date', nullable: true })
  effectiveTo?: Date;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Staff, (staff) => staff.breaks)
  @JoinColumn({ name: 'staff_id' })
  staff: Staff;
}