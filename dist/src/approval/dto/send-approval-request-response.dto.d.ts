export declare class AssignedAgentDto {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    employeeId?: string;
    department?: string;
    distanceKm?: number;
}
export declare class AssignedAdminDto {
    id: string;
    name: string;
    email?: string;
    username: string;
}
export declare class ApprovalRequestInfoDto {
    id: string;
    businessOwnerId: string;
    businessName: string;
    businessAddress: string;
    businessOwnerName: string;
    status: string;
    createdAt: Date;
    isAutoAssigned: boolean;
}
export declare class SendApprovalRequestDataDto {
    requestInfo: ApprovalRequestInfoDto;
    assignedAgent?: AssignedAgentDto;
    assignedAdmin?: AssignedAdminDto;
    assignmentType: 'agent' | 'admin';
    fallbackReason?: string;
}
export declare class SendApprovalRequestResponseDto {
    code: number;
    success: boolean;
    message: string;
    data: SendApprovalRequestDataDto;
}
