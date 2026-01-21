import { ApprovalStatus } from '../../common/enums';
import { BusinessOwner } from './business-owner.entity';
import { Agent } from './agent.entity';
import { Admin } from './admin.entity';
export declare class BusinessApproval {
    id: string;
    businessOwnerId: string;
    assignedAgentId: string;
    assignedByAdminId?: string;
    status: ApprovalStatus;
    reviewNotes?: string;
    adminRemarks?: string;
    rejectionReason?: string;
    isAutoAssigned: boolean;
    distanceToAgentKm?: number;
    reviewedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    businessOwner: BusinessOwner;
    assignedAgent: Agent;
    assignedByAdmin?: Admin;
    get isCompleted(): boolean;
}
