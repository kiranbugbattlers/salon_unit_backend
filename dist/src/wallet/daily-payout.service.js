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
var DailyPayoutService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DailyPayoutService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../database/entities");
const razorpay_payout_service_1 = require("./razorpay-payout.service");
let DailyPayoutService = DailyPayoutService_1 = class DailyPayoutService {
    constructor(walletRepository, businessOwnerRepository, bankingInfoRepository, walletTransactionRepository, razorpayPayoutService, dataSource) {
        this.walletRepository = walletRepository;
        this.businessOwnerRepository = businessOwnerRepository;
        this.bankingInfoRepository = bankingInfoRepository;
        this.walletTransactionRepository = walletTransactionRepository;
        this.razorpayPayoutService = razorpayPayoutService;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(DailyPayoutService_1.name);
    }
    async processDailyPayouts() {
        this.logger.log('🚀 Starting daily payout processing...');
        const summary = {
            totalProcessed: 0,
            successCount: 0,
            failedCount: 0,
            skippedCount: 0,
            totalPaidOut: 0,
            results: [],
        };
        try {
            const eligibleWallets = await this.getEligibleWallets();
            this.logger.log(`Found ${eligibleWallets.length} business owners with positive balances`);
            if (eligibleWallets.length === 0) {
                this.logger.log('No business owners with positive balances to process');
                return summary;
            }
            for (const wallet of eligibleWallets) {
                summary.totalProcessed++;
                try {
                    const result = await this.processBusinessOwnerPayout(wallet);
                    summary.results.push(result);
                    if (result.status === 'success') {
                        summary.successCount++;
                        summary.totalPaidOut += result.amount;
                    }
                    else if (result.status === 'failed') {
                        summary.failedCount++;
                    }
                    else {
                        summary.skippedCount++;
                    }
                    await this.delay(100);
                }
                catch (error) {
                    this.logger.error(`Unexpected error processing payout for wallet ${wallet.id}: ${error.message}`, error.stack);
                    summary.failedCount++;
                    summary.results.push({
                        businessOwnerId: wallet.userId,
                        shopId: 'UNKNOWN',
                        walletId: wallet.id,
                        amount: Number(wallet.balance),
                        status: 'failed',
                        reason: `Unexpected error: ${error.message}`,
                    });
                }
            }
            this.logger.log(`✅ Daily payout processing completed | ` +
                `Total: ${summary.totalProcessed} | Success: ${summary.successCount} | ` +
                `Failed: ${summary.failedCount} | Skipped: ${summary.skippedCount} | ` +
                `Total Paid: ₹${summary.totalPaidOut.toFixed(2)}`);
            return summary;
        }
        catch (error) {
            this.logger.error(`❌ Fatal error in daily payout processing: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getEligibleWallets() {
        return await this.walletRepository
            .createQueryBuilder('wallet')
            .innerJoin('wallet.user', 'user')
            .innerJoin(entities_1.BusinessOwner, 'businessOwner', 'businessOwner.userId = user.id')
            .where('wallet.userType = :userType', { userType: entities_1.WalletUserType.BUSINESS_OWNER })
            .andWhere('wallet.balance > 0')
            .andWhere('wallet.isActive = true')
            .andWhere('businessOwner.isApproved = true')
            .select(['wallet.id', 'wallet.userId', 'wallet.balance'])
            .getMany();
    }
    async processBusinessOwnerPayout(wallet) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { userId: wallet.userId },
        });
        if (!businessOwner) {
            return {
                businessOwnerId: wallet.userId,
                shopId: 'UNKNOWN',
                walletId: wallet.id,
                amount: Number(wallet.balance),
                status: 'skipped',
                reason: 'Business owner record not found',
            };
        }
        this.logger.log(`Processing payout for ${businessOwner.shopId} | Balance: ₹${Number(wallet.balance).toFixed(2)}`);
        const bankingInfo = await this.bankingInfoRepository.findOne({
            where: { businessOwnerId: businessOwner.id },
        });
        if (!bankingInfo) {
            this.logger.warn(`⚠️ No banking info found for ${businessOwner.shopId}`);
            return {
                businessOwnerId: businessOwner.id,
                shopId: businessOwner.shopId,
                walletId: wallet.id,
                amount: Number(wallet.balance),
                status: 'skipped',
                reason: 'Banking information not found',
            };
        }
        if (!bankingInfo.isVerified) {
            this.logger.warn(`⚠️ Banking info not verified for ${businessOwner.shopId}`);
            return {
                businessOwnerId: businessOwner.id,
                shopId: businessOwner.shopId,
                walletId: wallet.id,
                amount: Number(wallet.balance),
                status: 'skipped',
                reason: 'Banking information not verified',
            };
        }
        if (!bankingInfo.razorpayFundAccountId) {
            this.logger.log(`Creating fund account for ${businessOwner.shopId}`);
            try {
                await this.razorpayPayoutService.createFundAccount(bankingInfo.id);
                const updatedBankingInfo = await this.bankingInfoRepository.findOne({
                    where: { id: bankingInfo.id },
                });
                if (!updatedBankingInfo?.razorpayFundAccountId) {
                    return {
                        businessOwnerId: businessOwner.id,
                        shopId: businessOwner.shopId,
                        walletId: wallet.id,
                        amount: Number(wallet.balance),
                        status: 'failed',
                        reason: 'Fund account creation failed',
                    };
                }
                bankingInfo.razorpayFundAccountId = updatedBankingInfo.razorpayFundAccountId;
            }
            catch (error) {
                this.logger.error(`Failed to create fund account for ${businessOwner.shopId}: ${error.message}`);
                return {
                    businessOwnerId: businessOwner.id,
                    shopId: businessOwner.shopId,
                    walletId: wallet.id,
                    amount: Number(wallet.balance),
                    status: 'failed',
                    reason: `Fund account creation failed: ${error.message}`,
                };
            }
        }
        try {
            const payoutResult = await this.executePayout(wallet, businessOwner, bankingInfo);
            return payoutResult;
        }
        catch (error) {
            this.logger.error(`Payout execution failed for ${businessOwner.shopId}: ${error.message}`);
            return {
                businessOwnerId: businessOwner.id,
                shopId: businessOwner.shopId,
                walletId: wallet.id,
                amount: Number(wallet.balance),
                status: 'failed',
                reason: `Payout execution failed: ${error.message}`,
            };
        }
    }
    async executePayout(wallet, businessOwner, bankingInfo) {
        return await this.dataSource.transaction(async (transactionalEntityManager) => {
            const lockedWallet = await transactionalEntityManager
                .createQueryBuilder(entities_1.Wallet, 'wallet')
                .setLock('pessimistic_write')
                .where('wallet.id = :walletId', { walletId: wallet.id })
                .getOne();
            if (!lockedWallet) {
                throw new Error('Wallet not found during lock');
            }
            if (lockedWallet.balance <= 0) {
                this.logger.warn(`Balance changed to ${lockedWallet.balance} for ${businessOwner.shopId}, skipping payout`);
                return {
                    businessOwnerId: businessOwner.id,
                    shopId: businessOwner.shopId,
                    walletId: wallet.id,
                    amount: 0,
                    status: 'skipped',
                    reason: 'Balance became zero or negative during processing',
                };
            }
            const payoutAmount = Number(lockedWallet.balance);
            const today = new Date().toISOString().split('T')[0];
            this.logger.log(`💰 Initiating Razorpay payout for ${businessOwner.shopId}: ₹${payoutAmount.toFixed(2)}`);
            try {
                const amountInPaise = Math.round(payoutAmount * 100);
                const payout = await this.razorpayPayoutService['razorpay'].payouts.create({
                    account_number: this.razorpayPayoutService['accountNumber'],
                    fund_account_id: bankingInfo.razorpayFundAccountId,
                    amount: amountInPaise,
                    currency: 'INR',
                    mode: this.determinePayoutMode(payoutAmount),
                    purpose: 'payout',
                    queue_if_low_balance: true,
                    reference_id: `daily_payout_${wallet.id}_${today}`,
                    narration: `Daily payout - ${today}`,
                });
                this.logger.log(`✅ Razorpay payout created: ${payout.id} | Status: ${payout.status} | Amount: ₹${payoutAmount}`);
                lockedWallet.balance = 0;
                lockedWallet.totalSpent = Number(lockedWallet.totalSpent || 0) + payoutAmount;
                await transactionalEntityManager.save(entities_1.Wallet, lockedWallet);
                const walletTransaction = transactionalEntityManager.create(entities_1.WalletTransaction, {
                    walletId: wallet.id,
                    type: entities_1.WalletTransactionType.DEBIT,
                    category: entities_1.WalletTransactionCategory.SETTLEMENT,
                    amount: payoutAmount,
                    balanceBefore: payoutAmount,
                    balanceAfter: 0,
                    status: entities_1.WalletTransactionStatus.COMPLETED,
                    description: `Daily automatic payout - ${today}`,
                    metadata: {
                        payoutType: 'daily',
                        razorpayPayoutId: payout.id,
                        fundAccountId: bankingInfo.razorpayFundAccountId,
                        mode: payout.mode,
                        reference: `daily_payout_${wallet.id}_${today}`,
                    },
                });
                await transactionalEntityManager.save(entities_1.WalletTransaction, walletTransaction);
                this.logger.log(`✅ Daily payout successful for ${businessOwner.shopId}: ₹${payoutAmount.toFixed(2)} | Payout ID: ${payout.id}`);
                return {
                    businessOwnerId: businessOwner.id,
                    shopId: businessOwner.shopId,
                    walletId: wallet.id,
                    amount: payoutAmount,
                    status: 'success',
                    razorpayPayoutId: payout.id,
                };
            }
            catch (error) {
                this.logger.error(`Razorpay payout API failed for ${businessOwner.shopId}: ${error.message}`);
                throw error;
            }
        });
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
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    async getPayoutHistory(businessOwnerId, options) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { id: businessOwnerId },
            relations: ['user'],
        });
        if (!businessOwner) {
            return [];
        }
        const wallet = await this.walletRepository.findOne({
            where: {
                userId: businessOwner.userId,
                userType: entities_1.WalletUserType.BUSINESS_OWNER,
            },
        });
        if (!wallet) {
            return [];
        }
        const query = this.walletTransactionRepository
            .createQueryBuilder('transaction')
            .where('transaction.walletId = :walletId', { walletId: wallet.id })
            .andWhere('transaction.type = :type', { type: entities_1.WalletTransactionType.DEBIT })
            .andWhere('transaction.category = :category', {
            category: entities_1.WalletTransactionCategory.SETTLEMENT,
        })
            .andWhere('transaction.settlementId IS NULL')
            .orderBy('transaction.createdAt', 'DESC');
        if (options?.limit) {
            query.take(options.limit);
        }
        if (options?.offset) {
            query.skip(options.offset);
        }
        return await query.getMany();
    }
};
exports.DailyPayoutService = DailyPayoutService;
exports.DailyPayoutService = DailyPayoutService = DailyPayoutService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Wallet)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.BusinessOwner)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.BankingInfo)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.WalletTransaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        razorpay_payout_service_1.RazorpayPayoutService,
        typeorm_2.DataSource])
], DailyPayoutService);
//# sourceMappingURL=daily-payout.service.js.map