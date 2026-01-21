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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var BhashSMSOtpService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BhashSMSOtpService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
let BhashSMSOtpService = BhashSMSOtpService_1 = class BhashSMSOtpService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(BhashSMSOtpService_1.name);
        this.apiUrl = this.configService.get('BHASHSMS_API_URL', 'http://bhashsms.com/api/sendmsg.php');
        this.username = this.configService.get('BHASHSMS_USERNAME');
        this.password = this.configService.get('BHASHSMS_PASSWORD');
        this.senderId = this.configService.get('BHASHSMS_SENDER_ID', 'SALON');
        if (!this.username || !this.password) {
            this.logger.warn('BhashSMS credentials are missing. Service will not be functional.');
            this.logger.warn('Please set BHASHSMS_USERNAME and BHASHSMS_PASSWORD in your environment variables');
        }
        else {
            this.logger.log('BhashSMS OTP Service initialized');
        }
    }
    async sendOtp(phone, role) {
        if (!this.username || !this.password) {
            this.logger.error(`Cannot send OTP to ${phone}: BhashSMS credentials not configured`);
            return { success: false };
        }
        try {
            const otp = this.generateOtp();
            const message = this.formatOtpMessage(otp, role);
            const formattedPhone = this.formatPhoneNumber(phone);
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
            const response = await axios_1.default.get(fullUrl, {
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; SMS-Service/1.0)',
                }
            });
            const success = this.isSuccessResponse(response.data);
            if (success) {
                this.logger.log(`OTP sent successfully to ${phone}. Response: ${response.data}`);
                return { success: true, otp };
            }
            else {
                this.logger.error(`Failed to send OTP to ${phone}. Response: ${response.data}`);
                return { success: false };
            }
        }
        catch (error) {
            if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
                this.logger.error(`BhashSMS API timeout for ${phone}. This might be due to network issues or API server being slow.`);
            }
            else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
                this.logger.error(`BhashSMS API connection failed for ${phone}. Check if bhashsms.com is accessible.`);
            }
            else {
                this.logger.error(`BhashSMS API error for ${phone}:`, error.message);
            }
            if (process.env.NODE_ENV === 'development') {
                const fallbackOtp = this.generateOtp();
                this.logger.warn(`🔄 BhashSMS failed, showing OTP for development: ${fallbackOtp}`);
                this.logger.warn(`📱 OTP for ${phone} (${role}): ${fallbackOtp}`);
                return { success: true, otp: fallbackOtp };
            }
            return { success: false };
        }
    }
    async verifyOtp(phone, otp, role) {
        this.logger.log(`BhashSMS provider does not handle OTP verification. Using database verification for ${phone}`);
        return false;
    }
    getProviderName() {
        return 'BhashSMS';
    }
    generateOtp() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    formatOtpMessage(otp, role) {
        const roleText = role ? ` for ${role}` : ' for Login';
        return `Your OTP for Login ${otp}. Do not share this with anyone. It is valid for 10 minutes - STYLEPLUS UNIT LLP`;
    }
    formatPhoneNumber(phone) {
        let cleanPhone = phone.replace(/^\+91|^91/, '');
        if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
            throw new Error(`Invalid phone number format: ${phone}`);
        }
        return cleanPhone;
    }
    isSuccessResponse(response) {
        const trimmedResponse = response.trim();
        if (trimmedResponse.startsWith('S.')) {
            return true;
        }
        const successKeywords = ['success', 'sent', 'delivered', 'queued', 'accepted'];
        const responseText = response.toLowerCase();
        return successKeywords.some(keyword => responseText.includes(keyword));
    }
};
exports.BhashSMSOtpService = BhashSMSOtpService;
exports.BhashSMSOtpService = BhashSMSOtpService = BhashSMSOtpService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], BhashSMSOtpService);
//# sourceMappingURL=bhashsms-otp.service.js.map