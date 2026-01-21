import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../../common/enums';
import { CustomerOnboarding } from './customer-onboarding.entity';
import { User } from './user.entity';
import { Review } from './review.entity';

@Entity('customers')
export class Customer {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ name: 'user_id' })
  userId: string;

  @ApiProperty({ required: false })
  @Column({ name: 'first_name', length: 100, nullable: true })
  firstName?: string;

  @ApiProperty({ required: false })
  @Column({ name: 'last_name', length: 100, nullable: true })
  lastName?: string;

  @ApiProperty({ enum: Gender, required: false })
  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender?: Gender;

  @ApiProperty({ required: false })
  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth?: Date;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.customer)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Uncommented and fixed: The inverse side of the relationship
  // CustomerOnboarding has the @JoinColumn, so Customer doesn't need it
  @OneToOne(() => CustomerOnboarding, (onboarding) => onboarding.customer)
  onboarding?: CustomerOnboarding;

  @OneToMany(() => Review, (review) => review.customer)
  reviews: Review[];
}