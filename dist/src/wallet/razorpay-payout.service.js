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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var RazorpayPayoutService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RazorpayPayoutService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const razorpay_1 = __importDefault(require("razorpay"));
const axios_1 = __importDefault(require("axios"));
const entities_1 = require("../database/entities");
const encryption_service_1 = require("./encryption.service");
const decimal_calculator_util_1 = require("./utils/decimal-calculator.util");
let RazorpayPayoutService = RazorpayPayoutService_1 = class RazorpayPayoutService {
    constructor(configService, encryptionService, dataSource, bankingInfoRepository, settlementRepository) {
        this.configService = configService;
        this.encryptionService = encryptionService;
        this.dataSource = dataSource;
        this.bankingInfoRepository = bankingInfoRepository;
        this.settlementRepository = settlementRepository;
        this.logger = new common_1.Logger(RazorpayPayoutService_1.name);
        const keyId = this.configService.get('RAZORPAY_KEY_ID');
        const keySecret = this.configService.get('RAZORPAY_KEY_SECRET');
        this.accountNumber = this.configService.get('RAZORPAY_ACCOUNT_NUMBER');
        if (!keyId || !keySecret) {
            this.logger.warn('⚠️ Razorpay credentials not configured. Payout functionality will not work.');
        }
        this.razorpay = new razorpay_1.default({
            key_id: keyId || 'test_key',
            key_secret: keySecret || 'test_secret',
        });
    }
    async createContact(businessOwner) {
        try {
            const keyId = this.configService.get('RAZORPAY_KEY_ID');
            const keySecret = this.configService.get('RAZORPAY_KEY_SECRET');
            const response = await axios_1.default.post('https://api.razorpay.com/v1/contacts', {
                name: businessOwner.businessName || `${businessOwner.firstName} ${businessOwner.lastName}`,
                email: businessOwner.user?.email || `noemail_${businessOwner.id}@temp.com`,
                contact: businessOwner.user?.phone || '0000000000',
                type: 'vendor',
                reference_id: businessOwner.id,
                notes: {
                    shop_id: businessOwner.shopId,
                    business_owner_id: businessOwner.id,
                },
            }, {
                auth: {
                    username: keyId,
                    password: keySecret,
                },
            });
            const contact = response.data;
            this.logger.log(`Created Razorpay contact: ${contact.id} for business owner ${businessOwner.shopId}`);
            return contact;
        }
        catch (error) {
            this.logger.error(`Failed to create Razorpay contact: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException(`Failed to create Razorpay contact: ${error.message}`);
        }
    }
    async createFundAccount(bankingInfoId) {
        return await this.dataSource.transaction(async (manager) => {
            const bankingInfo = await manager.findOne(entities_1.BankingInfo, {
                where: { id: bankingInfoId },
                relations: ['businessOwner', 'businessOwner.user'],
            });
            if (!bankingInfo) {
                throw new common_1.BadRequestException('Banking info not found');
            }
            if (bankingInfo.razorpayFundAccountId) {
                this.logger.log(`Fund account already exists: ${bankingInfo.razorpayFundAccountId}`);
                return bankingInfo.razorpayFundAccountId;
            }
            try {
                const decryptedAccountNumber = this.encryptionService.decrypt(bankingInfo.accountNumber);
                const decryptedIfscCode = this.encryptionService.decrypt(bankingInfo.ifscCode);
                let contactId = bankingInfo.razorpayContactId;
                if (!contactId) {
                    const contact = await this.createContact(bankingInfo.businessOwner);
                    contactId = contact.id;
                    bankingInfo.razorpayContactId = contactId;
                }
                const fundAccount = await this.razorpay.fundAccount.create({
                    contact_id: contactId,
                    account_type: 'bank_account',
                    bank_account: {
                        name: bankingInfo.accountHolderName,
                        ifsc: decryptedIfscCode,
                        account_number: decryptedAccountNumber,
                    },
                });
                bankingInfo.razorpayFundAccountId = fundAccount.id;
                bankingInfo.fundAccountStatus = fundAccount.active ? 'active' : 'pending';
                bankingInfo.fundAccountCreatedAt = new Date();
                await manager.save(entities_1.BankingInfo, bankingInfo);
                this.logger.log(`✅ Fund account created: ${fundAccount.id} for ${bankingInfo.businessOwner.shopId}`);
                return fundAccount.id;
            }
            catch (error) {
                this.logger.error(`Failed to create fund account: ${error.message}`, error.stack);
                bankingInfo.fundAccountStatus = 'failed';
                await manager.save(entities_1.BankingInfo, bankingInfo);
                throw new common_1.InternalServerErrorException(`Failed to create fund account: ${error.message}`);
            }
        });
    }
    async processPayout(settlementId) {
        return await this.dataSource.transaction(async (manager) => {
            const settlement = await manager.findOne(entities_1.MonthlySettlement, {
                where: { id: settlementId },
                relations: ['businessOwner', 'businessOwner.user'],
            });
            if (!settlement) {
                throw new common_1.BadRequestException('Settlement not found');
            }
            if (settlement.status === entities_1.SettlementStatus.COMPLETED) {
                throw new common_1.BadRequestException('Settlement already completed');
            }
            if (settlement.netPayableToBusinessOwner <= 0) {
                throw new common_1.BadRequestException('Cannot process payout for negative settlement. Business owner owes money to company.');
            }
            const bankingInfo = await manager.findOne(entities_1.BankingInfo, {
                where: { businessOwnerId: settlement.businessOwnerId },
            });
            if (!bankingInfo) {
                throw new common_1.BadRequestException('Banking information not found. Please add bank details.');
            }
            if (!bankingInfo.isVerified) {
                throw new common_1.BadRequestException('Banking information not verified. Please contact admin.');
            }
            if (!bankingInfo.razorpayFundAccountId) {
                await this.createFundAccount(bankingInfo.id);
                const updatedBanking = await manager.findOne(entities_1.BankingInfo, {
                    where: { id: bankingInfo.id },
                });
                bankingInfo.razorpayFundAccountId = updatedBanking.razorpayFundAccountId;
            }
            settlement.status = entities_1.SettlementStatus.PROCESSING;
            settlement.payoutInitiatedAt = new Date();
            await manager.save(entities_1.MonthlySettlement, settlement);
            try {
                const amountInPaise = decimal_calculator_util_1.DecimalCalculator.toPaise(settlement.netPayableToBusinessOwner);
                const mode = this.determinePayoutMode(settlement.netPayableToBusinessOwner);
                this.logger.log(`Creating Razorpay payout: ₹${settlement.netPayableToBusinessOwner} (${amountInPaise} paise) ` +
                    `for settlement ${settlementId} via ${mode}`);
                const keyId = this.configService.get('RAZORPAY_KEY_ID');
                const keySecret = this.configService.get('RAZORPAY_KEY_SECRET');
                const payoutResponse = await axios_1.default.post('https://api.razorpay.com/v1/payouts', {
                    account_number: this.accountNumber,
                    fund_account_id: bankingInfo.razorpayFundAccountId,
                    amount: amountInPaise,
                    currency: 'INR',
                    mode,
                    purpose: 'payout',
                    queue_if_low_balance: true,
                    reference_id: `settlement_${settlementId}`,
                    narration: `Settlement ${settlement.settlementMonth}`,
                }, {
                    auth: {
                        username: keyId,
                        password: keySecret,
                    },
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Payout-Idempotency': `payout_${settlementId}_${Date.now()}`,
                    },
                });
                const payout = payoutResponse.data;
                settlement.razorpayPayoutId = payout.id;
                settlement.payoutStatus = payout.status;
                settlement.payoutMode = payout.mode;
                settlement.payoutMetadata = {
                    created_at: payout.created_at,
                    fees: payout.fees,
                    tax: payout.tax,
                };
                if (payout.status === 'processed') {
                    settlement.status = entities_1.SettlementStatus.COMPLETED;
                    settlement.payoutCompletedAt = new Date();
                    settlement.payoutUtr = payout.utr;
                }
                await manager.save(entities_1.MonthlySettlement, settlement);
                this.logger.log(`✅ Payout created successfully: ${payout.id} | Status: ${payout.status} | Amount: ₹${settlement.netPayableToBusinessOwner}`);
                return settlement;
            }
            catch (error) {
                const errorMessage = error.response?.data
                    ? JSON.stringify(error.response.data)
                    : error.message;
                this.logger.error(`❌ Payout failed for settlement ${settlementId}: ${errorMessage}`, error.stack);
                settlement.status = entities_1.SettlementStatus.FAILED;
                settlement.payoutStatus = 'failed';
                settlement.failureReason = errorMessage;
                settlement.retryCount = (settlement.retryCount || 0) + 1;
                settlement.lastRetryAt = new Date();
                await manager.save(entities_1.MonthlySettlement, settlement);
                throw new common_1.InternalServerErrorException(`Payout failed: ${errorMessage}`);
            }
        });
    }
    async pollPayoutStatus(settlementId) {
        const settlement = await this.settlementRepository.findOne({
            where: { id: settlementId },
        });
        if (!settlement || !settlement.razorpayPayoutId) {
            this.logger.warn(`Cannot poll payout status: Settlement or payout ID not found for ${settlementId}`);
            return;
        }
        try {
            const keyId = this.configService.get('RAZORPAY_KEY_ID');
            const keySecret = this.configService.get('RAZORPAY_KEY_SECRET');
            const payoutResponse = await axios_1.default.get(`https://api.razorpay.com/v1/payouts/${settlement.razorpayPayoutId}`, {
                auth: {
                    username: keyId,
                    password: keySecret,
                },
            });
            const payout = payoutResponse.data;
            this.logger.log(`Polled payout status: ${payout.id} | Status: ${payout.status} | UTR: ${payout.utr || 'N/A'}`);
            settlement.payoutStatus = payout.status;
            settlement.payoutUtr = payout.utr;
            if (payout.status === 'processed') {
                settlement.status = entities_1.SettlementStatus.COMPLETED;
                settlement.payoutCompletedAt = new Date();
                this.logger.log(`✅ Settlement ${settlementId} marked as completed via polling`);
            }
            else if (payout.status === 'failed' || payout.status === 'reversed') {
                settlement.status = entities_1.SettlementStatus.FAILED;
                settlement.failureReason = payout.failure_reason || 'Payout failed';
                this.logger.error(`❌ Payout failed: ${payout.failure_reason}`);
            }
            else if (payout.status === 'queued' || payout.status === 'pending') {
                this.logger.log(`Payout still ${payout.status}, waiting...`);
            }
            await this.settlementRepository.save(settlement);
        }
        catch (error) {
            this.logger.error(`Failed to poll payout status for settlement ${settlementId}: ${error.message}`, error.stack);
        }
    }
    async handlePayoutWebhook(payload) {
        try {
            const event = payload.event;
            const payoutData = payload.payload.payout.entity;
            this.logger.log(`Received payout webhook: Event=${event} | PayoutId=${payoutData.id} | Status=${payoutData.status}`);
            const settlement = await this.settlementRepository.findOne({
                where: { razorpayPayoutId: payoutData.id },
            });
            if (!settlement) {
                this.logger.warn(`Settlement not found for payout ID: ${payoutData.id}`);
                return;
            }
            switch (event) {
                case 'payout.processed':
                    settlement.status = entities_1.SettlementStatus.COMPLETED;
                    settlement.payoutStatus = 'processed';
                    settlement.payoutCompletedAt = new Date();
                    settlement.payoutUtr = payoutData.utr;
                    this.logger.log(`✅ Payout processed: ${payoutData.id} | UTR: ${payoutData.utr}`);
                    break;
                case 'payout.failed':
                    settlement.status = entities_1.SettlementStatus.FAILED;
                    settlement.payoutStatus = 'failed';
                    settlement.failureReason = payoutData.failure_reason || 'Payout failed';
                    this.logger.error(`❌ Payout failed: ${payoutData.id} | Reason: ${payoutData.failure_reason}`);
                    break;
                case 'payout.reversed':
                    settlement.status = entities_1.SettlementStatus.FAILED;
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
        }
        catch (error) {
            this.logger.error(`Failed to handle payout webhook: ${error.message}`, error.stack);
            throw error;
        }
    }
    async retryPayout(settlementId) {
        const settlement = await this.settlementRepository.findOne({
            where: { id: settlementId },
        });
        if (!settlement) {
            throw new common_1.BadRequestException('Settlement not found');
        }
        if (settlement.status === entities_1.SettlementStatus.COMPLETED) {
            throw new common_1.BadRequestException('Settlement already completed');
        }
        if ((settlement.retryCount || 0) >= 3) {
            throw new common_1.BadRequestException('Maximum retry attempts (3) reached. Please contact support.');
        }
        this.logger.log(`Retrying payout for settlement ${settlementId} (attempt ${(settlement.retryCount || 0) + 1})`);
        settlement.status = entities_1.SettlementStatus.PENDING;
        settlement.payoutStatus = null;
        settlement.razorpayPayoutId = null;
        await this.settlementRepository.save(settlement);
        return await this.processPayout(settlementId);
    }
    determinePayoutMode(amount) {
        if (amount >= 200000) {
            const hour = new Date().getHours();
            if (hour >= 9 && hour < 16) {
                return 'RTGS';
            }
        }
        if (amount < 200000) {
            return 'IMPS';
        }
        return 'NEFT';
    }
    async getPayoutStats(month) {
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
};
exports.RazorpayPayoutService = RazorpayPayoutService;
exports.RazorpayPayoutService = RazorpayPayoutService = RazorpayPayoutService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.BankingInfo)),
    __param(4, (0, typeorm_1.InjectRepository)(entities_1.MonthlySettlement)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        encryption_service_1.EncryptionService,
        typeorm_2.DataSource,
        typeorm_2.Repository,
        typeorm_2.Repository])
], RazorpayPayoutService);
//# sourceMappingURL=razorpay-payout.service.js.map