import { ApiResponseDto } from '../../common/dto/api-response.dto';
export declare class BusinessServiceDto {
    id: string;
    serviceId: string;
    serviceName: string;
    serviceDescription?: string;
    serviceCategoryName?: string;
    defaultPrice?: number;
    defaultDurationMinutes?: number;
    customPrice?: number;
    customDurationMinutes?: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class BusinessServicesResponseDto extends ApiResponseDto<BusinessServiceDto[]> {
    code: number;
    success: boolean;
    message: string;
    data: BusinessServiceDto[];
    constructor(code: number, success: boolean, message: string, data: BusinessServiceDto[]);
}
