import { ApiProperty } from '@nestjs/swagger';
import { DocumentType, DocumentStatus } from '../../common/enums/business-document.enum';

export class UploadBusinessDocumentDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Document file (jpg, png, webp, pdf)',
  })
  file: any;
}

export class BusinessDocumentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  businessOwnerId: string;

  @ApiProperty({ enum: DocumentType })
  documentType: DocumentType;

  @ApiProperty()
  documentUrl: string;

  @ApiProperty({ enum: DocumentStatus })
  status: DocumentStatus;

  @ApiProperty({ required: false })
  rejectionReason?: string;

  @ApiProperty()
  uploadedAt: Date;

  @ApiProperty({ required: false })
  verifiedAt?: Date;
}

export class BusinessDocumentListResponseDto {
  @ApiProperty({ type: [BusinessDocumentResponseDto] })
  documents: BusinessDocumentResponseDto[];

  @ApiProperty()
  allRequiredUploaded: boolean;
}
