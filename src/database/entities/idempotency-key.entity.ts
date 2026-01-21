import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('idempotency_keys')
@Index(['idempotencyKey', 'endpoint', 'userId'], { unique: true })
@Index(['expiresAt'])
export class IdempotencyKey {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'The idempotency key provided by the client' })
  @Column({ name: 'idempotency_key', length: 255 })
  idempotencyKey: string;

  @ApiProperty({ description: 'The API endpoint this key is for' })
  @Column({ name: 'endpoint', length: 255 })
  endpoint: string;

  @ApiProperty({ description: 'The user ID making the request' })
  @Column({ name: 'user_id', length: 255 })
  userId: string;

  @ApiProperty({ description: 'The original request payload' })
  @Column({ name: 'request_payload', type: 'jsonb' })
  requestPayload: any;

  @ApiProperty({ description: 'The response payload', required: false })
  @Column({ name: 'response_payload', type: 'jsonb', nullable: true })
  responsePayload?: any;

  @ApiProperty({
    enum: ['processing', 'completed', 'failed'],
    description: 'Current status of the request'
  })
  @Column({
    name: 'status',
    type: 'enum',
    enum: ['processing', 'completed', 'failed'],
    default: 'processing',
  })
  status: 'processing' | 'completed' | 'failed';

  @ApiProperty({ description: 'When the request was completed', required: false })
  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt?: Date;

  @ApiProperty({ description: 'When this key expires' })
  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
