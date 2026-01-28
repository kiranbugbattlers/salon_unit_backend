import { ApprovalStatus } from '../../common/enums';
export declare class ApprovalRequestDto {
    id: string;
    businessOwnerId: string;
    businessName: string;
    businessDescription: string;
    businessAddress: string;
    businessOwnerName: string;
    businessOwnerPhone: string;
    businessOwnerEmail?: string;
    assignedAgentId: string;
    assignedAgentName: string;
    status: ApprovalStatus;
    reviewNotes?: string;
    rejectionReason?: string;
    isAutoAssigned: boolean;
    distanceToAgentKm?: number;
    assignedByAdminId?: string;
    reviewedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    upiId?: string;
    creditLimit?: number;
    vendorStatus?: string;
    alternateNumber?: string;
    remark?: string;
}
