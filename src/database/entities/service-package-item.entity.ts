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
import { ServicePackage } from './service-package.entity';
import { BusinessService } from './business-service.entity';

@Entity('service_package_items')
@Index(['packageId'])
@Index(['businessServiceId'])
@Unique(['packageId', 'businessServiceId'])
export class ServicePackageItem {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ name: 'package_id' })
  packageId: string;

  @ApiProperty()
  @Column({ name: 'business_service_id' })
  businessServiceId: string;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => ServicePackage, (servicePackage) => servicePackage.packageItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'package_id' })
  servicePackage: ServicePackage;

  @ManyToOne(() => BusinessService, (businessService) => businessService.packageItems)
  @JoinColumn({ name: 'business_service_id' })
  businessService: BusinessService;
}