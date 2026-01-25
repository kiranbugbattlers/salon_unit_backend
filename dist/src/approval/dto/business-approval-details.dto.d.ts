import { BankingInfo } from '../../database/entities/banking-info.entity';
export declare class BusinessMediaDto {
    id: string;
    mediaUrl: string;
    mediaType: string;
    description?: string;
    isPrimary: boolean;
    createdAt: Date;
}
export declare class BusinessAddressDto {
    id: string;
    streetAddress: string;
    city: string;
    state: string;
    pincode: string;
    latitude?: number;
    longitude?: number;
    isPrimary: boolean;
    isActive: boolean;
}
export declare class BusinessOperatingHoursDto {
    dayOfWeek: string;
    openingTime: string;
    closingTime: string;
    isOpen: boolean;
}
export declare class BusinessDocumentDto {
    id: string;
    documentType: string;
    documentUrl: string;
    status: string;
    rejectionReason?: string;
    uploadedAt: Date;
    verifiedAt?: Date;
}
export declare class BankingInfoDto {
    id: string;
    bankName: string;
    accountHolderName: string;
    accountNumber?: string;
    ifscCode?: string;
    branchName?: string;
    isVerified: boolean;
    createdAt: Date;
}
export declare class ReviewDto {
    id: string;
    customerName: string;
    rating: number;
    comment?: string;
    reviewDate: Date;
    isVerifiedPurchase: boolean;
}
export declare class BusinessOwnerInfoDto {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    businessName: string;
    businessDescription?: string;
    isApproved: boolean;
    approvedAt?: Date;
    createdAt: Date;
    upiId?: string;
    creditLimit?: number;
    vendorStatus?: string;
}
export declare class BusinessInfoDto {
    id: string;
    name: string;
    description?: string;
    category?: string;
    phone?: string;
    email?: string;
    website?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class BusinessApprovalDetailsDto {
    businessOwner: BusinessOwnerInfoDto;
    business: BusinessInfoDto;
    media: BusinessMediaDto[];
    addresses: BusinessAddressDto[];
    operatingHours: BusinessOperatingHoursDto[];
    documents: BusinessDocumentDto[];
    bankingInfo: BankingInfo[];
    reviews: ReviewDto[];
}
export declare class BusinessApprovalListDto {
    data: BusinessApprovalDetailsDto[];
    meta: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}
export declare class UpdateBusinessApprovalDto {
    businessName?: string;
    businessDescription?: string;
    businessPhone?: string;
    businessEmail?: string;
    website?: string;
    businessCategory?: string;
    streetAddress?: string;
    city?: string;
    state?: string;
    pincode?: string;
    latitude?: number;
    longitude?: number;
    bankName?: string;
    accountHolderName?: string;
    ifscCode?: string;
    branchName?: string;
    approvalStatus?: string;
    reviewNotes?: string;
    rejectionReason?: string;
    upiId?: string;
    creditLimit?: number;
    vendorStatus?: string;
}
