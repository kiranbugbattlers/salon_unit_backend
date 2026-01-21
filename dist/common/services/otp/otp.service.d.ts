import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { OtpToken } from '../../../database/entities';
import { OtpFactoryService } from './otp-factory.service';
export declare class OtpService {
    private otpRepository;
    private otpFactoryService;
    private configService;
    private readonly logger;
    private readonly otpProvider;
    private readonly otpExpiryMinutes;
    private readonly cleanupOldRecordsMinutes;
    private readonly TEST_MODE;
    private readonly TEST_OTP;
    constructor(otpRepository: Repository<OtpToken>, otpFactoryService: OtpFactoryService, configService: ConfigService);
    generateAndSendOtp(phone: string, role?: string): Promise<boolean>;
    verifyOtp(phone: string, otp: string, role?: string): Promise<boolean>;
    incrementAttempts(phone: string, otp: string): Promise<void>;
    private generateOtp;
    private cleanupOldOtpRecords;
    performCleanup(): Promise<{
        expiredRecords: number;
        oldRecords: number;
    }>;
}
