import { Repository } from 'typeorm';
import { ApprovalService } from './approval.service';
import { ApprovalStatus } from '../common/enums';
import { BusinessOwner } from '../database/entities';
import { ApprovalRequestDto, ApproveBusinessDto, RejectBusinessDto, ApprovalListResponseDto, BusinessApprovalStatusDto, SendApprovalRequestResponseDto } from './dto';
import { ApiResponseDto } from '../common/dto/api-response.dto';
export declare class ApprovalController {
    private approvalService;
    private businessOwnerRepository;
    constructor(approvalService: ApprovalService, businessOwnerRepository: Repository<BusinessOwner>);
    getAgentApprovalRequests(req: any, page?: string, limit?: string, status?: ApprovalStatus): Promise<ApprovalListResponseDto>;
    getApprovalRequest(id: string): Promise<ApprovalRequestDto>;
    approveBusiness(id: string, approveDto: ApproveBusinessDto, req: any): Promise<ApiResponseDto<null>>;
    rejectBusiness(id: string, rejectDto: RejectBusinessDto, req: any): Promise<ApiResponseDto<null>>;
    getBusinessApprovalStatus(req: any): Promise<BusinessApprovalStatusDto>;
    sendApprovalRequest(businessOwnerId: string): Promise<SendApprovalRequestResponseDto>;
    getPendingBusinessApprovals(page?: string, limit?: string): Promise<ApprovalListResponseDto>;
    getAllBusinessApprovals(page?: string, limit?: string, status?: ApprovalStatus): Promise<ApprovalListResponseDto>;
    adminApproveBusiness(businessOwnerId: string, approveDto: ApproveBusinessDto, req: any): Promise<ApiResponseDto<null>>;
    adminRejectBusiness(businessOwnerId: string, rejectDto: RejectBusinessDto, req: any): Promise<ApiResponseDto<null>>;
    getAllBusinessesWithDetails(page?: string, limit?: string, status?: ApprovalStatus): Promise<any>;
    getBusinessByIdWithDetails(businessOwnerId: string): Promise<any>;
    updateBusinessApprovalDetails(businessOwnerId: string, updateDto: any, req: any): Promise<any>;
    getApprovedBusinessOwners(page?: string, limit?: string): Promise<any>;
    getApprovedBusinessOwnerById(id: string): Promise<any>;
}
