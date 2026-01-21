import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import Razorpay from 'razorpay';
import axios from 'axios';
import {
  BankingInfo,
  MonthlySettlement,
  BusinessOwner,
  SettlementStatus,
} from '../database/entities';
import { EncryptionService } from './encryption.service';
import { DecimalCalculator } from './utils/decimal-calculator.util';

interface RazorpayContact {
  id: string;
  entity: string;
  name: string;
  contact: string;
  email: string;
  type: string;
  reference_id: string;
  notes: any;
  created_at: number;
}

interface RazorpayFundAccount {
  id: string;
  entity: string;
  contact_id: string;
  account_type: string;
  bank_account: {
    ifsc: string;
    bank_name: string;
    name: string;
    notes: any;
    account_number: string;
  };
  active: boolean;
  created_at: number;
}

interface RazorpayPayout {
  id: string;
  entity: string;
  fund_account_id: string;
  amount: number;
  currency: string;
  notes: any;
  fees: number;
  tax: number;
  status: string;
  purpose: string;
  utr: string;
  mode: string;
  reference_id: string;
  narration: string;
  created_at: number;
  fee_type: string | null;
  failure_reason: string | null;
}

@Injectable()
export class RazorpayPayoutService {
  private readonly logger = new Logger(RazorpayPayoutService.name);
  private readonly razorpay: Razorpay;
  private readonly accountNumber: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly encryptionService: EncryptionService,
    private readonly dataSource: DataSource,
    @InjectRepository(BankingInfo)
    private readonly bankingInfoRepository: Repository<BankingInfo>,
    @InjectRepository(MonthlySettlement)
    private readonly settlementRepository: Repository<MonthlySettlement>,
  ) {
    const keyId = this.configService.get('RAZORPAY_KEY_ID');
    const keySecret = this.configService.get('RAZORPAY_KEY_SECRET');
    this.accountNumber = this.configService.get('RAZORPAY_ACCOUNT_NUMBER');

    if (!keyId || !keySecret) {
      this.logger.warn(
        '⚠️ Razorpay credentials not configured. Payout functionality will not work.',
      );
    }

    this.razorpay = new Razorpay({
      key_id: keyId || 'test_key',
      key_secret: keySecret || 'test_secret',
    });
  }

  /**
   * Create Razorpay contact for business owner
   */
  async createContact(businessOwner: BusinessOwner): Promise<RazorpayContact> {
    try {
      const keyId = this.configService.get('RAZORPAY_KEY_ID');
      const keySecret = this.configService.get('RAZORPAY_KEY_SECRET');

      // Use axios to make direct API call to RazorpayX Contacts API
      const response = await axios.post(
        'https://api.razorpay.com/v1/contacts',
        {
          name: businessOwner.businessName || `${businessOwner.firstName} ${businessOwner.lastName}`,
          email: businessOwner.user?.email || `noemail_${businessOwner.id}@temp.com`,
          contact: businessOwner.user?.phone || '0000000000',
          type: 'vendor',
          reference_id: businessOwner.id,
          notes: {
            shop_id: businessOwner.shopId,
            business_owner_id: businessOwner.id,
          },
        },
        {
          auth: {
            username: keyId,
            password: keySecret,
          },
        },
      );

      const contact = response.data;
      this.logger.log(`Created Razorpay contact: ${contact.id} for business owner ${businessOwner.shopId}`);
      return contact;
    } catch (error) {
      this.logger.error(`Failed to create Razorpay contact: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Failed to create Razorpay contact: ${error.message}`);
    }
  }

  /**
   * Create fund account for business owner's bank account
   */
  async createFundAccount(bankingInfoId: string): Promise<string> {
    return await this.dataSource.transaction(async (manager) => {
      const bankingInfo = await manager.findOne(BankingInfo, {
        where: { id: bankingInfoId },
        relations: ['businessOwner', 'businessOwner.user'],
      });

      if (!bankingInfo) {
        throw new BadRequestException('Banking info not found');
      }

      if (bankingInfo.razorpayFundAccountId) {
        this.logger.log(`Fund account already exists: ${bankingInfo.razorpayFundAccountId}`);
        return bankingInfo.razorpayFundAccountId;
      }

      try {
        // Decrypt account number and IFSC code
        const decryptedAccountNumber = this.encryptionService.decrypt(bankingInfo.accountNumber);
        const decryptedIfscCode = this.encryptionService.decrypt(bankingInfo.ifscCode);

        // Create or get contact
        let contactId = bankingInfo.razorpayContactId;
        if (!contactId) {
          const contact = await this.createContact(bankingInfo.businessOwner);
          contactId = contact.id;
          bankingInfo.razorpayContactId = contactId;
        }

        // Create fund account
        const fundAccount = await this.razorpay.fundAccount.create({
          contact_id: contactId,
          account_type: 'bank_account',
          bank_account: {
            name: bankingInfo.accountHolderName,
            ifsc: decryptedIfscCode,
            account_number: decryptedAccountNumber,
          },
        });

        // Update banking info
        bankingInfo.razorpayFundAccountId = fundAccount.id;
        bankingInfo.fundAccountStatus = fundAccount.active ? 'active' : 'pending';
        bankingInfo.fundAccountCreatedAt = new Date();

        await manager.save(BankingInfo, bankingInfo);

        this.logger.log(
          `✅ Fund account created: ${fundAccount.id} for ${bankingInfo.businessOwner.shopId}`,
        );

        return fundAccount.id;
      } catch (error) {
        this.logger.error(`Failed to create fund account: ${error.message}`, error.stack);

        // Mark as failed
        bankingInfo.fundAccountStatus = 'failed';
        await manager.save(BankingInfo, bankingInfo);

        throw new InternalServerErrorException(`Failed to create fund account: ${error.message}`);
      }
    });
  }

  /**
   * Process payout for a settlement
   */
  async processPayout(settlementId: string): Promise<MonthlySettlement> {
    return await this.dataSource.transaction(async (manager) => {
      const settlement = await manager.findOne(MonthlySettlement, {
        where: { id: settlementId },
        relations: ['businessOwner', 'businessOwner.user'],
      });

      if (!settlement) {
        throw new BadRequestException('Settlement not found');
      }

      if (settlement.status === SettlementStatus.COMPLETED) {
        throw new BadRequestException('Settlement already completed');
      }

      if (settlement.netPayableToBusinessOwner <= 0) {
        throw new BadRequestException(
          'Cannot process payout for negative settlement. Business owner owes money to company.',
        );
      }

      // Get banking info
      const bankingInfo = await manager.findOne(BankingInfo, {
        where: { businessOwnerId: settlement.businessOwnerId },
      });

      if (!bankingInfo) {
        throw new BadRequestException('Banking information not found. Please add bank details.');
      }

      if (!bankingInfo.isVerified) {
        throw new BadRequestException('Banking information not verified. Please contact admin.');
      }

      // Ensure fund account exists
      if (!bankingInfo.razorpayFundAccountId) {
        await this.createFundAccount(bankingInfo.id);
        // Reload banking info
        const updatedBanking = await manager.findOne(BankingInfo, {
          where: { id: bankingInfo.id },
        });
        bankingInfo.razorpayFundAccountId = updatedBanking.razorpayFundAccountId;
      }

      // Update status to processing
      settlement.status = SettlementStatus.PROCESSING;
      settlement.payoutInitiatedAt = new Date();
      await manager.save(MonthlySettlement, settlement);

      try {
        // Convert to paise (Razorpay uses smallest currency unit)
        const amountInPaise = DecimalCalculator.toPaise(settlement.netPayableToBusinessOwner);

        // Determine mode based on amount and time
        const mode = this.determinePayoutMode(settlement.netPayableToBusinessOwner);

        // Create payout
        this.logger.log(
          `Creating Razorpay payout: ₹${settlement.netPayableToBusinessOwner} (${amountInPaise} paise) ` +
          `for settlement ${settlementId} via ${mode}`,
        );

        // Create payout using axios (RazorpayX API)
        const keyId = this.configService.get('RAZORPAY_KEY_ID');
        const keySecret = this.configService.get('RAZORPAY_KEY_SECRET');

        const payoutResponse = await axios.post(
          'https://api.razorpay.com/v1/payouts',
          {
            account_number: this.accountNumber,
            fund_account_id: bankingInfo.razorpayFundAccountId,
            amount: amountInPaise,
            currency: 'INR',
            mode,
            purpose: 'payout',
            queue_if_low_balance: true,
            reference_id: `settlement_${settlementId}`,
            narration: `Settlement ${settlement.settlementMonth}`,
          },
          {
            auth: {
              username: keyId,
              password: keySecret,
            },
            headers: {
              'Content-Type': 'application/json',
              'X-Payout-Idempotency': `payout_${settlementId}_${Date.now()}`,
            },
          },
        );

        const payout: RazorpayPayout = payoutResponse.data;

        // Update settlement with payout info
        settlement.razorpayPayoutId = payout.id;
        settlement.payoutStatus = payout.status;
        settlement.payoutMode = payout.mode;
        settlement.payoutMetadata = {
          created_at: payout.created_at,
          fees: payout.fees,
          tax: payout.tax,
        };

        // If payout is immediately processed (rare), mark settlement as completed
        if (payout.status === 'processed') {
          settlement.status = SettlementStatus.COMPLETED;
          settlement.payoutCompletedAt = new Date();
          settlement.payoutUtr = payout.utr;
        }

        await manager.save(MonthlySettlement, settlement);

        this.logger.log(
          `✅ Payout created successfully: ${payout.id} | Status: ${payout.status} | Amount: ₹${settlement.netPayableToBusinessOwner}`,
        );

        return settlement;
      } catch (error) {
        const errorMessage = error.response?.data
          ? JSON.stringify(error.response.data)
          : error.message;

        this.logger.error(`❌ Payout failed for settlement ${settlementId}: ${errorMessage}`, error.stack);

        // Update settlement with failure info
        settlement.status = SettlementStatus.FAILED;
        settlement.payoutStatus = 'failed';
        settlement.failureReason = errorMessage;
        settlement.retryCount = (settlement.retryCount || 0) + 1;
        settlement.lastRetryAt = new Date();

        await manager.save(MonthlySettlement, settlement);

        throw new InternalServerErrorException(`Payout failed: ${errorMessage}`);
      }
    });
  }

  /**
   * Poll payout status from Razorpay (for stuck/pending payouts)
   */
  async pollPayoutStatus(settlementId: string): Promise<void> {
    const settlement = await this.settlementRepository.findOne({
      where: { id: settlementId },
    });

    if (!settlement || !settlement.razorpayPayoutId) {
      this.logger.warn(`Cannot poll payout status: Settlement or payout ID not found for ${settlementId}`);
      return;
    }

    try {
      // Fetch payout status using axios (RazorpayX API)
      const keyId = this.configService.get('RAZORPAY_KEY_ID');
      const keySecret = this.configService.get('RAZORPAY_KEY_SECRET');

      const payoutResponse = await axios.get(
        `https://api.razorpay.com/v1/payouts/${settlement.razorpayPayoutId}`,
        {
          auth: {
            username: keyId,
            password: keySecret,
          },
        },
      );

      const payout: RazorpayPayout = payoutResponse.data;

      this.logger.log(
        `Polled payout status: ${payout.id} | Status: ${payout.status} | UTR: ${payout.utr || 'N/A'}`,
      );

      // Update settlement based on payout status
      settlement.payoutStatus = payout.status;
      settlement.payoutUtr = payout.utr;

      if (payout.status === 'processed') {
        settlement.status = SettlementStatus.COMPLETED;
        settlement.payoutCompletedAt = new Date();
        this.logger.log(`✅ Settlement ${settlementId} marked as completed via polling`);
      } else if (payout.status === 'failed' || payout.status === 'reversed') {
        settlement.status = SettlementStatus.FAILED;
        settlement.failureReason = payout.failure_reason || 'Payout failed';
        this.logger.error(`❌ Payout failed: ${payout.failure_reason}`);
      } else if (payout.status === 'queued' || payout.status === 'pending') {
        // Still processing, do nothing
        this.logger.log(`Payout still ${payout.status}, waiting...`);
      }

      await this.settlementRepository.save(settlement);
    } catch (error) {
      this.logger.error(
        `Failed to poll payout status for settlement ${settlementId}: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Handle Razorpay webhook for payout status updates
   */
  async handlePayoutWebhook(payload: any): Promise<void> {
    try {
      const event = payload.event;
      const payoutData = payload.payload.payout.entity;

      this.logger.log(`Received payout webhook: Event=${event} | PayoutId=${payoutData.id} | Status=${payoutData.status}`);

      // Find settlement by Razorpay payout ID
      const settlement = await this.settlementRepository.findOne({
        where: { razorpayPayoutId: payoutData.id },
      });

      if (!settlement) {
        this.logger.warn(`Settlement not found for payout ID: ${payoutData.id}`);
        return;
      }

      // Update settlement based on webhook event
      switch (event) {
        case 'payout.processed':
          settlement.status = SettlementStatus.COMPLETED;
          settlement.payoutStatus = 'processed';
          settlement.payoutCompletedAt = new Date();
          settlement.payoutUtr = payoutData.utr;
          this.logger.log(`✅ Payout processed: ${payoutData.id} | UTR: ${payoutData.utr}`);
          break;

        case 'payout.failed':
          settlement.status = SettlementStatus.FAILED;
          settlement.payoutStatus = 'failed';
          settlement.failureReason = payoutData.failure_reason || 'Payout failed';
          this.logger.error(`❌ Payout failed: ${payoutData.id} | Reason: ${payoutData.failure_reason}`);
          break;

        case 'payout.reversed':
          settlement.status = SettlementStatus.FAILED;
          settlement.payoutStatus = 'reversed';
          settlement.failureReason = 'Payout was reversed by bank';
          this.logger.error(`❌ Payout reversed: ${payoutData.id}`);
          break;

        case 'payout.queued':
        case 'payout.pending':
          settlement.payoutStatus = payoutData.status;
          this.logger.log(`Payout ${payoutData.status}: ${payoutData.id}`);
          break;

        default:
          this.logger.warn(`Unknown payout webhook event: ${event}`);
      }

      await this.settlementRepository.save(settlement);
    } catch (error) {
      this.logger.error(`Failed to handle payout webhook: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Retry failed payout
   */
  async retryPayout(settlementId: string): Promise<MonthlySettlement> {
    const settlement = await this.settlementRepository.findOne({
      where: { id: settlementId },
    });

    if (!settlement) {
      throw new BadRequestException('Settlement not found');
    }

    if (settlement.status === SettlementStatus.COMPLETED) {
      throw new BadRequestException('Settlement already completed');
    }

    if ((settlement.retryCount || 0) >= 3) {
      throw new BadRequestException('Maximum retry attempts (3) reached. Please contact support.');
    }

    this.logger.log(`Retrying payout for settlement ${settlementId} (attempt ${(settlement.retryCount || 0) + 1})`);

    // Reset status and retry
    settlement.status = SettlementStatus.PENDING;
    settlement.payoutStatus = null;
    settlement.razorpayPayoutId = null;
    await this.settlementRepository.save(settlement);

    // Attempt payout again
    return await this.processPayout(settlementId);
  }

  /**
   * Determine payout mode based on amount and time
   */
  private determinePayoutMode(amount: number): 'IMPS' | 'NEFT' | 'RTGS' {
    // RTGS for amounts >= ₹2 lakh (faster, but only during business hours)
    if (amount >= 200000) {
      const hour = new Date().getHours();
      if (hour >= 9 && hour < 16) {
        return 'RTGS';
      }
    }

    // IMPS for amounts < ₹2 lakh (24x7, instant)
    if (amount < 200000) {
      return 'IMPS';
    }

    // NEFT as fallback (works 24x7)
    return 'NEFT';
  }

  /**
   * Get payout statistics
   */
  async getPayoutStats(month?: string): Promise<any> {
    const queryBuilder = this.settlementRepository
      .createQueryBuilder('settlement')
      .select([
        'COUNT(*) as total_settlements',
        'SUM(CASE WHEN payout_status = \'processed\' THEN 1 ELSE 0 END) as processed_count',
        'SUM(CASE WHEN payout_status = \'failed\' THEN 1 ELSE 0 END) as failed_count',
        'SUM(CASE WHEN payout_status = \'pending\' OR payout_status = \'queued\' THEN 1 ELSE 0 END) as pending_count',
        'SUM(CASE WHEN payout_status = \'processed\' THEN net_payable_to_business_owner ELSE 0 END) as total_processed_amount',
        'SUM(CASE WHEN payout_status = \'failed\' THEN net_payable_to_business_owner ELSE 0 END) as total_failed_amount',
      ]);

    if (month) {
      queryBuilder.where('settlement.settlement_month = :month', { month });
    }

    const result = await queryBuilder.getRawOne();

    return {
      totalSettlements: parseInt(result.total_settlements) || 0,
      processedCount: parseInt(result.processed_count) || 0,
      failedCount: parseInt(result.failed_count) || 0,
      pendingCount: parseInt(result.pending_count) || 0,
      totalProcessedAmount: parseFloat(result.total_processed_amount) || 0,
      totalFailedAmount: parseFloat(result.total_failed_amount) || 0,
    };
  }
}
