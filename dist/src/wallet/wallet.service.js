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
var WalletService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../database/entities");
let WalletService = WalletService_1 = class WalletService {
    constructor(walletRepository, walletTransactionRepository, businessOwnerRepository, dataSource) {
        this.walletRepository = walletRepository;
        this.walletTransactionRepository = walletTransactionRepository;
        this.businessOwnerRepository = businessOwnerRepository;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(WalletService_1.name);
    }
    async getOrCreateWallet(userId, userType) {
        let wallet = await this.walletRepository.findOne({
            where: { userId, userType },
        });
        if (!wallet) {
            wallet = this.walletRepository.create({
                userId,
                userType,
                balance: 0,
                totalEarned: 0,
                totalSpent: 0,
                totalCommissionPaid: 0,
                totalCommissionReceived: 0,
                isActive: true,
            });
            wallet = await this.walletRepository.save(wallet);
            this.logger.log(`Created new wallet for user ${userId} (${userType})`);
        }
        return wallet;
    }
    async getWalletById(walletId) {
        const wallet = await this.walletRepository.findOne({
            where: { id: walletId },
            relations: ['user'],
        });
        if (!wallet) {
            throw new common_1.NotFoundException(`Wallet not found with ID: ${walletId}`);
        }
        return wallet;
    }
    async getWalletByUser(userId, userType) {
        const wallet = await this.walletRepository.findOne({
            where: { userId, userType },
            relations: ['user'],
        });
        if (!wallet) {
            throw new common_1.NotFoundException(`Wallet not found for user ${userId} (${userType})`);
        }
        return wallet;
    }
    async createTransaction(walletId, type, category, amount, description, metadata) {
        if (amount <= 0) {
            throw new common_1.BadRequestException('Transaction amount must be positive');
        }
        return await this.dataSource.transaction(async (transactionalEntityManager) => {
            const wallet = await transactionalEntityManager
                .createQueryBuilder(entities_1.Wallet, 'wallet')
                .setLock('pessimistic_write')
                .where('wallet.id = :walletId', { walletId })
                .getOne();
            if (!wallet) {
                throw new common_1.NotFoundException(`Wallet not found with ID: ${walletId}`);
            }
            if (!wallet.isActive) {
                throw new common_1.BadRequestException('Wallet is not active');
            }
            const balanceBefore = Number(wallet.balance);
            let balanceAfter;
            if (type === entities_1.WalletTransactionType.CREDIT) {
                balanceAfter = balanceBefore + amount;
                wallet.balance = balanceAfter;
                wallet.totalEarned = Number(wallet.totalEarned) + amount;
                if (category === entities_1.WalletTransactionCategory.COMMISSION || category === entities_1.WalletTransactionCategory.REWARD_POINTS) {
                    wallet.totalCommissionReceived = Number(wallet.totalCommissionReceived) + amount;
                }
            }
            else {
                balanceAfter = balanceBefore - amount;
                wallet.balance = balanceAfter;
                wallet.totalSpent = Number(wallet.totalSpent) + amount;
                if (category === entities_1.WalletTransactionCategory.COMMISSION) {
                    wallet.totalCommissionPaid = Number(wallet.totalCommissionPaid) + amount;
                }
                if (balanceAfter < -10000 && wallet.userType === entities_1.WalletUserType.BUSINESS_OWNER) {
                    this.logger.warn(`⚠️ Business owner wallet ${walletId} balance is critically low: ${balanceAfter}`);
                }
                if (balanceAfter < 0 && wallet.userType === entities_1.WalletUserType.CUSTOMER) {
                    throw new common_1.BadRequestException('Insufficient wallet balance');
                }
            }
            wallet.lastTransactionAt = new Date();
            await transactionalEntityManager.save(entities_1.Wallet, wallet);
            if (wallet.userType === entities_1.WalletUserType.BUSINESS_OWNER && balanceBefore < 0 && balanceAfter >= 0) {
                const businessOwner = await transactionalEntityManager.findOne(entities_1.BusinessOwner, {
                    where: { userId: wallet.userId, isDefaulter: true },
                });
                if (businessOwner) {
                    businessOwner.isDefaulter = false;
                    businessOwner.defaulterSince = null;
                    await transactionalEntityManager.save(entities_1.BusinessOwner, businessOwner);
                    this.logger.log(`✅ Business owner ${businessOwner.businessName} (${businessOwner.shopId}) restored from defaulter status. ` +
                        `Wallet balance: ${balanceBefore} → ${balanceAfter}`);
                }
            }
            const transaction = transactionalEntityManager.create(entities_1.WalletTransaction, {
                walletId,
                type,
                category,
                amount,
                balanceBefore,
                balanceAfter,
                bookingId: metadata?.bookingId,
                paymentId: metadata?.paymentId,
                settlementId: metadata?.settlementId,
                description,
                metadata: metadata?.additionalData,
                status: entities_1.WalletTransactionStatus.COMPLETED,
            });
            const savedTransaction = await transactionalEntityManager.save(entities_1.WalletTransaction, transaction);
            this.logger.log(`Wallet transaction created: ${type} ${amount} INR | ` +
                `Wallet ${walletId} | ${balanceBefore} → ${balanceAfter} | ` +
                `Category: ${category}`);
            return savedTransaction;
        });
    }
    async credit(walletId, category, amount, description, metadata) {
        return this.createTransaction(walletId, entities_1.WalletTransactionType.CREDIT, category, amount, description, metadata);
    }
    async debit(walletId, category, amount, description, metadata) {
        return this.createTransaction(walletId, entities_1.WalletTransactionType.DEBIT, category, amount, description, metadata);
    }
    async getTransactions(walletId, options) {
        const page = options?.page || 1;
        const limit = options?.limit || 20;
        const skip = (page - 1) * limit;
        const queryBuilder = this.walletTransactionRepository
            .createQueryBuilder('transaction')
            .where('transaction.walletId = :walletId', { walletId })
            .orderBy('transaction.createdAt', 'DESC');
        if (options?.category) {
            queryBuilder.andWhere('transaction.category = :category', { category: options.category });
        }
        if (options?.type) {
            queryBuilder.andWhere('transaction.type = :type', { type: options.type });
        }
        if (options?.startDate) {
            queryBuilder.andWhere('transaction.createdAt >= :startDate', { startDate: options.startDate });
        }
        if (options?.endDate) {
            queryBuilder.andWhere('transaction.createdAt <= :endDate', { endDate: options.endDate });
        }
        const [transactions, total] = await queryBuilder.skip(skip).take(limit).getManyAndCount();
        return {
            transactions,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getBalance(walletId) {
        const wallet = await this.getWalletById(walletId);
        return Number(wallet.balance);
    }
    async reverseTransaction(transactionId, reason) {
        return await this.dataSource.transaction(async (transactionalEntityManager) => {
            const originalTransaction = await transactionalEntityManager.findOne(entities_1.WalletTransaction, {
                where: { id: transactionId },
            });
            if (!originalTransaction) {
                throw new common_1.NotFoundException(`Transaction not found with ID: ${transactionId}`);
            }
            if (originalTransaction.status === entities_1.WalletTransactionStatus.REVERSED) {
                throw new common_1.BadRequestException('Transaction already reversed');
            }
            const reverseType = originalTransaction.type === entities_1.WalletTransactionType.CREDIT
                ? entities_1.WalletTransactionType.DEBIT
                : entities_1.WalletTransactionType.CREDIT;
            const reverseTransaction = await this.createTransaction(originalTransaction.walletId, reverseType, entities_1.WalletTransactionCategory.REFUND, originalTransaction.amount, `Reversal: ${reason}`, {
                bookingId: originalTransaction.bookingId,
                paymentId: originalTransaction.paymentId,
                additionalData: {
                    originalTransactionId: transactionId,
                    reversalReason: reason,
                },
            });
            originalTransaction.status = entities_1.WalletTransactionStatus.REVERSED;
            await transactionalEntityManager.save(entities_1.WalletTransaction, originalTransaction);
            this.logger.log(`Transaction ${transactionId} reversed. Reason: ${reason}`);
            return reverseTransaction;
        });
    }
    async reconcileWallet(walletId) {
        const wallet = await this.getWalletById(walletId);
        const result = await this.walletTransactionRepository
            .createQueryBuilder('transaction')
            .select('SUM(CASE WHEN type = :credit THEN amount ELSE -amount END)', 'netAmount')
            .where('transaction.walletId = :walletId', { walletId })
            .andWhere('transaction.status = :status', { status: entities_1.WalletTransactionStatus.COMPLETED })
            .setParameters({ credit: entities_1.WalletTransactionType.CREDIT })
            .getRawOne();
        const expectedBalance = Number(result.netAmount) || 0;
        const actualBalance = Number(wallet.balance);
        const difference = Math.abs(actualBalance - expectedBalance);
        const isBalanced = difference < 0.01;
        if (!isBalanced) {
            this.logger.error(`⚠️ Wallet reconciliation mismatch for wallet ${walletId}: ` +
                `Expected ${expectedBalance}, Actual ${actualBalance}, Difference ${difference}`);
        }
        return {
            isBalanced,
            expectedBalance,
            actualBalance,
            difference,
        };
    }
    async adminAdjustWallet(walletId, amount, reason, adminId) {
        const type = amount > 0 ? entities_1.WalletTransactionType.CREDIT : entities_1.WalletTransactionType.DEBIT;
        const absoluteAmount = Math.abs(amount);
        return this.createTransaction(walletId, type, entities_1.WalletTransactionCategory.ADJUSTMENT, absoluteAmount, `Admin adjustment: ${reason}`, {
            additionalData: {
                adjustedBy: adminId,
                adjustmentReason: reason,
            },
        });
    }
    async getWalletStats(walletId, options) {
        const wallet = await this.getWalletById(walletId);
        const transactionCount = await this.walletTransactionRepository.count({
            where: { walletId },
        });
        const baseStats = {
            balance: Number(wallet.balance),
            totalEarned: Number(wallet.totalEarned),
            totalSpent: Number(wallet.totalSpent),
            totalCommissionPaid: Number(wallet.totalCommissionPaid),
            totalCommissionReceived: Number(wallet.totalCommissionReceived),
            transactionCount,
            lastTransactionAt: wallet.lastTransactionAt,
        };
        if (options?.businessOwnerId) {
            return {
                ...baseStats,
                totalBookings: 0,
                totalBookingAmount: 0,
                averageCommissionPercent: 0,
                netEarnings: 0,
            };
        }
        return baseStats;
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = WalletService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Wallet)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.WalletTransaction)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.BusinessOwner)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], WalletService);
//# sourceMappingURL=wallet.service.js.map