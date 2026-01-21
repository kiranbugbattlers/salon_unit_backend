import { ApprovalRequestDto } from './approval-request.dto';
import { PaginationMetaDto } from '../../common/dto/pagination.dto';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
export declare class ApprovalListDataDto {
    data: ApprovalRequestDto[];
    meta: PaginationMetaDto;
}
export declare class ApprovalListResponseDto extends ApiResponseDto<ApprovalListDataDto> {
    code: number;
    success: boolean;
    message: string;
    data: ApprovalListDataDto;
    constructor(code: number, success: boolean, message: string, data: ApprovalListDataDto);
}
