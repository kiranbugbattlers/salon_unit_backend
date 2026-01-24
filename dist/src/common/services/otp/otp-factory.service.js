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
var OtpFactoryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpFactoryService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const otp_provider_interface_1 = require("./interfaces/otp-provider.interface");
const console_otp_service_1 = require("./console-otp.service");
const twilio_otp_service_1 = require("./twilio-otp.service");
const twilio_verify_otp_service_1 = require("./providers/twilio-verify-otp.service");
const bhashsms_otp_service_1 = require("./providers/bhashsms-otp.service");
let OtpFactoryService = OtpFactoryService_1 = class OtpFactoryService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(OtpFactoryService_1.name);
    }
    createOtpProvider() {
        const providerType = this.configService.get('OTP_PROVIDER', 'console');
        this.logger.log(`Creating OTP provider: ${providerType}`);
        switch (providerType) {
            case otp_provider_interface_1.OtpProviderType.CONSOLE:
                return new console_otp_service_1.ConsoleOtpService(this.configService);
            case otp_provider_interface_1.OtpProviderType.TWILIO:
                return new twilio_verify_otp_service_1.TwilioVerifyOtpService(this.configService);
            case otp_provider_interface_1.OtpProviderType.TWILIO_SMS:
                return new twilio_otp_service_1.TwilioOtpService(this.configService);
            case otp_provider_interface_1.OtpProviderType.BHASHSMS:
                return new bhashsms_otp_service_1.BhashSMSOtpService(this.configService);
            case otp_provider_interface_1.OtpProviderType.AWS_SNS:
                throw new Error('AWS SNS OTP provider not yet implemented');
            case otp_provider_interface_1.OtpProviderType.FIREBASE:
                throw new Error('Firebase OTP provider not yet implemented');
            default:
                this.logger.warn(`Unknown OTP provider: ${providerType}, falling back to console`);
                return new console_otp_service_1.ConsoleOtpService(this.configService);
        }
    }
    getAvailableProviders() {
        return [
            otp_provider_interface_1.OtpProviderType.CONSOLE,
            otp_provider_interface_1.OtpProviderType.TWILIO,
            otp_provider_interface_1.OtpProviderType.TWILIO_SMS,
            otp_provider_interface_1.OtpProviderType.BHASHSMS,
        ];
    }
};
exports.OtpFactoryService = OtpFactoryService;
exports.OtpFactoryService = OtpFactoryService = OtpFactoryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], OtpFactoryService);
//# sourceMappingURL=otp-factory.service.js.map