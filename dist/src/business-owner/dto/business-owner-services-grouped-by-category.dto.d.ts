import { ServiceGenderEnum } from '../../common/enums/service-gender.enum';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
export declare class BusinessOwnerServiceInCategoryDto {
    id: string;
    serviceId: string;
    name: string;
    description?: string;
    image?: string;
    defaultPrice: number;
    defaultDurationMinutes: number;
    customPrice: number;
    customDurationMinutes: number;
    availableAtHome: boolean;
    isActive: boolean;
    gender: ServiceGenderEnum;
    createdAt: Date;
    updatedAt: Date;
}
export declare class BusinessOwnerCategoryWithServicesDto {
    id: string;
    name: string;
    description?: string;
    image?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    services: BusinessOwnerServiceInCategoryDto[];
}
export declare class BusinessOwnerServicesGroupedByCategoryDataDto {
    categories: BusinessOwnerCategoryWithServicesDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare class BusinessOwnerServicesGroupedByCategoryResponseDto extends ApiResponseDto {
    data: BusinessOwnerServicesGroupedByCategoryDataDto;
}
