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
import { MediaType } from '../../common/enums';
import { BusinessOwner } from './business-owner.entity';

@Entity('business_media')
export class BusinessMedia {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ name: 'business_owner_id' })
  businessOwnerId: string;

  @ApiProperty({ enum: MediaType })
  @Column({
    name: 'media_type',
    type: 'enum',
    enum: MediaType,
  })
  mediaType: MediaType;

  @ApiProperty()
  @Column({ name: 'media_url', type: 'text' })
  mediaUrl: string;

  @ApiProperty({ required: false })
  @Column({ name: 'cdn_url', type: 'text', nullable: true })
  cdnUrl?: string;

  @ApiProperty({ required: false })
  @Column({ name: 's3_key', type: 'text', nullable: true })
  s3Key?: string;

  @ApiProperty({ required: false })
  @Column({ name: 'thumbnail_url', type: 'text', nullable: true })
  thumbnailUrl?: string;

  @ApiProperty({ required: false })
  @Column({ name: 'file_name', length: 255, nullable: true })
  fileName?: string;

  @ApiProperty({ required: false })
  @Column({ name: 'file_size', type: 'bigint', nullable: true })
  fileSize?: number;

  @ApiProperty({ required: false })
  @Column({ name: 'mime_type', length: 100, nullable: true })
  mimeType?: string;

  @ApiProperty()
  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  @ApiProperty()
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

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