import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IOtpProvider, OtpSendResult } from '../interfaces/otp-provider.interface';
import axios, { AxiosResponse } from 'axios';

@Injectable()
export class BhashSMSOtpService implements IOtpProvider {
  private readonly logger = new Logger(BhashSMSOtpService.name);
  private readonly apiUrl: string;
  private readonly username: string;
  private readonly password: string;
  private readonly senderId: string;

  constructor(private configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('BHASHSMS_API_URL', 'http://bhashsms.com/api/sendmsg.php');
    this.username = this.configService.get<string>('BHASHSMS_USERNAME');
    this.password = this.configService.get<string>('BHASHSMS_PASSWORD');
    this.senderId = this.configService.get<string>('BHASHSMS_SENDER_ID', 'SALON');

    if (!this.username || !this.password) {
      this.logger.warn('BhashSMS credentials are missing. Service will not be functional.');
      this.logger.warn('Please set BHASHSMS_USERNAME and BHASHSMS_PASSWORD in your environment variables');
    } else {
      this.logger.log('BhashSMS OTP Service initialized');
    }
  }

  async sendOtp(phone: string, role?: string): Promise<OtpSendResult> {
    if (!this.username || !this.password) {
      this.logger.error(`Cannot send OTP to ${phone}: BhashSMS credentials not configured`);
      return { success: false };
    }

    try {
      const otp = this.generateOtp();
      const message = this.formatOtpMessage(otp, role);
      
      // Format phone number (assuming Indian numbers)
      const formattedPhone = this.formatPhoneNumber(phone);

      // Build query parameters for GET request (using URLSearchParams for proper encoding)
      const params = new URLSearchParams();
      params.append('user', this.username);
      params.append('pass', this.password);
      params.append('sender', this.senderId);
      params.append('phone', formattedPhone);
      params.append('text', message);
      params.append('priority', 'ndnd');
      params.append('stype', 'normal');

      const fullUrl = `${this.apiUrl}?${params.toString()}`;

      this.logger.log(`Sending OTP to ${phone} via BhashSMS for role ${role}`);

      const response: AxiosResponse<string> = await axios.get(fullUrl, {
        timeout: 30000, // 30 second timeout - BhashSMS might be slower
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SMS-Service/1.0)',
        }
      });

      const success = this.isSuccessResponse(response.data);
      
      if (success) {
        this.logger.log(`OTP sent successfully to ${phone}. Response: ${response.data}`);
        return { success: true, otp }; // Return the OTP that was sent
      } else {
        this.logger.error(`Failed to send OTP to ${phone}. Response: ${response.data}`);
        return { success: false };
      }
    } catch (error) {
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        this.logger.error(`BhashSMS API timeout for ${phone}. This might be due to network issues or API server being slow.`);
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        this.logger.error(`BhashSMS API connection failed for ${phone}. Check if bhashsms.com is accessible.`);
      } else {
        this.logger.error(`BhashSMS API error for ${phone}:`, error.message);
      }
      
      // For development, you might want to fallback to console logging
      if (process.env.NODE_ENV === 'development') {
        const fallbackOtp = this.generateOtp();
        this.logger.warn(`🔄 BhashSMS failed, showing OTP for development: ${fallbackOtp}`);
        this.logger.warn(`📱 OTP for ${phone} (${role}): ${fallbackOtp}`);
        // Return the fallback OTP for development testing
        return { success: true, otp: fallbackOtp };
      }
      
      return { success: false };
    }
  }

  async verifyOtp(phone: string, otp: string, role?: string): Promise<boolean> {
    // BhashSMS typically doesn't provide OTP verification endpoint
    // OTP verification is usually handled by your application logic
    // This is a placeholder that always returns false to indicate
    // that database verification should be used instead
    
    this.logger.log(`BhashSMS provider does not handle OTP verification. Using database verification for ${phone}`);
    return false; // This will trigger database-backed verification in OtpService
  }

  getProviderName(): string {
    return 'BhashSMS';
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private formatOtpMessage(otp: string, role?: string): string {
    const roleText = role ? ` for ${role}` : ' for Login';
    return `Your OTP for Login ${otp}. Do not share this with anyone. It is valid for 10 minutes - STYLEPLUS UNIT LLP`;
  }

  private formatPhoneNumber(phone: string): string {
    // Remove any existing country code for BhashSMS (they expect just the 10-digit number)
    let cleanPhone = phone.replace(/^\+91|^91/, '');
    
    // Ensure it's a valid 10-digit Indian mobile number
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      throw new Error(`Invalid phone number format: ${phone}`);
    }
    
    return cleanPhone;
  }

  private isSuccessResponse(response: string): boolean {
    // BhashSMS returns responses starting with 'S.' for success
    // Example: 'S.998322' where the number after S. is the message ID
    const trimmedResponse = response.trim();
    
    // Check if response starts with 'S.' indicating success
    if (trimmedResponse.startsWith('S.')) {
      return true;
    }
    
    // Fallback to check for other success keywords
    const successKeywords = ['success', 'sent', 'delivered', 'queued', 'accepted'];
    const responseText = response.toLowerCase();
    
    return successKeywords.some(keyword => responseText.includes(keyword));
  }
}