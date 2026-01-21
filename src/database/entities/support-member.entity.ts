import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../../common/enums';
import { Admin } from './admin.entity';
import { CustomerSupportMapping } from './customer-support-mapping.entity';

@Entity('support_members')
@Index(['email'], { unique: true })
@Index(['phone'], { unique: true })
@Index(['isActive'])
@Index(['customerCount'])
export class SupportMember {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'First name of support member' })
  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @ApiProperty({ description: 'Last name of support member' })
  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @ApiProperty({ description: 'Email address', uniqueItems: true })
  @Column({ name: 'email', unique: true })
  email: string;

  @ApiProperty({ description: 'Phone number', uniqueItems: true })
  @Column({ name: 'phone', unique: true, length: 20 })
  phone: string;

  @ApiProperty({ description: 'Profile picture S3 URL', required: false })
  @Column({ name: 'profile_pic', type: 'text', nullable: true })
  profilePic?: string;

  @ApiProperty({ description: 'Date of birth', required: false })
  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth?: Date;

  @ApiProperty({ enum: Gender, description: 'Gender', required: false })
  @Column({
    name: 'gender',
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender?: Gender;

  @ApiProperty({ description: 'Active status', default: true })
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Number of customers assigned', default: 0 })
  @Column({ name: 'customer_count', type: 'int', default: 0 })
  customerCount: number;

  @ApiProperty({ description: 'Joining date' })
  @Column({ name: 'joining_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  joiningDate: Date;

  @ApiProperty({ description: 'Admin who created this member' })
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

  @OneToMany(() => CustomerSupportMapping, (mapping) => mapping.supportMember)
  customerMappings: CustomerSupportMapping[];

  // Virtual property
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
