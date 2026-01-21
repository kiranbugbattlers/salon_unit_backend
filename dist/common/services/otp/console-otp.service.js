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
var ConsoleOtpService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleOtpService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let ConsoleOtpService = ConsoleOtpService_1 = class ConsoleOtpService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(ConsoleOtpService_1.name);
        this.otpStore = new Map();
        this.otpExpiryMinutes = this.configService?.get('OTP_EXPIRY_MINUTES', 5) || 5;
    }
    async sendOtp(phone, role) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpData = { otp, role: role || 'unknown' };
        this.otpStore.set(phone, otpData);
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
        setTimeout(() => {
            this.otpStore.delete(phone);
            console.log(`${yellow}🕒 OTP for ${phone} expired and removed${reset}`);
        }, this.otpExpiryMinutes * 60 * 1000);
        return true;
    }
    async verifyOtp(phone, otp, role) {
        const storedData = this.otpStore.get(phone);
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
            this.otpStore.delete(phone);
            console.log(`${green}✅ OTP verified successfully for ${phone} with role ${role}${reset}`);
        }
        else {
            if (!isOtpValid) {
                console.log(`${red}❌ Invalid OTP for ${phone}. Provided: ${otp}${reset}`);
            }
            else if (!isRoleValid) {
                console.log(`${red}❌ Role mismatch for ${phone}. Requested: ${role}, Stored: ${storedData.role}${reset}`);
            }
        }
        return isValid;
    }
    getProviderName() {
        return 'Console OTP (Development)';
    }
};
exports.ConsoleOtpService = ConsoleOtpService;
exports.ConsoleOtpService = ConsoleOtpService = ConsoleOtpService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ConsoleOtpService);
//# sourceMappingURL=console-otp.service.js.map