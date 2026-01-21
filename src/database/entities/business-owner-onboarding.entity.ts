import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BusinessOwner } from './business-owner.entity';

@Entity('business_owner_onboarding')
export class BusinessOwnerOnboarding {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ name: 'business_owner_id' })
  businessOwnerId: string;

  @ApiProperty()
  @Column({ name: 'current_step', type: 'int', default: 1 })
  currentStep: number;

  @ApiProperty()
  @Column({ name: 'completed_steps', type: 'json', default: '[]' })
  completedSteps: number[];

  @ApiProperty()
  @Column({ name: 'is_completed', default: false })
  isCompleted: boolean;

  @ApiProperty({ required: false })
  @Column({ name: 'step1_data', type: 'json', nullable: true })
  step1Data?: any;

  @ApiProperty({ required: false })
  @Column({ name: 'step2_data', type: 'json', nullable: true })
  step2Data?: any;

  @ApiProperty({ required: false })
  @Column({ name: 'step3_data', type: 'json', nullable: true })
  step3Data?: any;

  @ApiProperty({ required: false })
  @Column({ name: 'step4_data', type: 'json', nullable: true })
  step4Data?: any;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => BusinessOwner, (businessOwner) => businessOwner.onboarding)
  @JoinColumn({ name: 'business_owner_id' })
  businessOwner: BusinessOwner;

  getProgressPercentage(): number {
    const totalSteps = 4;
    const completed = this.completedSteps.length;
    return Math.round((completed / totalSteps) * 100);
  }
}