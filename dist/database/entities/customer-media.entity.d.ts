import { MediaType } from '../../common/enums';
import { Customer } from './customer.entity';
export declare class CustomerMedia {
    id: string;
    customerId: string;
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
    description?: string;
    createdAt: Date;
    updatedAt: Date;
    customer: Customer;
}
