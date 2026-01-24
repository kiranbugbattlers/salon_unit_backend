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
var TwilioVerifyOtpService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwilioVerifyOtpService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const twilio_1 = require("twilio");
let TwilioVerifyOtpService = TwilioVerifyOtpService_1 = class TwilioVerifyOtpService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(TwilioVerifyOtpService_1.name);
        const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
        const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
        this.verifyServiceSid = this.configService.get('TWILIO_VERIFY_SERVICE_ID');
        if (!accountSid || !authToken || !this.verifyServiceSid) {
            this.logger.warn('Twilio Verify configuration is missing. Service will not be functional.');
            this.logger.warn('Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SERVICE_ID');
            return;
        }
        this.twilioClient = new twilio_1.Twilio(accountSid, authToken);
        this.logger.log('Twilio Verify Service initialized');
    }
    async sendOtp(phone, role) {
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
        }
        catch (error) {
            this.logger.error(`Failed to send OTP to ${phone}`, error);
            return false;
        }
    }
    async verifyOtp(phone, otp, role) {
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
        }
        catch (error) {
            this.logger.error(`Failed to verify OTP for ${phone}`, error);
            return false;
        }
    }
    getProviderName() {
        return 'Twilio Verify Service';
    }
};
exports.TwilioVerifyOtpService = TwilioVerifyOtpService;
exports.TwilioVerifyOtpService = TwilioVerifyOtpService = TwilioVerifyOtpService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], TwilioVerifyOtpService);
//# sourceMappingURL=twilio-verify-otp.service.js.map