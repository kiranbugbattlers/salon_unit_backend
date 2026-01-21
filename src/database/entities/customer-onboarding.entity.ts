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
import { Customer } from './customer.entity';

@Entity('customer_onboarding')
export class CustomerOnboarding {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ name: 'customer_id' })
  customerId: string;

  @ApiProperty()
  @Column({ name: 'current_step', default: 1 })
  currentStep: number;

  @ApiProperty()
  @Column({ name: 'completed_steps', type: 'int', array: true, default: [] })
  completedSteps: number[];

  @ApiProperty()
  @Column({ name: 'is_completed', default: false })
  isCompleted: boolean;

  @ApiProperty({ required: false })
  @Column({ name: 'step_1_data', type: 'jsonb', nullable: true })
  step1Data?: Record<string, any>;

  @ApiProperty({ required: false })
  @Column({ name: 'step_2_data', type: 'jsonb', nullable: true })
  step2Data?: Record<string, any>;

  @ApiProperty({ required: false })
  @Column({ name: 'step_3_data', type: 'jsonb', nullable: true })
  step3Data?: Record<string, any>;

  @ApiProperty({ required: false })
  @Column({ name: 'step_4_data', type: 'jsonb', nullable: true })
  step4Data?: Record<string, any>;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => Customer, (customer) => customer.onboarding)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  getProgressPercentage(): number {
    return (this.completedSteps.length / 4) * 100;
  }
}