import { ApiResponseDto } from '../../common/dto/api-response.dto';
export declare class ServicePackageItemDto {
    businessServiceId: string;
}
export declare class CreateServicePackageDto {
    name: string;
    description?: string;
    discountPercentage: number;
    services: ServicePackageItemDto[];
}
export declare class UpdateServicePackageDto {
    name?: string;
    description?: string;
    discountPercentage?: number;
    services?: ServicePackageItemDto[];
}
export declare class ServicePackageItemResponseDto {
    id: string;
    businessServiceId: string;
    serviceName: string;
    serviceDescription?: string;
    serviceCategoryName: string;
    defaultPrice: number;
    customPrice: number;
    defaultDurationMinutes: number;
    customDurationMinutes: number;
    effectiveDurationMinutes: number;
    finalPrice: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare class ServicePackageResponseDto {
    id: string;
    name: string;
    description?: string;
    discountPercentage: number;
    totalOriginalPrice: number;
    totalDiscountedPrice: number;
    totalSavings: number;
    totalDurationMinutes: number;
    serviceCount: number;
    isActive: boolean;
    services: ServicePackageItemResponseDto[];
    createdAt: Date;
    updatedAt: Date;
}
export declare class ServicePackageListDataDto {
    packages: ServicePackageResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare class ServicePackageListResponseDto extends ApiResponseDto<ServicePackageListDataDto> {
    code: number;
    success: boolean;
    message: string;
    data: ServicePackageListDataDto;
    constructor(code: number, success: boolean, message: string, data: ServicePackageListDataDto);
}
export declare class ServicePackageResponseWrapperDto extends ApiResponseDto<ServicePackageResponseDto> {
    code: number;
    success: boolean;
    message: string;
    data: ServicePackageResponseDto;
    constructor(code: number, success: boolean, message: string, data: ServicePackageResponseDto);
}
export declare class ServicePackageDeleteResponseDto extends ApiResponseDto {
    code: number;
    success: boolean;
    message: string;
    constructor(code?: number, success?: boolean, message?: string);
}
