import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('otp_tokens')
export class OtpToken {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ length: 15 })
  phone: string;

  @ApiProperty()
  @Column({ name: 'otp_code', length: 10 })
  otpCode: string;

  @ApiProperty()
  @Column({ name: 'requested_role', length: 20, nullable: true })
  requestedRole: string;

  @ApiProperty()
  @Column({ name: 'expires_at' })
  expiresAt: Date;

  @ApiProperty()
  @Column({ name: 'is_used', default: false })
  isUsed: boolean;

  @ApiProperty()
  @Column({ default: 0 })
  attempts: number;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}