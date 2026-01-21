import { ApiResponseDto } from '../../common/dto/api-response.dto';
export declare class BusinessAddressInfoDto {
    id: string;
    addressType: string;
    latitude: number;
    longitude: number;
    streetAddress: string;
    addressLine1?: string;
    addressLine2?: string;
    landmark?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isPrimary: boolean;
    isActive: boolean;
}
export declare class BusinessMediaInfoDto {
    id: string;
    mediaType: string;
    mediaUrl: string;
    cdnUrl?: string;
    thumbnailUrl?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    displayOrder: number;
    createdAt: Date;
}
export declare class BusinessInfoDto {
    id: string;
    userId: string;
    shopId: string;
    businessName?: string;
    businessDescription?: string;
    operatingYears?: number;
    isApproved: boolean;
    approvedAt?: Date;
    address?: BusinessAddressInfoDto;
    media?: BusinessMediaInfoDto[];
    averageRating?: number;
    reviewCount: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare class BusinessInfoResponseDto extends ApiResponseDto<BusinessInfoDto> {
    code: number;
    success: boolean;
    message: string;
    data: BusinessInfoDto;
    constructor(code: number, success: boolean, message: string, data: BusinessInfoDto);
}
