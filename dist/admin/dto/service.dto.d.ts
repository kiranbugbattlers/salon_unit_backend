import { ServiceCategoryResponseDto } from './service-category.dto';
import { ServiceGenderEnum } from '../../common/enums/service-gender.enum';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
export declare class CreateServiceDto {
    categoryId: string;
    name: string;
    description?: string;
    image?: string;
    basePrice?: number;
    defaultDuration?: number;
    availableAtHome?: boolean;
    gender?: ServiceGenderEnum;
    isActive?: boolean;
}
export declare class UpdateServiceDto {
    categoryId?: string;
    name?: string;
    description?: string;
    image?: string;
    basePrice?: number;
    defaultDuration?: number;
    availableAtHome?: boolean;
    gender?: ServiceGenderEnum;
    isActive?: boolean;
}
export declare class ServiceResponseDto {
    id: string;
    name: string;
    description?: string;
    image?: string;
    basePrice?: number;
    defaultDuration?: number;
    availableAtHome: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    category: ServiceCategoryResponseDto;
    gender: ServiceGenderEnum;
}
export declare class ServiceListResponseDto {
    data: ServiceResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare class ServiceInCategoryDto {
    id: string;
    name: string;
    description?: string;
    image?: string;
    basePrice?: number;
    defaultDuration?: number;
    availableAtHome: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    gender: ServiceGenderEnum;
}
export declare class CategoryWithServicesDto {
    id: string;
    name: string;
    description?: string;
    image?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    services: ServiceInCategoryDto[];
}
export declare class ServicesGroupedByCategoryDataDto {
    categories: CategoryWithServicesDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare class ServicesGroupedByCategoryResponseDto extends ApiResponseDto<ServicesGroupedByCategoryDataDto> {
    code: number;
    success: boolean;
    message: string;
    data: ServicesGroupedByCategoryDataDto;
    constructor(code: number, success: boolean, message: string, data: ServicesGroupedByCategoryDataDto);
}
