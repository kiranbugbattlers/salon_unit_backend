import { ConfigService } from '@nestjs/config';
import { IOtpProvider, OtpSendResult } from '../interfaces/otp-provider.interface';
export declare class BhashSMSOtpService implements IOtpProvider {
    private configService;
    private readonly logger;
    private readonly apiUrl;
    private readonly username;
    private readonly password;
    private readonly senderId;
    constructor(configService: ConfigService);
    sendOtp(phone: string, role?: string): Promise<OtpSendResult>;
    verifyOtp(phone: string, otp: string, role?: string): Promise<boolean>;
    getProviderName(): string;
    private generateOtp;
    private formatOtpMessage;
    private formatPhoneNumber;
    private isSuccessResponse;
}
