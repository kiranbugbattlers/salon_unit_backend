import { TokensDto } from './auth-response.dto';
export declare class AgentDto {
    id: string;
    userId: string;
    username: string;
    phone: string;
    email?: string;
    firstName: string;
    lastName?: string;
    fullName: string;
    gender?: string;
    dateOfBirth?: string;
    employeeId?: string;
    department?: string;
    position?: string;
    hireDate?: string;
    salary?: number;
    isActive: boolean;
    lastLogin?: Date;
    permissions?: Record<string, any>;
    notes?: string;
    createdByAdminId: string;
    createdByAdminUsername: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class AgentListResponseDto {
    agents: AgentDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare class AgentCreateResponseDto {
    agent: AgentDto;
    message: string;
}
export declare class AgentAuthResponseDto {
    agent: AgentDto;
    tokens: TokensDto;
    isNewLogin: boolean;
}
