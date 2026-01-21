import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IOtpProvider, OtpProviderType } from './interfaces/otp-provider.interface';
import { ConsoleOtpService } from './console-otp.service';
import { TwilioOtpService } from './twilio-otp.service';
import { TwilioVerifyOtpService } from './providers/twilio-verify-otp.service';
import { BhashSMSOtpService } from './providers/bhashsms-otp.service';

@Injectable()
export class OtpFactoryService {
  private readonly logger = new Logger(OtpFactoryService.name);

  constructor(private configService: ConfigService) {}

  createOtpProvider(): IOtpProvider {
    const providerType = this.configService.get<string>('OTP_PROVIDER', 'console') as OtpProviderType;

    this.logger.log(`Creating OTP provider: ${providerType}`);

    switch (providerType) {
      case OtpProviderType.CONSOLE:
        return new ConsoleOtpService(this.configService);

      case OtpProviderType.TWILIO:
        // Modern Twilio Verify Service (recommended)
        return new TwilioVerifyOtpService(this.configService);

      case OtpProviderType.TWILIO_SMS:
        // Legacy Twilio SMS (requires phone number)
        return new TwilioOtpService(this.configService);

      case OtpProviderType.BHASHSMS:
        // BhashSMS SMS provider
        return new BhashSMSOtpService(this.configService);

      case OtpProviderType.AWS_SNS:
        // Future implementation for AWS SNS
        throw new Error('AWS SNS OTP provider not yet implemented');

      case OtpProviderType.FIREBASE:
        // Future implementation for Firebase
        throw new Error('Firebase OTP provider not yet implemented');

      default:
        this.logger.warn(`Unknown OTP provider: ${providerType}, falling back to console`);
        return new ConsoleOtpService(this.configService);
    }
  }

  /**
   * Get available OTP providers for configuration
   */
  getAvailableProviders(): OtpProviderType[] {
    return [
      OtpProviderType.CONSOLE,
      OtpProviderType.TWILIO,        // Modern Twilio Verify Service (recommended)
      OtpProviderType.TWILIO_SMS,    // Legacy Twilio SMS (requires phone number)
      OtpProviderType.BHASHSMS,      // BhashSMS SMS provider
      // OtpProviderType.AWS_SNS,     // Coming soon
      // OtpProviderType.FIREBASE,    // Coming soon
    ];
  }
}