import { User } from './user.entity';
export declare class RefreshToken {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    isRevoked: boolean;
    deviceInfo?: string;
    createdAt: Date;
    user: User;
}
