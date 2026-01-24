import { ConfigService } from '@nestjs/config';
import { IOtpProvider } from './interfaces/otp-provider.interface';
export declare class ConsoleOtpService implements IOtpProvider {
    private configService?;
    private readonly logger;
    private readonly otpStore;
    private readonly otpExpiryMinutes;
    constructor(configService?: ConfigService);
    sendOtp(phone: string, role?: string): Promise<boolean>;
    verifyOtp(phone: string, otp: string, role?: string): Promise<boolean>;
    getProviderName(): string;
}
