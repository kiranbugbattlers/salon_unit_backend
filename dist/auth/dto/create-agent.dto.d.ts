export declare class CreateAgentDto {
    username: string;
    password: string;
    phone: string;
    email?: string;
    firstName: string;
    lastName?: string;
    gender?: string;
    dateOfBirth?: string;
    employeeId?: string;
    department?: string;
    position?: string;
    hireDate?: string;
    salary?: number;
    permissions?: Record<string, any>;
    notes?: string;
    locationAddress?: string;
    latitude?: number;
    longitude?: number;
}
