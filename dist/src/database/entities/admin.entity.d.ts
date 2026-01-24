export declare class Admin {
    id: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    isActive: boolean;
    lastLogin: Date;
    fcmToken: string;
    deviceType: string;
    deviceId: string;
    createdAt: Date;
    updatedAt: Date;
    hashPassword(): Promise<void>;
    validatePassword(password: string): Promise<boolean>;
    get fullName(): string;
}
