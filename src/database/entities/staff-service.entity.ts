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
import { Staff } from './staff.entity';
import { Service } from './service.entity';

@Entity('staff_services')
@Index(['staffId', 'isActive'])
@Index(['serviceId', 'isActive'])
@Unique(['staffId', 'serviceId'])
export class StaffService {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ name: 'staff_id' })
  staffId: string;

  @ApiProperty()
  @Column({ name: 'service_id' })
  serviceId: string;

  @ApiProperty()
  @Column({ name: 'custom_price', type: 'decimal', precision: 10, scale: 2 })
  customPrice: number;

  @ApiProperty()
  @Column({ name: 'custom_duration_minutes', type: 'int' })
  customDurationMinutes: number;

  @ApiProperty()
  @Column({ name: 'is_active', default: true })
  @Index()
  isActive: boolean;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Staff, (staff) => staff.staffServices)
  @JoinColumn({ name: 'staff_id' })
  staff: Staff;

  @ManyToOne(() => Service, (service) => service.staffServices)
  @JoinColumn({ name: 'service_id' })
  service: Service;
}