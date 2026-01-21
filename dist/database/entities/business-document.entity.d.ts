import { BusinessOwner } from './business-owner.entity';
import { DocumentType, DocumentStatus } from '../../common/enums/business-document.enum';
export declare class BusinessDocument {
    id: string;
    businessOwnerId: string;
    documentType: DocumentType;
    documentUrl: string;
    status: DocumentStatus;
    rejectionReason?: string;
    uploadedAt: Date;
    verifiedAt?: Date;
    updatedAt: Date;
    businessOwner: BusinessOwner;
}
