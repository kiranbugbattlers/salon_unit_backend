import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

@Entity('refresh_tokens')
export class RefreshToken {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ name: 'user_id' })
  userId: string;

  @ApiProperty()
  @Column({ name: 'token_hash' })
  tokenHash: string;

  @ApiProperty()
  @Column({ name: 'expires_at' })
  expiresAt: Date;

  @ApiProperty()
  @Column({ name: 'is_revoked', default: false })
  isRevoked: boolean;

  @ApiProperty({ required: false })
  @Column({ name: 'device_info', nullable: true, type: 'text' })
  deviceInfo?: string;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.refreshTokens)
  @JoinColumn({ name: 'user_id' })
  user: User;
}