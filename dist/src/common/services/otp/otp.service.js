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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var OtpService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const entities_1 = require("../../../database/entities");
const otp_factory_service_1 = require("./otp-factory.service");
let OtpService = OtpService_1 = class OtpService {
    constructor(otpRepository, otpFactoryService, configService) {
        this.otpRepository = otpRepository;
        this.otpFactoryService = otpFactoryService;
        this.configService = configService;
        this.logger = new common_1.Logger(OtpService_1.name);
        this.TEST_MODE = false;
        this.TEST_OTP = '123456';
        this.otpProvider = this.otpFactoryService.createOtpProvider();
        this.otpExpiryMinutes = this.configService.get('OTP_EXPIRY_MINUTES', 5);
        this.cleanupOldRecordsMinutes = this.configService.get('OTP_CLEANUP_OLD_RECORDS_MINUTES', 60);
        this.logger.log(`Initialized with ${this.otpProvider.getProviderName()}`);
        this.logger.log(`OTP expiry: ${this.otpExpiryMinutes} minutes, Cleanup old records: ${this.cleanupOldRecordsMinutes} minutes`);
        if (this.TEST_MODE) {
            this.logger.warn('⚠️  OTP SERVICE RUNNING IN TEST MODE - OTP IS ALWAYS: 123456');
            this.logger.warn('⚠️  DISABLE TEST_MODE BEFORE PRODUCTION DEPLOYMENT');
        }
    }
    async generateAndSendOtp(phone, role) {
        try {
            if (this.TEST_MODE) {
                this.logger.log(`[TEST MODE] Generating test OTP for ${phone}`);
                await this.otpRepository.update({ phone, isUsed: false }, { isUsed: true });
                const expiresAt = new Date(Date.now() + this.otpExpiryMinutes * 60 * 1000);
                const otpToken = this.otpRepository.create({
                    phone,
                    otpCode: this.TEST_OTP,
                    expiresAt,
                    requestedRole: role,
                });
                await this.otpRepository.save(otpToken);
                this.logger.log(`[TEST MODE] Test OTP saved: ${this.TEST_OTP}`);
                return true;
            }
            await this.otpRepository.update({ phone, isUsed: false }, { isUsed: true });
            const result = await this.otpProvider.sendOtp(phone, role);
            const success = typeof result === 'boolean' ? result : result.success;
            const providerOtp = typeof result === 'object' ? result.otp : null;
            if (success) {
                const providerName = this.otpProvider.getProviderName();
                const isProviderManaged = providerName.includes('Verify') || providerName.includes('Console');
                if (!isProviderManaged) {
                    const otp = providerOtp || this.generateOtp();
                    const expiresAt = new Date(Date.now() + this.otpExpiryMinutes * 60 * 1000);
                    const otpToken = this.otpRepository.create({
                        phone,
                        otpCode: otp,
                        expiresAt,
                        requestedRole: role,
                    });
                    await this.otpRepository.save(otpToken);
                }
            }
            return success;
        }
        catch (error) {
            this.logger.error(`Failed to generate and send OTP for ${phone}`, error);
            return false;
        }
    }
    async verifyOtp(phone, otp, role) {
        try {
            if (this.TEST_MODE) {
                this.logger.log(`[TEST MODE] Verifying OTP for ${phone}: ${otp}`);
                const whereCondition = {
                    phone,
                    otpCode: otp,
                    isUsed: false,
                };
                if (role) {
                    whereCondition.requestedRole = role;
                }
                const otpToken = await this.otpRepository.findOne({
                    where: whereCondition,
                    order: { createdAt: 'DESC' },
                });
                if (!otpToken) {
                    this.logger.log(`[TEST MODE] No OTP token found for ${phone}`);
                    return false;
                }
                if (otpToken.expiresAt < new Date()) {
                    this.logger.log(`[TEST MODE] OTP expired for ${phone}`);
                    return false;
                }
                if (otpToken.attempts >= 3) {
                    this.logger.log(`[TEST MODE] Too many attempts for ${phone}`);
                    return false;
                }
                const isValid = otpToken.otpCode === otp;
                if (isValid) {
                    await this.otpRepository.delete(otpToken.id);
                    this.logger.log(`[TEST MODE] OTP verified successfully for ${phone}`);
                }
                else {
                    await this.incrementAttempts(phone, otp);
                    this.logger.log(`[TEST MODE] Invalid OTP for ${phone}`);
                }
                return isValid;
            }
            await this.cleanupOldOtpRecords();
            const providerVerified = await this.otpProvider.verifyOtp(phone, otp, role);
            const providerName = this.otpProvider.getProviderName();
            const isProviderManaged = providerName.includes('Verify') || providerName.includes('Console');
            if (isProviderManaged) {
                return providerVerified;
            }
            const whereCondition = {
                phone,
                otpCode: otp,
                isUsed: false,
            };
            if (role) {
                whereCondition.requestedRole = role;
            }
            const otpToken = await this.otpRepository.findOne({
                where: whereCondition,
                order: { createdAt: 'DESC' },
            });
            if (!otpToken) {
                return false;
            }
            if (otpToken.expiresAt < new Date()) {
                return false;
            }
            if (otpToken.attempts >= 3) {
                return false;
            }
            const databaseOtpMatches = otpToken.otpCode === otp;
            const isValid = providerVerified || databaseOtpMatches;
            if (isValid) {
                await this.otpRepository.delete(otpToken.id);
                this.logger.log(`OTP deleted after successful verification for ${phone}. Provider verified: ${providerVerified}, Database matched: ${databaseOtpMatches}`);
            }
            else {
                await this.incrementAttempts(phone, otp);
            }
            return isValid;
        }
        catch (error) {
            this.logger.error(`Failed to verify OTP for ${phone}`, error);
            return false;
        }
    }
    async incrementAttempts(phone, otp) {
        const otpToken = await this.otpRepository.findOne({
            where: {
                phone,
                otpCode: otp,
                isUsed: false,
            },
            order: { createdAt: 'DESC' },
        });
        if (otpToken) {
            otpToken.attempts += 1;
            await this.otpRepository.save(otpToken);
        }
    }
    generateOtp() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    async cleanupOldOtpRecords() {
        try {
            const cutoffTime = new Date(Date.now() - this.cleanupOldRecordsMinutes * 60 * 1000);
            const deleteResult = await this.otpRepository.delete({
                createdAt: (0, typeorm_2.LessThan)(cutoffTime),
            });
            if (deleteResult.affected && deleteResult.affected > 0) {
                this.logger.log(`Cleaned up ${deleteResult.affected} old OTP records older than ${this.cleanupOldRecordsMinutes} minutes`);
            }
        }
        catch (error) {
            this.logger.error('Failed to cleanup old OTP records', error);
        }
    }
    async performCleanup() {
        try {
            const now = new Date();
            const expiredResult = await this.otpRepository.delete({
                expiresAt: (0, typeorm_2.LessThan)(now),
            });
            const cutoffTime = new Date(Date.now() - this.cleanupOldRecordsMinutes * 60 * 1000);
            const oldResult = await this.otpRepository.delete({
                createdAt: (0, typeorm_2.LessThan)(cutoffTime),
            });
            const expiredCount = expiredResult.affected || 0;
            const oldCount = oldResult.affected || 0;
            this.logger.log(`Manual cleanup completed: ${expiredCount} expired records, ${oldCount} old records removed`);
            return {
                expiredRecords: expiredCount,
                oldRecords: oldCount,
            };
        }
        catch (error) {
            this.logger.error('Failed to perform manual cleanup', error);
            return { expiredRecords: 0, oldRecords: 0 };
        }
    }
};
exports.OtpService = OtpService;
exports.OtpService = OtpService = OtpService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.OtpToken)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        otp_factory_service_1.OtpFactoryService,
        config_1.ConfigService])
], OtpService);
//# sourceMappingURL=otp.service.js.map