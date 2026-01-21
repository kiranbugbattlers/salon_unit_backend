import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { BusinessAddressDto, BusinessMediaDto } from './business-response.dto';
import { ServicePackageResponseDto } from '../../business-owner/dto';
import { ServiceLocationType } from '../../common/enums/service-location-type.enum';
export declare class ServiceCategoryDto {
    id: string;
    name: string;
    description?: string;
}
export declare class BusinessServiceDetailDto {
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
    category: ServiceCategoryDto;
    isActive: boolean;
}
export declare class StaffDetailDto {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: string;
    profilePic?: string;
    profilePicCdnUrl?: string;
    serviceIds: string[];
}
export declare class BusinessDetailDto {
    id: string;
    shopId: string;
    businessName?: string;
    businessDescription?: string;
    operatingYears?: number;
    isApproved: boolean;
    approvedAt?: Date;
    businessAddress?: BusinessAddressDto;
    businessMedia?: BusinessMediaDto[];
    services: BusinessServiceDetailDto[];
    servicePackages?: ServicePackageResponseDto[];
    staff: StaffDetailDto[];
    priceRange?: {
        min: number;
        max: number;
    };
    averageRating?: number;
    reviewCount?: number;
    userSpecific?: {
        isFavorite?: boolean;
        lastVisitedAt?: Date;
        bookingCount?: number;
    };
    closedDays?: number[];
    operatingHours?: {
        dayOfWeek: number;
        openTime: string;
        closeTime: string;
    }[];
    serviceLocationType?: ServiceLocationType;
}
export declare class BusinessDetailResponseDto extends ApiResponseDto<BusinessDetailDto> {
    code: number;
    success: boolean;
    message: string;
    data: BusinessDetailDto;
    constructor(code: number, success: boolean, message: string, data: BusinessDetailDto);
}
