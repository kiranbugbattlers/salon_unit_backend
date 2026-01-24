import { ApiResponseDto } from '../../common/dto/api-response.dto';
export declare class CreateServiceCategoryDto {
    name: string;
    description?: string;
    image?: string;
    isActive?: boolean;
}
export declare class UpdateServiceCategoryDto {
    name?: string;
    description?: string;
    image?: string;
    isActive?: boolean;
}
export declare class ServiceCategoryResponseDto {
    id: string;
    name: string;
    description?: string;
    image?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class ServiceCategoryListResponseDto {
    categories: ServiceCategoryResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare class ServiceCategoryApiResponseDto extends ApiResponseDto<ServiceCategoryResponseDto> {
    code: number;
    success: boolean;
    message: string;
    data: ServiceCategoryResponseDto;
    constructor(code: number, success: boolean, message: string, data: ServiceCategoryResponseDto);
}
export declare class ServiceCategoryListApiResponseDto extends ApiResponseDto<ServiceCategoryListResponseDto> {
    code: number;
    success: boolean;
    message: string;
    data: ServiceCategoryListResponseDto;
    constructor(code: number, success: boolean, message: string, data: ServiceCategoryListResponseDto);
}
