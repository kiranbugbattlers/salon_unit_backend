import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../../common/enums';
import { BusinessOwner } from './business-owner.entity';
import { StaffService } from './staff-service.entity';
import { StaffScheduleOverride } from './staff-schedule-override.entity';
import { StaffBreak } from './staff-break.entity';

@Entity('staff')
@Index(['businessOwnerId', 'isActive'])
export class Staff {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ name: 'business_owner_id', type: 'uuid' })
  businessOwnerId: string;

  @ApiProperty()
  @Column({ name: 'first_name', length: 50 })
  firstName: string;

  @ApiProperty()
  @Column({ name: 'last_name', length: 50 })
  lastName: string;

  @ApiProperty()
  @Column({ unique: true, length: 15 })
  phone: string;

  @ApiProperty({ required: false })
  @Column({ unique: true, nullable: true })
  email?: string;

  @ApiProperty()
  @Column({ name: 'date_of_birth', type: 'date' })
  dateOfBirth: Date;

  @ApiProperty({ enum: Gender })
  @Column({
    type: 'enum',
    enum: Gender,
  })
  gender: Gender;

  @ApiProperty({ required: false })
  @Column({ name: 'profile_pic', nullable: true, type: 'text' })
  profilePic?: string;

  @ApiProperty({ required: false })
  @Column({ name: 'profile_pic_cdn_url', nullable: true, type: 'text' })
  profilePicCdnUrl?: string;

  @ApiProperty({ required: false })
  @Column({ name: 'profile_pic_s3_key', nullable: true, type: 'text' })
  profilePicS3Key?: string;

  @ApiProperty()
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => BusinessOwner, (businessOwner) => businessOwner.staff)
  @JoinColumn({ name: 'business_owner_id' })
  businessOwner: BusinessOwner;

  @OneToMany(() => StaffService, (staffService) => staffService.staff)
  staffServices: StaffService[];

  @OneToMany(() => StaffScheduleOverride, (override) => override.staff)
  scheduleOverrides: StaffScheduleOverride[];

  @OneToMany(() => StaffBreak, (staffBreak) => staffBreak.staff)
  breaks: StaffBreak[];
}