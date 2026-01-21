import { TokensDto } from './auth-response.dto';
export declare class AdminDto {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    fullName: string;
    isActive: boolean;
    lastLogin?: Date;
    role: string;
}
export declare class AdminAuthResponseDto {
    admin: AdminDto;
    tokens: TokensDto;
    isNewLogin: boolean;
}
