import { ApiResponseDto } from '../../common/dto/api-response.dto';
export declare class ServiceCategoryResponseDto {
    id: string;
    name: string;
    description?: string;
}
export declare class BusinessOwnerInfoDto {
    id: string;
    shopId: string;
    businessName?: string;
    businessDescription?: string;
    isApproved: boolean;
}
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
export declare class ServiceItemDto {
    id: string;
    name: string;
    description?: string;
    basePrice?: number;
    customPrice: number;
    defaultDuration?: number;
    customDurationMinutes: number;
    availableAtHome: boolean;
    image?: string;
    gender?: string;
    category: ServiceCategoryResponseDto;
    businessOwner: BusinessOwnerInfoDto;
    businessAddress?: BusinessAddressDto;
    userSpecific?: {
        isFavorite?: boolean;
        lastBookedAt?: Date;
        bookingCount?: number;
    };
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class ServicesMetaDto {
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
        sort?: string;
    };
}
export declare class ServicesDataDto {
    services: ServiceItemDto[];
    meta: ServicesMetaDto;
}
export declare class ServicesResponseDto extends ApiResponseDto<ServicesDataDto> {
    code: number;
    success: boolean;
    message: string;
    data: ServicesDataDto;
    constructor(code: number, success: boolean, message: string, data: ServicesDataDto);
}
