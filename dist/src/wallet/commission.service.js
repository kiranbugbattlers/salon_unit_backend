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
var CommissionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommissionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../database/entities");
const wallet_service_1 = require("./wallet.service");
const settlement_transaction_entity_1 = require("../database/entities/settlement-transaction.entity");
let CommissionService = CommissionService_1 = class CommissionService {
    constructor(commissionConfigRepository, commissionTransactionRepository, bookingRepository, paymentRepository, rewardPointsRepository, codTransactionRepository, walletService, dataSource) {
        this.commissionConfigRepository = commissionConfigRepository;
        this.commissionTransactionRepository = commissionTransactionRepository;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.rewardPointsRepository = rewardPointsRepository;
        this.codTransactionRepository = codTransactionRepository;
        this.walletService = walletService;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(CommissionService_1.name);
    }
    async getActiveCommissionConfig(date = new Date()) {
        const config = await this.commissionConfigRepository.findOne({
            where: {
                isActive: true,
                effectiveFrom: (0, typeorm_2.LessThanOrEqual)(date),
            },
            order: {
                effectiveFrom: 'DESC',
            },
        });
        if (!config) {
            throw new common_1.NotFoundException('No active commission configuration found. Please contact administrator to set up commission rates.');
        }
        return config;
    }
    async calculateAndApplyCommission(bookingId, paymentMethod = settlement_transaction_entity_1.PaymentMethodType.ONLINE) {
        return await this.dataSource.transaction(async (transactionalEntityManager) => {
            const booking = await transactionalEntityManager.findOne(entities_1.Booking, {
                where: { id: bookingId },
                relations: ['customer', 'businessOwner', 'bookingServices'],
            });
            if (!booking) {
                throw new common_1.NotFoundException(`Booking not found with ID: ${bookingId}`);
            }
            const payment = await transactionalEntityManager.findOne(entities_1.Payment, {
                where: { bookingId: booking.id },
            });
            const existingCommission = await transactionalEntityManager.findOne(entities_1.CommissionTransaction, {
                where: { bookingId },
            });
            if (existingCommission) {
                this.logger.warn(`Commission already calculated for booking ${bookingId}`);
                return existingCommission;
            }
            const commissionConfig = await this.getActiveCommissionConfig(booking.serviceCompletedAt || new Date());
            const bookingAmount = Number(booking.totalAmount);
            const addOnTotal = Number(booking.addOnServicesTotal || 0);
            const deliveryCharge = Number(booking.deliveryCharge || 0);
            const servicesCount = booking.bookingServices?.length || 0;
            const businessOwnerCommissionPercent = Number(commissionConfig.businessOwnerCommissionPercent);
            const customerRewardPercent = Number(commissionConfig.customerRewardPercent);
            const businessOwnerCommissionAmount = (bookingAmount * businessOwnerCommissionPercent) / 100;
            const customerRewardAmount = (bookingAmount * customerRewardPercent) / 100;
            this.logger.log(`Commission calculation for booking ${bookingId}: ` +
                `Total=₹${bookingAmount} (AddOns=₹${addOnTotal}, Delivery=₹${deliveryCharge}, Services=${servicesCount}), ` +
                `BO Commission=${businessOwnerCommissionPercent}% (₹${businessOwnerCommissionAmount}), ` +
                `Customer Reward=${customerRewardPercent}% (₹${customerRewardAmount})`);
            let businessOwnerWalletTransactionId;
            let customerWalletTransactionId;
            const businessOwnerWallet = await this.walletService.getOrCreateWallet(booking.businessOwner.userId, entities_1.WalletUserType.BUSINESS_OWNER);
            if (paymentMethod === settlement_transaction_entity_1.PaymentMethodType.ONLINE) {
                await this.walletService.credit(businessOwnerWallet.id, entities_1.WalletTransactionCategory.BOOKING_PAYMENT, bookingAmount, `Payment received for booking #${bookingId.substring(0, 8)} - ₹${bookingAmount} (Online)`, {
                    bookingId,
                    paymentId: payment?.id,
                    additionalData: {
                        bookingAmount,
                        paymentMethod,
                        note: 'Online payment credited to wallet',
                    },
                });
                this.logger.log(`Credited ₹${bookingAmount} to business owner wallet for online booking ${bookingId}`);
            }
            if (businessOwnerCommissionAmount > 0) {
                const boTransaction = await this.walletService.debit(businessOwnerWallet.id, entities_1.WalletTransactionCategory.COMMISSION, businessOwnerCommissionAmount, paymentMethod === settlement_transaction_entity_1.PaymentMethodType.ONLINE
                    ? `Commission for booking #${bookingId.substring(0, 8)} - ${businessOwnerCommissionPercent}% of ₹${bookingAmount} (Online)`
                    : `Commission owed for booking #${bookingId.substring(0, 8)} - ${businessOwnerCommissionPercent}% of ₹${bookingAmount} (COD)`, {
                    bookingId,
                    paymentId: payment?.id,
                    additionalData: {
                        bookingAmount,
                        commissionPercent: businessOwnerCommissionPercent,
                        paymentMethod,
                        netAmount: paymentMethod === settlement_transaction_entity_1.PaymentMethodType.ONLINE ? bookingAmount - businessOwnerCommissionAmount : null,
                    },
                });
                businessOwnerWalletTransactionId = boTransaction.id;
                this.logger.log(`Debited ₹${businessOwnerCommissionAmount} commission from business owner wallet. ` +
                    `Payment method: ${paymentMethod}. ` +
                    (paymentMethod === settlement_transaction_entity_1.PaymentMethodType.ONLINE
                        ? `Net earnings: ₹${bookingAmount - businessOwnerCommissionAmount}`
                        : `Commission debt: ₹${businessOwnerCommissionAmount}`));
            }
            if (customerRewardAmount > 0) {
                const customerWallet = await this.walletService.getOrCreateWallet(booking.customer.userId, entities_1.WalletUserType.CUSTOMER);
                const customerTransaction = await this.walletService.credit(customerWallet.id, entities_1.WalletTransactionCategory.REWARD_POINTS, customerRewardAmount, `Reward for booking #${bookingId.substring(0, 8)} - ${customerRewardPercent}% of ₹${bookingAmount}`, {
                    bookingId,
                    paymentId: payment?.id,
                    additionalData: {
                        bookingAmount,
                        rewardPercent: customerRewardPercent,
                        paymentMethod,
                    },
                });
                customerWalletTransactionId = customerTransaction.id;
                await this.updateCustomerRewardPoints(booking.customerId, customerRewardAmount, transactionalEntityManager);
            }
            const commissionTransaction = transactionalEntityManager.create(entities_1.CommissionTransaction, {
                bookingId,
                paymentId: payment?.id,
                businessOwnerId: booking.businessOwnerId,
                customerId: booking.customerId,
                commissionConfigId: commissionConfig.id,
                bookingAmount,
                businessOwnerCommissionPercent,
                businessOwnerCommissionAmount,
                customerRewardPercent,
                customerRewardAmount,
                businessOwnerWalletTransactionId,
                customerWalletTransactionId,
                status: entities_1.CommissionTransactionStatus.APPLIED,
                calculatedAt: new Date(),
            });
            const savedCommission = await transactionalEntityManager.save(entities_1.CommissionTransaction, commissionTransaction);
            if (paymentMethod === settlement_transaction_entity_1.PaymentMethodType.COD) {
                const codTransaction = transactionalEntityManager.create(entities_1.CODTransaction, {
                    bookingId,
                    businessOwnerId: booking.businessOwnerId,
                    customerId: booking.customerId,
                    amount: bookingAmount,
                    commissionAmount: businessOwnerCommissionAmount,
                    netAmount: bookingAmount - businessOwnerCommissionAmount,
                    collectedAt: booking.serviceCompletedAt || new Date(),
                    status: entities_1.CODTransactionStatus.PENDING,
                    notes: `COD payment collected for booking #${bookingId.substring(0, 8)}`,
                });
                await transactionalEntityManager.save(entities_1.CODTransaction, codTransaction);
                this.logger.log(`COD transaction created for booking ${bookingId}: ₹${bookingAmount} (net: ₹${bookingAmount - businessOwnerCommissionAmount})`);
            }
            await transactionalEntityManager.update(entities_1.Booking, bookingId, {
                commissionTransactionId: savedCommission.id,
                paymentMethod,
            });
            this.logger.log(`✅ Commission applied for booking ${bookingId}: ` +
                `BO: -₹${businessOwnerCommissionAmount}, Customer: +₹${customerRewardAmount}`);
            return savedCommission;
        });
    }
    async updateCustomerRewardPoints(customerId, rewardAmount, transactionalEntityManager) {
        let rewardPoints = await transactionalEntityManager.findOne(entities_1.CustomerRewardPoints, {
            where: { customerId },
        });
        if (!rewardPoints) {
            rewardPoints = transactionalEntityManager.create(entities_1.CustomerRewardPoints, {
                customerId,
                totalPoints: 0,
                totalEarned: 0,
                totalRedeemed: 0,
                tier: entities_1.RewardTier.BRONZE,
                totalBookings: 0,
            });
        }
        rewardPoints.totalPoints = Number(rewardPoints.totalPoints) + rewardAmount;
        rewardPoints.totalEarned = Number(rewardPoints.totalEarned) + rewardAmount;
        rewardPoints.totalBookings = Number(rewardPoints.totalBookings) + 1;
        rewardPoints.lastEarnedAt = new Date();
        rewardPoints.tier = this.calculateTier(rewardPoints.totalBookings);
        await transactionalEntityManager.save(entities_1.CustomerRewardPoints, rewardPoints);
    }
    calculateTier(totalBookings) {
        if (totalBookings >= 50)
            return entities_1.RewardTier.PLATINUM;
        if (totalBookings >= 25)
            return entities_1.RewardTier.GOLD;
        if (totalBookings >= 10)
            return entities_1.RewardTier.SILVER;
        return entities_1.RewardTier.BRONZE;
    }
    async reverseCommission(commissionTransactionId, reason) {
        return await this.dataSource.transaction(async (transactionalEntityManager) => {
            const commissionTransaction = await transactionalEntityManager.findOne(entities_1.CommissionTransaction, {
                where: { id: commissionTransactionId },
            });
            if (!commissionTransaction) {
                throw new common_1.NotFoundException(`Commission transaction not found with ID: ${commissionTransactionId}`);
            }
            if (commissionTransaction.status === entities_1.CommissionTransactionStatus.REVERSED) {
                throw new common_1.BadRequestException('Commission already reversed');
            }
            if (commissionTransaction.businessOwnerWalletTransactionId) {
                await this.walletService.reverseTransaction(commissionTransaction.businessOwnerWalletTransactionId, `Commission reversal: ${reason}`);
            }
            if (commissionTransaction.customerWalletTransactionId) {
                await this.walletService.reverseTransaction(commissionTransaction.customerWalletTransactionId, `Reward reversal: ${reason}`);
                const rewardPoints = await transactionalEntityManager.findOne(entities_1.CustomerRewardPoints, {
                    where: { customerId: commissionTransaction.customerId },
                });
                if (rewardPoints) {
                    rewardPoints.totalPoints = Math.max(0, Number(rewardPoints.totalPoints) - commissionTransaction.customerRewardAmount);
                    rewardPoints.totalBookings = Math.max(0, rewardPoints.totalBookings - 1);
                    rewardPoints.tier = this.calculateTier(rewardPoints.totalBookings);
                    await transactionalEntityManager.save(entities_1.CustomerRewardPoints, rewardPoints);
                }
            }
            commissionTransaction.status = entities_1.CommissionTransactionStatus.REVERSED;
            await transactionalEntityManager.save(entities_1.CommissionTransaction, commissionTransaction);
            this.logger.log(`Commission reversed for transaction ${commissionTransactionId}. Reason: ${reason}`);
        });
    }
    async getBusinessOwnerCommissionSummary(businessOwnerId, startDate, endDate) {
        const queryBuilder = this.commissionTransactionRepository
            .createQueryBuilder('ct')
            .where('ct.businessOwnerId = :businessOwnerId', { businessOwnerId })
            .andWhere('ct.status = :status', { status: entities_1.CommissionTransactionStatus.APPLIED });
        if (startDate) {
            queryBuilder.andWhere('ct.calculatedAt >= :startDate', { startDate });
        }
        if (endDate) {
            queryBuilder.andWhere('ct.calculatedAt <= :endDate', { endDate });
        }
        const result = await queryBuilder
            .select('COUNT(*)', 'totalBookings')
            .addSelect('SUM(ct.bookingAmount)', 'totalBookingAmount')
            .addSelect('SUM(ct.businessOwnerCommissionAmount)', 'totalCommissionPaid')
            .addSelect('AVG(ct.businessOwnerCommissionPercent)', 'averageCommissionPercent')
            .getRawOne();
        const totalBookings = parseInt(result.totalBookings) || 0;
        const totalBookingAmount = parseFloat(result.totalBookingAmount) || 0;
        const totalCommissionPaid = parseFloat(result.totalCommissionPaid) || 0;
        const averageCommissionPercent = parseFloat(result.averageCommissionPercent) || 0;
        const paymentMethodQueryBuilder = this.commissionTransactionRepository
            .createQueryBuilder('ct')
            .leftJoin('ct.booking', 'b')
            .where('ct.businessOwnerId = :businessOwnerId', { businessOwnerId })
            .andWhere('ct.status = :status', { status: entities_1.CommissionTransactionStatus.APPLIED });
        if (startDate) {
            paymentMethodQueryBuilder.andWhere('ct.calculatedAt >= :startDate', { startDate });
        }
        if (endDate) {
            paymentMethodQueryBuilder.andWhere('ct.calculatedAt <= :endDate', { endDate });
        }
        const paymentMethodBreakdown = await paymentMethodQueryBuilder
            .select('b.paymentMethod', 'paymentMethod')
            .addSelect('SUM(ct.bookingAmount)', 'amount')
            .groupBy('b.paymentMethod')
            .getRawMany();
        const codAmount = parseFloat(paymentMethodBreakdown.find(p => p.paymentMethod === 'cod')?.amount || '0');
        const onlineAmount = parseFloat(paymentMethodBreakdown.find(p => p.paymentMethod === 'online')?.amount || '0');
        const gstAmount = (totalCommissionPaid * 18) / 100;
        const totalDeduction = totalCommissionPaid + gstAmount;
        const netEarnings = totalBookingAmount - totalDeduction;
        return {
            totalBookings,
            totalBookingAmount,
            totalCommissionPaid,
            averageCommissionPercent,
            netEarnings: Math.round(netEarnings * 100) / 100,
            codAmount,
            onlineAmount,
            gstAmount: Math.round(gstAmount * 100) / 100,
            totalDeduction: Math.round(totalDeduction * 100) / 100,
        };
    }
    async getCustomerRewardSummary(customerId) {
        return await this.rewardPointsRepository.findOne({
            where: { customerId },
            relations: ['customer'],
        });
    }
    async getCommissionTransactions(filters) {
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const skip = (page - 1) * limit;
        const queryBuilder = this.commissionTransactionRepository
            .createQueryBuilder('ct')
            .leftJoinAndSelect('ct.booking', 'booking')
            .leftJoinAndSelect('ct.businessOwner', 'businessOwner')
            .leftJoinAndSelect('ct.customer', 'customer')
            .orderBy('ct.calculatedAt', 'DESC');
        if (filters.businessOwnerId) {
            queryBuilder.andWhere('ct.businessOwnerId = :businessOwnerId', {
                businessOwnerId: filters.businessOwnerId,
            });
        }
        if (filters.customerId) {
            queryBuilder.andWhere('ct.customerId = :customerId', { customerId: filters.customerId });
        }
        if (filters.status) {
            queryBuilder.andWhere('ct.status = :status', { status: filters.status });
        }
        if (filters.startDate) {
            queryBuilder.andWhere('ct.calculatedAt >= :startDate', { startDate: filters.startDate });
        }
        if (filters.endDate) {
            queryBuilder.andWhere('ct.calculatedAt <= :endDate', { endDate: filters.endDate });
        }
        const [transactions, total] = await queryBuilder.skip(skip).take(limit).getManyAndCount();
        return {
            transactions,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
    async createCommissionConfig(businessOwnerCommissionPercent, customerRewardPercent, effectiveFrom, createdByAdminId, notes) {
        if (businessOwnerCommissionPercent < 0 || businessOwnerCommissionPercent > 100) {
            throw new common_1.BadRequestException('Business owner commission percent must be between 0 and 100');
        }
        if (customerRewardPercent < 0 || customerRewardPercent > 100) {
            throw new common_1.BadRequestException('Customer reward percent must be between 0 and 100');
        }
        await this.commissionConfigRepository.update({
            isActive: true,
            effectiveFrom: (0, typeorm_2.LessThanOrEqual)(effectiveFrom),
        }, {
            isActive: false,
            effectiveUntil: new Date(effectiveFrom.getTime() - 24 * 60 * 60 * 1000),
        });
        const config = this.commissionConfigRepository.create({
            businessOwnerCommissionPercent,
            customerRewardPercent,
            effectiveFrom,
            isActive: true,
            createdByAdminId,
            notes,
        });
        const savedConfig = await this.commissionConfigRepository.save(config);
        this.logger.log(`New commission config created: BO=${businessOwnerCommissionPercent}%, Customer=${customerRewardPercent}%, Effective from ${effectiveFrom.toISOString()}`);
        return savedConfig;
    }
    async getCommissionConfigHistory(limit = 20) {
        return await this.commissionConfigRepository.find({
            order: {
                effectiveFrom: 'DESC',
            },
            take: limit,
            relations: ['createdBy'],
        });
    }
};
exports.CommissionService = CommissionService;
exports.CommissionService = CommissionService = CommissionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.CommissionConfig)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.CommissionTransaction)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.Booking)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.Payment)),
    __param(4, (0, typeorm_1.InjectRepository)(entities_1.CustomerRewardPoints)),
    __param(5, (0, typeorm_1.InjectRepository)(entities_1.CODTransaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        wallet_service_1.WalletService,
        typeorm_2.DataSource])
], CommissionService);
//# sourceMappingURL=commission.service.js.map