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
import { BusinessOwner } from './business-owner.entity';
import { ServicePackageItem } from './service-package-item.entity';

@Entity('service_packages')
@Index(['businessOwnerId', 'isActive'])
export class ServicePackage {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ name: 'business_owner_id' })
  businessOwnerId: string;

  @ApiProperty()
  @Column({ name: 'name', length: 255 })
  name: string;

  @ApiProperty({ required: false })
  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @ApiProperty()
  @Column({
    name: 'discount_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0
  })
  discountPercentage: number;

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

  @ManyToOne(() => BusinessOwner, (businessOwner) => businessOwner.servicePackages)
  @JoinColumn({ name: 'business_owner_id' })
  businessOwner: BusinessOwner;

  @OneToMany(() => ServicePackageItem, (packageItem) => packageItem.servicePackage, {
    cascade: true,
  })
  packageItems: ServicePackageItem[];
}