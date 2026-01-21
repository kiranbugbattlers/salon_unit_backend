import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BusinessOwner } from './business-owner.entity';
import { DocumentType, DocumentStatus } from '../../common/enums/business-document.enum';

@Entity('business_documents')
export class BusinessDocument {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ name: 'business_owner_id' })
  businessOwnerId: string;

  @ApiProperty({ enum: DocumentType })
  @Column({
    name: 'document_type',
    type: 'enum',
    enum: DocumentType,
  })
  documentType: DocumentType;

  @ApiProperty()
  @Column({ name: 'document_url', type: 'text' })
  documentUrl: string;

  @ApiProperty({ enum: DocumentStatus })
  @Column({
    name: 'status',
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PENDING,
  })
  status: DocumentStatus;

  @ApiProperty({ required: false })
  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason?: string;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  uploadedAt: Date;

  @ApiProperty({ required: false })
  @Column({ name: 'verified_at', type: 'timestamp', nullable: true })
  verifiedAt?: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => BusinessOwner, (businessOwner) => businessOwner.documents)
  @JoinColumn({ name: 'business_owner_id' })
  businessOwner: BusinessOwner;
}
