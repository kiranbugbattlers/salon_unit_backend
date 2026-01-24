import { ConfigService } from '@nestjs/config';
import { IOtpProvider } from '../interfaces/otp-provider.interface';
export declare class TwilioVerifyOtpService implements IOtpProvider {
    private configService;
    private readonly logger;
    private readonly twilioClient;
    private readonly verifyServiceSid;
    constructor(configService: ConfigService);
    sendOtp(phone: string, role?: string): Promise<boolean>;
    verifyOtp(phone: string, otp: string, role?: string): Promise<boolean>;
    getProviderName(): string;
}
