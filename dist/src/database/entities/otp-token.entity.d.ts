export declare class OtpToken {
    id: string;
    phone: string;
    otpCode: string;
    requestedRole: string;
    expiresAt: Date;
    isUsed: boolean;
    attempts: number;
    createdAt: Date;
}
