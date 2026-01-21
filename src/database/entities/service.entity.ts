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
import { ServiceCategory } from './service-category.entity';
import { StaffService } from './staff-service.entity';
import { BusinessService } from './business-service.entity';
import { ServiceGenderEnum } from '../../common/enums/service-gender.enum';

@Entity('services')
@Index(['categoryId', 'isActive'])
export class Service {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ name: 'category_id' })
  @Index()
  categoryId: string;

  @ApiProperty()
  @Column({ length: 150 })
  name: string;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ required: false })
  @Column({ name: 'base_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  basePrice?: number;

  @ApiProperty({ required: false })
  @Column({ name: 'default_duration', type: 'int', nullable: true })
  defaultDuration?: number;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  image?: string;

  @Column({ name: 'image_s3_key', type: 'text', nullable: true })
  imageS3Key?: string;

  @ApiProperty()
  @Column({ name: 'available_at_home', default: false })
  availableAtHome: boolean;

  @ApiProperty()
  @Column({ name: 'is_active', default: true })
  @Index()
  isActive: boolean;

  @ApiProperty({ enum: ServiceGenderEnum })
  @Column({
    type: 'enum',
    enum: ServiceGenderEnum,
    nullable: true,
    comment: 'Gender this service is available for: male, female, or both'
  })
  gender?: ServiceGenderEnum;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => ServiceCategory, (category) => category.services)
  @JoinColumn({ name: 'category_id' })
  category: ServiceCategory;

  @OneToMany(() => StaffService, (staffService) => staffService.service)
  staffServices: StaffService[];

  @OneToMany(() => BusinessService, (businessService) => businessService.service)
  businessServices: BusinessService[];
}