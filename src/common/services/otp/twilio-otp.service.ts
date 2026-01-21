import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';
import { IOtpProvider } from './interfaces/otp-provider.interface';

@Injectable()
export class TwilioOtpService implements IOtpProvider {
  private readonly logger = new Logger(TwilioOtpService.name);
  private readonly client: Twilio;
  private readonly fromNumber: string;
  private readonly otpStore = new Map<string, { otp: string; role: string }>();
  private readonly otpExpiryMinutes: number;

  constructor(private configService: ConfigService) {
    this.otpExpiryMinutes = this.configService.get<number>('OTP_EXPIRY_MINUTES', 5);
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.fromNumber = this.configService.get<string>('TWILIO_PHONE_NUMBER');

    if (!accountSid || !authToken || !this.fromNumber) {
      this.logger.warn('Twilio credentials not provided, OTP will be logged instead');
      return;
    }

    this.client = new Twilio(accountSid, authToken);
  }

  async sendOtp(phone: string, role?: string): Promise<boolean> {
    try {
      // Generate a 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP with role for verification
      const otpData = { otp, role: role || 'unknown' };
      this.otpStore.set(phone, otpData);
      
      if (!this.client) {
        this.logger.log(`OTP for ${phone}: ${otp}`);
        return true;
      }

      const formattedPhone = this.formatPhoneNumber(phone);
      const message = `Your salon booking OTP is: ${otp}. Valid for 5 minutes.`;

      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: formattedPhone,
      });

      this.logger.log(`OTP sent successfully to ${phone}, SID: ${result.sid}`);
      
      // Clear OTP after configured expiry time
      setTimeout(() => {
        this.otpStore.delete(phone);
        this.logger.log(`🕒 OTP for ${phone} expired and removed after ${this.otpExpiryMinutes} minutes`);
      }, this.otpExpiryMinutes * 60 * 1000);
      
      return true;
    } catch (error) {
      this.logger.error(`Failed to send OTP to ${phone}`, error);
      return false;
    }
  }

  async verifyOtp(phone: string, otp: string, role?: string): Promise<boolean> {
    const storedData = this.otpStore.get(phone);
    
    if (!storedData) {
      this.logger.log(`❌ No OTP found for ${phone}`);
      return false;
    }
    
    const isOtpValid = storedData.otp === otp;
    const isRoleValid = !role || storedData.role === role;
    const isValid = isOtpValid && isRoleValid;
    
    if (isValid) {
      this.otpStore.delete(phone);
      this.logger.log(`✅ OTP verified successfully for ${phone} with role ${role}`);
    } else {
      if (!isOtpValid) {
        this.logger.log(`❌ Invalid OTP for ${phone}`);
      } else if (!isRoleValid) {
        this.logger.log(`❌ Role mismatch for ${phone}. Requested: ${role}, Stored: ${storedData.role}`);
      }
    }
    
    return isValid;
  }

  getProviderName(): string {
    return 'Twilio SMS';
  }

  private formatPhoneNumber(phone: string): string {
    if (phone.startsWith('+')) {
      return phone;
    }
    
    if (phone.startsWith('91') && phone.length === 12) {
      return `+${phone}`;
    }
    
    if (phone.length === 10) {
      return `+91${phone}`;
    }
    
    return phone;
  }
}