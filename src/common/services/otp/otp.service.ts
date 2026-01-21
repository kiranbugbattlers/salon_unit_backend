import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { OtpToken } from '../../../database/entities';
import { IOtpProvider, OtpSendResult } from './interfaces/otp-provider.interface';
import { OtpFactoryService } from './otp-factory.service';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly otpProvider: IOtpProvider;
  private readonly otpExpiryMinutes: number;
  private readonly cleanupOldRecordsMinutes: number;
  // ========================== TEST MODE - START ==========================
  // TODO: REMOVE BEFORE PRODUCTION DEPLOYMENT
  // Set to true for iOS testing (always generates OTP: 123456)
  private readonly TEST_MODE = false;
  private readonly TEST_OTP = '123456';
  // ========================== TEST MODE - END ==========================

  constructor(
    @InjectRepository(OtpToken)
    private otpRepository: Repository<OtpToken>,
    private otpFactoryService: OtpFactoryService,
    private configService: ConfigService,
  ) {
    this.otpProvider = this.otpFactoryService.createOtpProvider();
    this.otpExpiryMinutes = this.configService.get<number>('OTP_EXPIRY_MINUTES', 5);
    this.cleanupOldRecordsMinutes = this.configService.get<number>('OTP_CLEANUP_OLD_RECORDS_MINUTES', 60);
    this.logger.log(`Initialized with ${this.otpProvider.getProviderName()}`);
    this.logger.log(`OTP expiry: ${this.otpExpiryMinutes} minutes, Cleanup old records: ${this.cleanupOldRecordsMinutes} minutes`);
    // ========================== TEST MODE - START ==========================
    if (this.TEST_MODE) {
      this.logger.warn('⚠️  OTP SERVICE RUNNING IN TEST MODE - OTP IS ALWAYS: 123456');
      this.logger.warn('⚠️  DISABLE TEST_MODE BEFORE PRODUCTION DEPLOYMENT');
    }
    // ========================== TEST MODE - END ==========================
  }

  async generateAndSendOtp(phone: string, role?: string): Promise<boolean> {
    try {
      // ========================== TEST MODE - START ==========================
      if (this.TEST_MODE) {
        this.logger.log(`[TEST MODE] Generating test OTP for ${phone}`);

        // Invalidate previous OTPs for this phone
        await this.otpRepository.update(
          { phone, isUsed: false },
          { isUsed: true }
        );

        // Store test OTP in database
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
      // ========================== TEST MODE - END ==========================

      // PRODUCTION CODE - UNCOMMENT AFTER TESTING
      // Invalidate previous OTPs for this phone
      await this.otpRepository.update(
        { phone, isUsed: false },
        { isUsed: true }
      );

      // For providers that handle OTP generation internally (like Twilio Verify or Console)
      const result = await this.otpProvider.sendOtp(phone, role);

      // Handle both old boolean return and new OtpSendResult return
      const success = typeof result === 'boolean' ? result : result.success;
      const providerOtp = typeof result === 'object' ? result.otp : null;

      if (success) {
        // Only store OTP in database for providers that don't manage their own storage
        // Console and Twilio Verify handle their own OTP storage
        const providerName = this.otpProvider.getProviderName();
        const isProviderManaged = providerName.includes('Verify') || providerName.includes('Console');

        if (!isProviderManaged) {
          // Use provider-generated OTP if available, otherwise generate new one
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
    } catch (error) {
      this.logger.error(`Failed to generate and send OTP for ${phone}`, error);
      return false;
    }
  }

  async verifyOtp(phone: string, otp: string, role?: string): Promise<boolean> {
    try {
      // ========================== TEST MODE - START ==========================
      if (this.TEST_MODE) {
        this.logger.log(`[TEST MODE] Verifying OTP for ${phone}: ${otp}`);

        // Check database for test OTP
        const whereCondition: any = {
          phone,
          otpCode: otp,
          isUsed: false,
        };

        // Add role validation if role is provided
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
          // Delete OTP after successful verification
          await this.otpRepository.delete(otpToken.id);
          this.logger.log(`[TEST MODE] OTP verified successfully for ${phone}`);
        } else {
          // Increment attempts
          await this.incrementAttempts(phone, otp);
          this.logger.log(`[TEST MODE] Invalid OTP for ${phone}`);
        }

        return isValid;
      }
      // ========================== TEST MODE - END ==========================

      // PRODUCTION CODE - UNCOMMENT AFTER TESTING
      // Clean up old OTP records before verification
      await this.cleanupOldOtpRecords();

      // First try provider-specific verification
      const providerVerified = await this.otpProvider.verifyOtp(phone, otp, role);

      const providerName = this.otpProvider.getProviderName();
      const isProviderManaged = providerName.includes('Verify') || providerName.includes('Console');

      // For providers that handle verification internally, trust their response
      if (isProviderManaged) {
        return providerVerified;
      }

      // For database-backed providers, also check our database with role validation
      const whereCondition: any = {
        phone,
        otpCode: otp,
        isUsed: false,
      };

      // Add role validation if role is provided
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

      // For database-backed providers, validate the OTP matches even if provider returns false
      // This is because providers like BhashSMS don't have verification endpoints
      const databaseOtpMatches = otpToken.otpCode === otp;
      const isValid = providerVerified || databaseOtpMatches;

      if (isValid) {
        // Delete OTP after successful verification instead of just marking as used
        await this.otpRepository.delete(otpToken.id);
        this.logger.log(`OTP deleted after successful verification for ${phone}. Provider verified: ${providerVerified}, Database matched: ${databaseOtpMatches}`);
      } else {
        // Increment attempts
        await this.incrementAttempts(phone, otp);
      }

      return isValid;
    } catch (error) {
      this.logger.error(`Failed to verify OTP for ${phone}`, error);
      return false;
    }
  }

  async incrementAttempts(phone: string, otp: string): Promise<void> {
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

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Clean up old OTP records that are older than the configured cleanup time
   * This prevents database from accumulating too many old OTP records
   */
  private async cleanupOldOtpRecords(): Promise<void> {
    try {
      const cutoffTime = new Date(Date.now() - this.cleanupOldRecordsMinutes * 60 * 1000);
      
      const deleteResult = await this.otpRepository.delete({
        createdAt: LessThan(cutoffTime),
      });

      if (deleteResult.affected && deleteResult.affected > 0) {
        this.logger.log(`Cleaned up ${deleteResult.affected} old OTP records older than ${this.cleanupOldRecordsMinutes} minutes`);
      }
    } catch (error) {
      this.logger.error('Failed to cleanup old OTP records', error);
    }
  }

  /**
   * Manual cleanup method that can be called externally
   * Removes both expired and old OTP records
   */
  async performCleanup(): Promise<{ expiredRecords: number; oldRecords: number }> {
    try {
      const now = new Date();
      
      // Clean up expired records (past their expiry time)
      const expiredResult = await this.otpRepository.delete({
        expiresAt: LessThan(now),
      });

      // Clean up old records (older than cleanup threshold)
      const cutoffTime = new Date(Date.now() - this.cleanupOldRecordsMinutes * 60 * 1000);
      const oldResult = await this.otpRepository.delete({
        createdAt: LessThan(cutoffTime),
      });

      const expiredCount = expiredResult.affected || 0;
      const oldCount = oldResult.affected || 0;

      this.logger.log(`Manual cleanup completed: ${expiredCount} expired records, ${oldCount} old records removed`);
      
      return {
        expiredRecords: expiredCount,
        oldRecords: oldCount,
      };
    } catch (error) {
      this.logger.error('Failed to perform manual cleanup', error);
      return { expiredRecords: 0, oldRecords: 0 };
    }
  }
}