import { ApprovalStatus } from '../../common/enums';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
export declare class AgentInfo {
    id: string;
    name: string;
    email?: string;
    phone?: string;
}
export declare class BusinessApprovalStatusDataDto {
    hasApprovalRequested: boolean;
    status?: ApprovalStatus;
    isApproved: boolean;
    assignedAgent?: AgentInfo;
    rejectionReason?: string;
    requestedAt?: Date;
    statusMessage: string;
}
export declare class BusinessApprovalStatusDto extends ApiResponseDto<BusinessApprovalStatusDataDto> {
    code: number;
    success: boolean;
    message: string;
    data: BusinessApprovalStatusDataDto;
    constructor(code: number, success: boolean, message: string, data: BusinessApprovalStatusDataDto);
}
