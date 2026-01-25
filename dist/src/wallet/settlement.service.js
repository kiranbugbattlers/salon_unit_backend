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
var SettlementService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettlementService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../database/entities");
const settlement_transaction_entity_1 = require("../database/entities/settlement-transaction.entity");
const wallet_service_1 = require("./wallet.service");
const razorpay_payout_service_1 = require("./razorpay-payout.service");
let SettlementService = SettlementService_1 = class SettlementService {
    constructor(settlementRepository, settlementTransactionRepository, commissionTransactionRepository, codTransactionRepository, bookingRepository, businessOwnerRepository, bankingInfoRepository, walletService, razorpayPayoutService, dataSource) {
        this.settlementRepository = settlementRepository;
        this.settlementTransactionRepository = settlementTransactionRepository;
        this.commissionTransactionRepository = commissionTransactionRepository;
        this.codTransactionRepository = codTransactionRepository;
        this.bookingRepository = bookingRepository;
        this.businessOwnerRepository = businessOwnerRepository;
        this.bankingInfoRepository = bankingInfoRepository;
        this.walletService = walletService;
        this.razorpayPayoutService = razorpayPayoutService;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(SettlementService_1.name);
    }
    async generateMonthlySettlement(businessOwnerId, month) {
        if (!/^\d{4}-\d{2}$/.test(month)) {
            if (/^\d{4}-\d{2}-\d{2}$/.test(month)) {
                month = month.substring(0, 7);
            }
            else {
                throw new Error(`Invalid month format: ${month}. Expected YYYY-MM`);
            }
        }
        return await this.dataSource.transaction(async (transactionalEntityManager) => {
            const existingSettlement = await transactionalEntityManager.findOne(entities_1.MonthlySettlement, {
                where: { businessOwnerId, settlementMonth: month },
            });
            if (existingSettlement) {
                this.logger.warn(`Settlement already exists for business owner ${businessOwnerId} for ${month}`);
                return existingSettlement;
            }
            const [year, monthNum] = month.split('-').map(Number);
            const startDate = new Date(year, monthNum - 1, 1);
            const endDate = new Date(year, monthNum, 0, 23, 59, 59);
            const completedBookings = await transactionalEntityManager.find(entities_1.Booking, {
                where: {
                    businessOwnerId,
                    status: entities_1.BookingStatus.COMPLETED,
                    serviceCompletedAt: (0, typeorm_2.Between)(startDate, endDate),
                },
                relations: ['commissionTransaction'],
            });
            if (completedBookings.length === 0) {
                this.logger.log(`No completed bookings for business owner ${businessOwnerId} in ${month}`);
            }
            let totalBookingAmount = 0;
            let totalCommissionAmount = 0;
            let totalCODAmount = 0;
            let totalOnlineAmount = 0;
            const settlementTransactions = [];
            for (const booking of completedBookings) {
                const bookingAmount = Number(booking.totalAmount);
                const paymentMethod = booking.paymentMethod || settlement_transaction_entity_1.PaymentMethodType.ONLINE;
                let commissionAmount = 0;
                let commissionTransactionId;
                if (booking.commissionTransactionId) {
                    const commissionTransaction = await transactionalEntityManager.findOne(entities_1.CommissionTransaction, {
                        where: { id: booking.commissionTransactionId },
                    });
                    if (commissionTransaction && commissionTransaction.status === entities_1.CommissionTransactionStatus.APPLIED) {
                        commissionAmount = Number(commissionTransaction.businessOwnerCommissionAmount);
                        commissionTransactionId = commissionTransaction.id;
                    }
                }
                totalBookingAmount += bookingAmount;
                totalCommissionAmount += commissionAmount;
                if (paymentMethod === settlement_transaction_entity_1.PaymentMethodType.COD) {
                    totalCODAmount += bookingAmount;
                    await transactionalEntityManager.update(entities_1.CODTransaction, { bookingId: booking.id }, {
                        status: entities_1.CODTransactionStatus.SETTLED,
                        settledInMonth: month,
                    });
                }
                else {
                    totalOnlineAmount += bookingAmount;
                }
                settlementTransactions.push({
                    bookingId: booking.id,
                    commissionTransactionId,
                    amount: bookingAmount,
                    commissionAmount,
                    netAmount: bookingAmount - commissionAmount,
                    paymentMethod,
                    bookingCompletedAt: booking.serviceCompletedAt,
                });
            }
            const netPayableToBusinessOwner = totalOnlineAmount - totalCommissionAmount;
            const settlement = transactionalEntityManager.create(entities_1.MonthlySettlement, {
                businessOwnerId,
                settlementMonth: month,
                totalBookingAmount,
                totalCommissionAmount,
                netPayableToBusinessOwner,
                totalCODAmount,
                totalOnlineAmount,
                bookingCount: completedBookings.length,
                status: netPayableToBusinessOwner < 0 ? entities_1.SettlementStatus.REQUIRES_PAYMENT : entities_1.SettlementStatus.PENDING,
            });
            const savedSettlement = await transactionalEntityManager.save(entities_1.MonthlySettlement, settlement);
            for (const txn of settlementTransactions) {
                const settlementTxn = transactionalEntityManager.create(entities_1.SettlementTransaction, {
                    settlementId: savedSettlement.id,
                    ...txn,
                });
                await transactionalEntityManager.save(entities_1.SettlementTransaction, settlementTxn);
                if (txn.paymentMethod === settlement_transaction_entity_1.PaymentMethodType.COD) {
                    await transactionalEntityManager.update(entities_1.CODTransaction, { bookingId: txn.bookingId }, { settlementId: savedSettlement.id });
                }
            }
            this.logger.log(`✅ Settlement generated for ${businessOwnerId} (${month}): ` +
                `Bookings=${completedBookings.length}, Total=₹${totalBookingAmount}, ` +
                `Commission=₹${totalCommissionAmount}, Net Payable=₹${netPayableToBusinessOwner}`);
            return savedSettlement;
        });
    }
    async generateAllMonthlySettlements(month) {
        const businessOwners = await this.businessOwnerRepository.find({
            where: { isApproved: true },
        });
        const settlements = [];
        for (const businessOwner of businessOwners) {
            try {
                const settlement = await this.generateMonthlySettlement(businessOwner.id, month);
                settlements.push(settlement);
            }
            catch (error) {
                this.logger.error(`Failed to generate settlement for ${businessOwner.id}: ${error.message}`);
            }
        }
        this.logger.log(`Generated ${settlements.length} settlements for ${month}`);
        return settlements;
    }
    async processPayout(settlementId) {
        const settlement = await this.settlementRepository.findOne({
            where: { id: settlementId },
            relations: ['businessOwner', 'businessOwner.user'],
        });
        if (!settlement) {
            throw new common_1.NotFoundException(`Settlement not found with ID: ${settlementId}`);
        }
        if (settlement.status === entities_1.SettlementStatus.COMPLETED) {
            throw new common_1.BadRequestException('Settlement already completed');
        }
        if (settlement.netPayableToBusinessOwner <= 0) {
            throw new common_1.BadRequestException('Cannot process payout for negative or zero settlement. Business owner owes money to company.');
        }
        const bankingInfo = await this.bankingInfoRepository.findOne({
            where: { businessOwnerId: settlement.businessOwnerId },
        });
        if (!bankingInfo) {
            throw new common_1.BadRequestException('Banking information not found. Please add bank details.');
        }
        if (!bankingInfo.isVerified) {
            throw new common_1.BadRequestException('Banking information not verified. Please contact admin.');
        }
        if (!bankingInfo.razorpayFundAccountId) {
            this.logger.log(`Creating fund account for business owner ${settlement.businessOwnerId}`);
            await this.razorpayPayoutService.createFundAccount(bankingInfo.id);
        }
        this.logger.log(`Processing payout for settlement ${settlementId} via RazorpayPayoutService`);
        return await this.razorpayPayoutService.processPayout(settlementId);
    }
    async markPaymentReceived(settlementId, adminNotes) {
        const settlement = await this.settlementRepository.findOne({
            where: { id: settlementId },
        });
        if (!settlement) {
            throw new common_1.NotFoundException(`Settlement not found with ID: ${settlementId}`);
        }
        if (settlement.status === entities_1.SettlementStatus.PAYMENT_RECEIVED) {
            throw new common_1.BadRequestException('Payment already marked as received');
        }
        if (settlement.netPayableToBusinessOwner >= 0) {
            throw new common_1.BadRequestException('This settlement is not a payment-required settlement');
        }
        settlement.status = entities_1.SettlementStatus.PAYMENT_RECEIVED;
        settlement.payoutCompletedAt = new Date();
        settlement.adminNotes = adminNotes || 'Payment received from business owner';
        await this.settlementRepository.save(settlement);
        this.logger.log(`Payment marked as received for settlement ${settlementId}`);
        return settlement;
    }
    async getSettlementById(settlementId) {
        const settlement = await this.settlementRepository.findOne({
            where: { id: settlementId },
            relations: ['businessOwner', 'transactions', 'transactions.booking', 'transactions.commissionTransaction'],
        });
        if (!settlement) {
            throw new common_1.NotFoundException(`Settlement not found with ID: ${settlementId}`);
        }
        return settlement;
    }
    async getBusinessOwnerSettlements(businessOwnerId, options) {
        const page = options?.page || 1;
        const limit = options?.limit || 12;
        const skip = (page - 1) * limit;
        const queryBuilder = this.settlementRepository
            .createQueryBuilder('settlement')
            .where('settlement.businessOwnerId = :businessOwnerId', { businessOwnerId })
            .orderBy('settlement.settlementMonth', 'DESC');
        if (options?.status) {
            queryBuilder.andWhere('settlement.status = :status', { status: options.status });
        }
        const [settlements, total] = await queryBuilder.skip(skip).take(limit).getManyAndCount();
        return {
            settlements,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getAllSettlements(options) {
        const page = options?.page || 1;
        const limit = options?.limit || 20;
        const skip = (page - 1) * limit;
        const queryBuilder = this.settlementRepository
            .createQueryBuilder('settlement')
            .leftJoinAndSelect('settlement.businessOwner', 'businessOwner')
            .orderBy('settlement.settlementMonth', 'DESC')
            .addOrderBy('settlement.createdAt', 'DESC');
        if (options?.status) {
            queryBuilder.andWhere('settlement.status = :status', { status: options.status });
        }
        if (options?.month) {
            queryBuilder.andWhere('settlement.settlementMonth = :month', { month: options.month });
        }
        const [settlements, total] = await queryBuilder.skip(skip).take(limit).getManyAndCount();
        return {
            settlements,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getPendingApprovals() {
        return await this.settlementRepository.find({
            where: { status: entities_1.SettlementStatus.REQUIRES_PAYMENT },
            relations: ['businessOwner'],
            order: { settlementMonth: 'DESC' },
        });
    }
    async getSettlementStats(month) {
        const settlements = await this.settlementRepository.find({
            where: { settlementMonth: month },
        });
        const stats = settlements.reduce((acc, settlement) => {
            acc.totalBookings += settlement.bookingCount;
            acc.totalBookingAmount += Number(settlement.totalBookingAmount);
            acc.totalCommission += Number(settlement.totalCommissionAmount);
            if (settlement.netPayableToBusinessOwner > 0) {
                acc.totalPayouts += Number(settlement.netPayableToBusinessOwner);
            }
            if (settlement.status === entities_1.SettlementStatus.PENDING)
                acc.pendingCount++;
            if (settlement.status === entities_1.SettlementStatus.COMPLETED)
                acc.completedCount++;
            if (settlement.status === entities_1.SettlementStatus.REQUIRES_PAYMENT)
                acc.requiresPaymentCount++;
            return acc;
        }, {
            totalSettlements: settlements.length,
            totalBookings: 0,
            totalBookingAmount: 0,
            totalCommission: 0,
            totalPayouts: 0,
            pendingCount: 0,
            completedCount: 0,
            requiresPaymentCount: 0,
        });
        return stats;
    }
};
exports.SettlementService = SettlementService;
exports.SettlementService = SettlementService = SettlementService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.MonthlySettlement)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.SettlementTransaction)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.CommissionTransaction)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.CODTransaction)),
    __param(4, (0, typeorm_1.InjectRepository)(entities_1.Booking)),
    __param(5, (0, typeorm_1.InjectRepository)(entities_1.BusinessOwner)),
    __param(6, (0, typeorm_1.InjectRepository)(entities_1.BankingInfo)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        wallet_service_1.WalletService,
        razorpay_payout_service_1.RazorpayPayoutService,
        typeorm_2.DataSource])
], SettlementService);
//# sourceMappingURL=settlement.service.js.map