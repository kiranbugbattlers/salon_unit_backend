"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TwilioOtpService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwilioOtpService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const twilio_1 = require("twilio");
let TwilioOtpService = TwilioOtpService_1 = class TwilioOtpService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(TwilioOtpService_1.name);
        this.otpStore = new Map();
        this.otpExpiryMinutes = this.configService.get('OTP_EXPIRY_MINUTES', 5);
        const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
        const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
        this.fromNumber = this.configService.get('TWILIO_PHONE_NUMBER');
        if (!accountSid || !authToken || !this.fromNumber) {
            this.logger.warn('Twilio credentials not provided, OTP will be logged instead');
            return;
        }
        this.client = new twilio_1.Twilio(accountSid, authToken);
    }
    async sendOtp(phone, role) {
        try {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
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
            setTimeout(() => {
                this.otpStore.delete(phone);
                this.logger.log(`🕒 OTP for ${phone} expired and removed after ${this.otpExpiryMinutes} minutes`);
            }, this.otpExpiryMinutes * 60 * 1000);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to send OTP to ${phone}`, error);
            return false;
        }
    }
    async verifyOtp(phone, otp, role) {
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
        }
        else {
            if (!isOtpValid) {
                this.logger.log(`❌ Invalid OTP for ${phone}`);
            }
            else if (!isRoleValid) {
                this.logger.log(`❌ Role mismatch for ${phone}. Requested: ${role}, Stored: ${storedData.role}`);
            }
        }
        return isValid;
    }
    getProviderName() {
        return 'Twilio SMS';
    }
    formatPhoneNumber(phone) {
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
};
exports.TwilioOtpService = TwilioOtpService;
exports.TwilioOtpService = TwilioOtpService = TwilioOtpService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], TwilioOtpService);
//# sourceMappingURL=twilio-otp.service.js.map