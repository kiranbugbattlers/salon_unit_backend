import { ApiResponseDto } from '../../common/dto/api-response.dto';
export declare class BusinessAddressDto {
    id: string;
    streetAddress: string;
    addressLine1?: string;
    addressLine2?: string;
    landmark?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    latitude?: number;
    longitude?: number;
    distance?: number;
}
export declare class BusinessMediaDto {
    id: string;
    mediaUrl: string;
    mediaCdnUrl?: string;
    mediaType: string;
    description?: string;
}
export declare class BusinessItemDto {
    id: string;
    shopId: string;
    businessName?: string;
    businessDescription?: string;
    operatingYears?: number;
    isApproved: boolean;
    approvedAt?: Date;
    businessAddress?: BusinessAddressDto;
    businessMedia?: BusinessMediaDto[];
    averageRating?: number;
    reviewCount?: number;
    userSpecific?: {
        isFavorite?: boolean;
        lastVisitedAt?: Date;
        bookingCount?: number;
    };
    createdAt: Date;
    updatedAt: Date;
}
export declare class BusinessMetaDto {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    filters?: {
        location?: {
            lat: number;
            lng: number;
            radius: number;
        };
        category?: string;
        priceRange?: {
            min?: number;
            max?: number;
        };
        availableAtHome?: boolean;
        operatingYears?: {
            min?: number;
        };
        search?: string;
        sort?: string;
    };
}
export declare class BusinessDataDto {
    businesses: BusinessItemDto[];
    meta: BusinessMetaDto;
}
export declare class BusinessResponseDto extends ApiResponseDto<BusinessDataDto> {
    code: number;
    success: boolean;
    message: string;
    data: BusinessDataDto;
    constructor(code: number, success: boolean, message: string, data: BusinessDataDto);
}
