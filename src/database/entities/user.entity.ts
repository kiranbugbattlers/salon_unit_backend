import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Customer } from './customer.entity';
import { BusinessOwner } from './business-owner.entity';
import { RefreshToken } from './refresh-token.entity';
import { UserRole } from './user-role.entity';
import { UserAddress } from './user-address.entity';

@Entity('users')
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ unique: true, length: 15, nullable: false, default: '' })
  phone: string;

  @ApiProperty({ required: false })
  @Column({ unique: true, nullable: true })
  email?: string;

  @ApiProperty({ required: false })
  @Column({ name: 'profile_pic', nullable: true, type: 'text' })
  profilePic?: string;

  @ApiProperty({ required: false })
  @Column({ name: 'profile_pic_cdn_url', nullable: true, type: 'text' })
  profilePicCdnUrl?: string;

  @ApiProperty({ required: false })
  @Column({ name: 'profile_pic_s3_key', nullable: true, type: 'text' })
  profilePicS3Key?: string;

  @ApiProperty()
  @Column({ name: 'is_phone_verified', default: false })
  isPhoneVerified: boolean;

  @ApiProperty()
  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified: boolean;

  @ApiProperty({ required: false })
  @Column({ name: 'fcm_token', nullable: true, type: 'text' })
  fcmToken?: string;

  @ApiProperty({ required: false })
  @Column({ name: 'device_type', nullable: true, length: 20 })
  deviceType?: string;

  @ApiProperty({ required: false })
  @Column({ name: 'device_id', nullable: true, length: 100 })
  deviceId?: string;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  roles: UserRole[];

  @OneToOne(() => Customer, (customer) => customer.user)
  customer: Customer;

  @OneToOne(() => BusinessOwner, (businessOwner) => businessOwner.user)
  businessOwner: BusinessOwner;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];

  @OneToMany(() => UserAddress, (userAddress) => userAddress.user)
  addresses: UserAddress[];
}