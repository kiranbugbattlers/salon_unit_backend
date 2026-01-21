export declare class AgentCreatorDto {
    id: string;
    username: string;
    email: string;
}
export declare class AgentProfileDto {
    id: string;
    userId: string;
    username: string;
    firstName: string;
    lastName: string;
    gender: string;
    dateOfBirth: Date;
    employeeId: string;
    department: string;
    position: string;
    hireDate: Date;
    isActive: boolean;
    lastLogin: Date;
    permissions: Record<string, any>;
    latitude: number;
    longitude: number;
    locationAddress: string;
    phone: string;
    email: string;
    profilePic: string;
    profilePicCdnUrl: string;
    profilePicS3Key: string;
    isPhoneVerified: boolean;
    isEmailVerified: boolean;
    createdBy: AgentCreatorDto;
    createdAt: Date;
    updatedAt: Date;
}
