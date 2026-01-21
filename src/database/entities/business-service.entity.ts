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
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BusinessOwner } from './business-owner.entity';
import { Service } from './service.entity';
import { ServicePackageItem } from './service-package-item.entity';

@Entity('business_services')
@Index(['businessOwnerId', 'isActive'])
@Index(['serviceId', 'isActive'])
@Unique(['businessOwnerId', 'serviceId'])
export class BusinessService {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ name: 'business_owner_id', type: 'uuid' })
  businessOwnerId: string;

  @ApiProperty()
  @Column({ name: 'service_id', type: 'uuid' })
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

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => BusinessOwner, (businessOwner) => businessOwner.businessServices)
  @JoinColumn({ name: 'business_owner_id' })
  businessOwner: BusinessOwner;

  @ManyToOne(() => Service, (service) => service.businessServices)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @OneToMany(() => ServicePackageItem, (packageItem) => packageItem.businessService)
  packageItems: ServicePackageItem[];
}