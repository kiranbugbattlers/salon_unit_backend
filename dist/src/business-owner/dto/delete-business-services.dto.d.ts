import { ApiResponseDto } from '../../common/dto/api-response.dto';
export declare class DeleteBusinessServicesDto {
    businessServiceIds: string[];
}
export declare class DeletedBusinessServiceDto {
    id: string;
    reason?: string;
}
export declare class DeleteBusinessServicesDataDto {
    deleted: string[];
    failed: DeletedBusinessServiceDto[];
    total: number;
}
export declare class DeleteBusinessServicesResponseDto extends ApiResponseDto<DeleteBusinessServicesDataDto> {
    code: number;
    success: boolean;
    message: string;
    data: DeleteBusinessServicesDataDto;
    constructor(code: number, success: boolean, message: string, data: DeleteBusinessServicesDataDto);
}
