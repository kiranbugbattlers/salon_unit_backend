import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IOtpProvider } from './interfaces/otp-provider.interface';

@Injectable()
export class ConsoleOtpService implements IOtpProvider {
  private readonly logger = new Logger(ConsoleOtpService.name);
  private readonly otpStore = new Map<string, { otp: string; role: string }>();
  private readonly otpExpiryMinutes: number;

  constructor(private configService?: ConfigService) {
    this.otpExpiryMinutes = this.configService?.get<number>('OTP_EXPIRY_MINUTES', 5) || 5;
  }

  async sendOtp(phone: string, role?: string): Promise<boolean> {
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with role for verification
    const otpData = { otp, role: role || 'unknown' };
    this.otpStore.set(phone, otpData);
    
    // Direct console log to bypass logger restrictions
    const reset = '\x1b[0m';
    const cyan = '\x1b[36m';
    const yellow = '\x1b[33m';
    const bold = '\x1b[1m';
    const green = '\x1b[32m';

    console.log('\n');
    console.log(`${cyan}╔════════════════════════════════════════════════════════════════╗${reset}`);
    console.log(`${cyan}║${reset}  📱  ${bold}OTP RECEIVED${reset}                                          ${cyan}║${reset}`);
    console.log(`${cyan}╠════════════════════════════════════════════════════════════════╣${reset}`);
    console.log(`${cyan}║${reset}                                                                ${cyan}║${reset}`);
    console.log(`${cyan}║${reset}  📞 Phone: ${yellow}${phone.padEnd(42)}${reset}    ${cyan}║${reset}`);
    console.log(`${cyan}║${reset}  👤 Role:  ${green}${role?.padEnd(42) || 'unknown'.padEnd(42)}${reset}    ${cyan}║${reset}`);
    console.log(`${cyan}║${reset}                                                                ${cyan}║${reset}`);
    console.log(`${cyan}║${reset}  🔑 OTP:   ${bold}${yellow}${otp}  ${reset}                                        ${cyan}║${reset}`);
    console.log(`${cyan}║${reset}                                                                ${cyan}║${reset}`);
    console.log(`${cyan}╚════════════════════════════════════════════════════════════════╝${reset}`);
    console.log('\n');

    // Clear OTP after configured expiry time
    setTimeout(() => {
      this.otpStore.delete(phone);
      console.log(`${yellow}🕒 OTP for ${phone} expired and removed${reset}`);
    }, this.otpExpiryMinutes * 60 * 1000);
    
    return true;
  }

  async verifyOtp(phone: string, otp: string, role?: string): Promise<boolean> {
    const storedData = this.otpStore.get(phone);
    
    // Define colors for consistency (re-defining since they are local scope)
    const reset = '\x1b[0m';
    const green = '\x1b[32m';
    const red = '\x1b[31m';
    const yellow = '\x1b[33m';

    if (!storedData) {
      console.log(`${red}❌ No OTP found for ${phone}${reset}`);
      return false;
    }
    
    const isOtpValid = storedData.otp === otp;
    const isRoleValid = !role || storedData.role === role;
    const isValid = isOtpValid && isRoleValid;
    
    if (isValid) {
      this.otpStore.delete(phone); // Remove OTP after successful verification
      console.log(`${green}✅ OTP verified successfully for ${phone} with role ${role}${reset}`);
    } else {
      if (!isOtpValid) {
        console.log(`${red}❌ Invalid OTP for ${phone}. Provided: ${otp}${reset}`);
      } else if (!isRoleValid) {
         console.log(`${red}❌ Role mismatch for ${phone}. Requested: ${role}, Stored: ${storedData.role}${reset}`);
      }
    }
    
    return isValid;
  }

  getProviderName(): string {
    return 'Console OTP (Development)';
  }
}