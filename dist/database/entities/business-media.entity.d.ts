import { MediaType } from '../../common/enums';
import { BusinessOwner } from './business-owner.entity';
export declare class BusinessMedia {
    id: string;
    businessOwnerId: string;
    mediaType: MediaType;
    mediaUrl: string;
    cdnUrl?: string;
    s3Key?: string;
    thumbnailUrl?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    displayOrder: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    businessOwner: BusinessOwner;
}
