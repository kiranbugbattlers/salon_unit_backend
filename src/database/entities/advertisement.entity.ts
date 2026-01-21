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
import { Admin } from './admin.entity';
import { AdMediaType } from '../../common/enums';

@Entity('advertisements')
@Index(['isActive'])
@Index(['priority'])
@Index(['isActive', 'startDate', 'endDate'])
export class Advertisement {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Advertisement title for admin reference' })
  @Column({ name: 'title', length: 200 })
  title: string;

  @ApiProperty({ description: 'Optional description', required: false })
  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ enum: AdMediaType, description: 'Type of media (image or video)' })
  @Column({
    name: 'media_type',
    type: 'enum',
    enum: AdMediaType,
  })
  mediaType: AdMediaType;

  @ApiProperty({ description: 'S3 URL to the media file' })
  @Column({ name: 'media_url', type: 'text' })
  mediaUrl: string;

  @ApiProperty({ description: 'Optional URL to open when ad is clicked', required: false })
  @Column({ name: 'link_url', type: 'text', nullable: true })
  linkUrl?: string;

  @ApiProperty({
    description: 'Array of user types that should see this ad',
    example: ['customer', 'business_owner', 'staff'],
  })
  @Column({ name: 'target_user_types', type: 'jsonb' })
  targetUserTypes: string[];

  @ApiProperty({
    description: 'Screens where ad should appear for each user type',
    example: {
      customer: ['home', 'login'],
      business_owner: ['approval', 'subscription', 'home', 'login'],
      staff: ['home', 'login'],
    },
  })
  @Column({ name: 'target_screens', type: 'jsonb' })
  targetScreens: Record<string, string[]>;

  @ApiProperty({ description: 'Display priority (higher = shows first)', default: 0 })
  @Column({ name: 'priority', type: 'int', default: 0 })
  priority: number;

  @ApiProperty({ description: 'Whether ad is currently active', default: true })
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Number of times ad was viewed', default: 0 })
  @Column({ name: 'impression_count', type: 'int', default: 0 })
  impressionCount: number;

  @ApiProperty({ description: 'Number of times ad was clicked', default: 0 })
  @Column({ name: 'click_count', type: 'int', default: 0 })
  clickCount: number;

  @ApiProperty({ description: 'Date when ad becomes active', required: false })
  @Column({ name: 'start_date', type: 'timestamp', nullable: true })
  startDate?: Date;

  @ApiProperty({ description: 'Date when ad expires', required: false })
  @Column({ name: 'end_date', type: 'timestamp', nullable: true })
  endDate?: Date;

  @ApiProperty({ description: 'Admin who created this ad' })
  @Column({ name: 'created_by' })
  createdBy: string;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Admin, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  admin: Admin;
}
