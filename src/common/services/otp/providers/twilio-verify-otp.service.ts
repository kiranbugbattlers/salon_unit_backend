import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';
import { IOtpProvider } from '../interfaces/otp-provider.interface';

@Injectable()
export class TwilioVerifyOtpService implements IOtpProvider {
  private readonly logger = new Logger(TwilioVerifyOtpService.name);
  private readonly twilioClient: Twilio;
  private readonly verifyServiceSid: string;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.verifyServiceSid = this.configService.get<string>('TWILIO_VERIFY_SERVICE_ID');

    if (!accountSid || !authToken || !this.verifyServiceSid) {
      this.logger.warn('Twilio Verify configuration is missing. Service will not be functional.');
      this.logger.warn('Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SERVICE_ID');
      return;
    }

    this.twilioClient = new Twilio(accountSid, authToken);
    this.logger.log('Twilio Verify Service initialized');
  }

  async sendOtp(phone: string, role?: string): Promise<boolean> {
    if (!this.twilioClient || !this.verifyServiceSid) {
      this.logger.error(`Cannot send OTP to ${phone}: Twilio Verify not configured`);
      return false;
    }

    try {
      const verification = await this.twilioClient.verify.v2
        .services(this.verifyServiceSid)
        .verifications
        .create({
          to: `+91${phone}`,
          channel: 'sms'
        });

      this.logger.log(`OTP sent to ${phone} via Twilio Verify for role ${role}. Status: ${verification.status}`);
      return verification.status === 'pending';
    } catch (error) {
      this.logger.error(`Failed to send OTP to ${phone}`, error);
      return false;
    }
  }

  async verifyOtp(phone: string, otp: string, role?: string): Promise<boolean> {
    if (!this.twilioClient || !this.verifyServiceSid) {
      this.logger.error(`Cannot verify OTP for ${phone}: Twilio Verify not configured`);
      return false;
    }

    try {
      const verificationCheck = await this.twilioClient.verify.v2
        .services(this.verifyServiceSid)
        .verificationChecks
        .create({
          to: `+91${phone}`,
          code: otp
        });

      this.logger.log(`OTP verification for ${phone} with role ${role}. Status: ${verificationCheck.status}`);
      return verificationCheck.status === 'approved';
    } catch (error) {
      this.logger.error(`Failed to verify OTP for ${phone}`, error);
      return false;
    }
  }

  getProviderName(): string {
    return 'Twilio Verify Service';
  }
}