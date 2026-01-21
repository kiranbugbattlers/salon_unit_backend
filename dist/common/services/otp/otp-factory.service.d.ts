import { ConfigService } from '@nestjs/config';
import { IOtpProvider, OtpProviderType } from './interfaces/otp-provider.interface';
export declare class OtpFactoryService {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    createOtpProvider(): IOtpProvider;
    getAvailableProviders(): OtpProviderType[];
}
