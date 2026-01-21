import { DocumentType, DocumentStatus } from '../../common/enums/business-document.enum';
export declare class BusinessDocumentResponseDto {
    id: string;
    businessOwnerId: string;
    documentType: DocumentType;
    documentUrl: string;
    status: DocumentStatus;
    rejectionReason?: string;
    uploadedAt: Date;
    verifiedAt?: Date;
}
export declare class BusinessDocumentListResponseDto {
    documents: BusinessDocumentResponseDto[];
    allRequiredUploaded: boolean;
}
