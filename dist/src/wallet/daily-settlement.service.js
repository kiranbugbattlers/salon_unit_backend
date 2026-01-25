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
var DailySettlementService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DailySettlementService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../database/entities");
const enums_1 = require("../common/enums");
let DailySettlementService = DailySettlementService_1 = class DailySettlementService {
    constructor(dailySettlementRepository, bookingRepository, businessOwnerRepository, businessAddressRepository, commissionConfigRepository, dataSource) {
        this.dailySettlementRepository = dailySettlementRepository;
        this.bookingRepository = bookingRepository;
        this.businessOwnerRepository = businessOwnerRepository;
        this.businessAddressRepository = businessAddressRepository;
        this.commissionConfigRepository = commissionConfigRepository;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(DailySettlementService_1.name);
        this.DEFAULT_COMMISSION_PERCENT = 8.00;
        this.DEFAULT_GST_PERCENT = 18.00;
    }
    async getCommissionConfig(date = new Date()) {
        const config = await this.commissionConfigRepository.findOne({
            where: {
                isActive: true,
                effectiveFrom: (0, typeorm_2.LessThanOrEqual)(date),
            },
            order: {
                effectiveFrom: 'DESC',
            },
        });
        return {
            commissionPercent: config ? Number(config.businessOwnerCommissionPercent) : this.DEFAULT_COMMISSION_PERCENT,
            gstPercent: this.DEFAULT_GST_PERCENT,
        };
    }
    async getAllSettlements(filters) {
        const page = filters?.page || 1;
        const limit = filters?.limit || 50;
        const skip = (page - 1) * limit;
        let startOfRange = null;
        let endOfRange = null;
        const isValidDate = (d) => d && d !== 'null' && !isNaN(new Date(d).getTime());
        if (isValidDate(filters?.date)) {
            startOfRange = new Date(`${filters.date}T00:00:00`);
            endOfRange = new Date(`${filters.date}T23:59:59.999`);
        }
        else if (isValidDate(filters?.startDate) || isValidDate(filters?.endDate)) {
            const sDate = isValidDate(filters?.startDate) ? filters.startDate : '2000-01-01';
            const eDate = isValidDate(filters?.endDate) ? filters.endDate : new Date().toISOString().split('T')[0];
            startOfRange = new Date(`${sDate}T00:00:00`);
            endOfRange = new Date(`${eDate}T23:59:59.999`);
        }
        const [allBusinesses, totalBusinesses] = await this.businessOwnerRepository
            .createQueryBuilder('bo')
            .leftJoinAndSelect('bo.user', 'user')
            .leftJoinAndSelect('bo.addresses', 'addresses')
            .where('bo.isApproved = :isApproved', { isApproved: true })
            .skip(skip)
            .take(limit)
            .getManyAndCount();
        const businessesWithSettlement = [];
        const summaryTotals = {
            totalTransactionsAmount: 0,
            totalCashAmount: 0,
            totalOnlineAmount: 0,
            totalCommissionAmount: 0,
            totalGstAmount: 0,
            totalDeduction: 0,
            totalSettlementAmount: 0,
        };
        const configDate = endOfRange || new Date();
        const { commissionPercent, gstPercent } = await this.getCommissionConfig(configDate);
        for (const business of allBusinesses) {
            let statsQuery = this.bookingRepository
                .createQueryBuilder('b')
                .where('b.businessOwnerId = :businessOwnerId', { businessOwnerId: business.id })
                .andWhere('b.status = :status', { status: enums_1.BookingStatus.COMPLETED });
            if (startOfRange && endOfRange) {
                statsQuery.andWhere('b.serviceCompletedAt BETWEEN :startOfRange AND :endOfRange', { startOfRange, endOfRange });
            }
            else if (startOfRange) {
                statsQuery.andWhere('b.serviceCompletedAt >= :startOfRange', { startOfRange });
            }
            else if (endOfRange) {
                statsQuery.andWhere('b.serviceCompletedAt <= :endOfRange', { endOfRange });
            }
            let stats = await statsQuery
                .select('COUNT(*)', 'count')
                .addSelect('COALESCE(SUM(b.totalAmount), 0)', 'total')
                .addSelect(`COALESCE(SUM(CASE WHEN b.paymentMethod = '${entities_1.PaymentMethodType.COD}' THEN b.totalAmount ELSE 0 END), 0)`, 'cash')
                .addSelect(`COALESCE(SUM(CASE WHEN b.paymentMethod = '${entities_1.PaymentMethodType.ONLINE}' THEN b.totalAmount ELSE 0 END), 0)`, 'online')
                .getRawOne();
            if (parseInt(stats.count) === 0 && startOfRange && endOfRange) {
                let fallbackQuery = this.bookingRepository
                    .createQueryBuilder('b')
                    .where('b.businessOwnerId = :businessOwnerId', { businessOwnerId: business.id })
                    .andWhere('b.status = :status', { status: enums_1.BookingStatus.COMPLETED })
                    .andWhere('b.appointmentDate BETWEEN :startOfRange AND :endOfRange', {
                    startOfRange: startOfRange.toISOString().split('T')[0],
                    endOfRange: endOfRange.toISOString().split('T')[0]
                });
                stats = await fallbackQuery
                    .select('COUNT(*)', 'count')
                    .addSelect('COALESCE(SUM(b.totalAmount), 0)', 'total')
                    .addSelect(`COALESCE(SUM(CASE WHEN b.paymentMethod = '${entities_1.PaymentMethodType.COD}' THEN b.totalAmount ELSE 0 END), 0)`, 'cash')
                    .addSelect(`COALESCE(SUM(CASE WHEN b.paymentMethod = '${entities_1.PaymentMethodType.ONLINE}' THEN b.totalAmount ELSE 0 END), 0)`, 'online')
                    .getRawOne();
            }
            const totalTransactionsCount = parseInt(stats.count) || 0;
            const totalTransactionsAmount = parseFloat(stats.total) || 0;
            const totalCashAmount = parseFloat(stats.cash) || 0;
            const totalOnlineAmount = parseFloat(stats.online) || 0;
            const commissionAmount = (totalTransactionsAmount * commissionPercent) / 100;
            const gstAmount = (commissionAmount * gstPercent) / 100;
            const totalDeduction = commissionAmount + gstAmount;
            const settlementAmount = totalOnlineAmount - totalDeduction;
            let paidStatus = entities_1.SettlementPaidStatus.PENDING;
            if (filters?.date) {
                const existingSettlement = await this.dailySettlementRepository.findOne({
                    where: {
                        businessOwnerId: business.id,
                        settlementDate: new Date(filters.date),
                    },
                });
                if (existingSettlement) {
                    paidStatus = existingSettlement.paidStatus;
                }
            }
            const ownerName = [business.firstName, business.lastName].filter(Boolean).join(' ') || 'N/A';
            const salonName = business.businessName || 'N/A';
            const email = business.user?.email || '';
            const mobileNumber = business.user?.phone || '';
            const primaryAddress = business.addresses?.find(a => a.isPrimary) || business.addresses?.[0];
            const address = primaryAddress
                ? [primaryAddress.streetAddress, primaryAddress.city, primaryAddress.state, primaryAddress.postalCode]
                    .filter(Boolean)
                    .join(', ')
                : 'N/A';
            businessesWithSettlement.push({
                businessOwnerId: business.id,
                ownerName,
                salonName,
                email,
                mobileNumber,
                address,
                totalTransactionsCount,
                totalTransactionsAmount,
                totalCashAmount,
                totalOnlineAmount,
                commissionPercent: commissionPercent,
                commissionAmount: Math.round(commissionAmount * 100) / 100,
                gstPercent: gstPercent,
                gstAmount: Math.round(gstAmount * 100) / 100,
                totalDeduction: Math.round(totalDeduction * 100) / 100,
                settlementAmount: Math.round(settlementAmount * 100) / 100,
                paidStatus: paidStatus,
                date: filters?.date || null,
            });
            summaryTotals.totalTransactionsAmount += totalTransactionsAmount;
            summaryTotals.totalCashAmount += totalCashAmount;
            summaryTotals.totalOnlineAmount += totalOnlineAmount;
            summaryTotals.totalCommissionAmount += commissionAmount;
            summaryTotals.totalGstAmount += gstAmount;
            summaryTotals.totalDeduction += totalDeduction;
            summaryTotals.totalSettlementAmount += settlementAmount;
        }
        return {
            businesses: businessesWithSettlement,
            total: totalBusinesses,
            page,
            totalPages: Math.ceil(totalBusinesses / limit),
            dateFilter: {
                date: filters.date,
                startDate: filters.startDate,
                endDate: filters.endDate,
            },
            summary: {
                totalTransactionsAmount: Math.round(summaryTotals.totalTransactionsAmount * 100) / 100,
                totalCashAmount: Math.round(summaryTotals.totalCashAmount * 100) / 100,
                totalOnlineAmount: Math.round(summaryTotals.totalOnlineAmount * 100) / 100,
                totalCommissionAmount: Math.round(summaryTotals.totalCommissionAmount * 100) / 100,
                totalGstAmount: Math.round(summaryTotals.totalGstAmount * 100) / 100,
                totalDeduction: Math.round(summaryTotals.totalDeduction * 100) / 100,
                totalSettlementAmount: Math.round(summaryTotals.totalSettlementAmount * 100) / 100,
                totalBusinesses,
            },
        };
    }
    async getAllHistory(filters) {
        const page = filters?.page || 1;
        const limit = filters?.limit || 50;
        const skip = (page - 1) * limit;
        let bookingQuery = this.bookingRepository
            .createQueryBuilder('b')
            .leftJoinAndSelect('b.businessOwner', 'businessOwner')
            .leftJoinAndSelect('businessOwner.user', 'boUser')
            .leftJoinAndSelect('businessOwner.addresses', 'addresses')
            .leftJoinAndSelect('b.customer', 'customer')
            .where('b.status = :status', { status: enums_1.BookingStatus.COMPLETED })
            .andWhere('b.serviceCompletedAt IS NOT NULL');
        if (filters?.startDate) {
            bookingQuery.andWhere('b.serviceCompletedAt >= :startDate', {
                startDate: new Date(filters.startDate)
            });
        }
        if (filters?.endDate) {
            bookingQuery.andWhere('b.serviceCompletedAt <= :endDate', {
                endDate: new Date(filters.endDate + 'T23:59:59')
            });
        }
        if (filters?.businessOwnerId) {
            bookingQuery.andWhere('b.businessOwnerId = :businessOwnerId', {
                businessOwnerId: filters.businessOwnerId
            });
        }
        const totalCount = await bookingQuery.getCount();
        const bookings = await bookingQuery
            .orderBy('b.serviceCompletedAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getMany();
        const summaryQuery = this.bookingRepository
            .createQueryBuilder('b')
            .select('COUNT(*)', 'count')
            .addSelect('COALESCE(SUM(b.totalAmount), 0)', 'total')
            .where('b.status = :status', { status: enums_1.BookingStatus.COMPLETED })
            .andWhere('b.serviceCompletedAt IS NOT NULL');
        if (filters?.startDate) {
            summaryQuery.andWhere('b.serviceCompletedAt >= :startDate', {
                startDate: new Date(filters.startDate)
            });
        }
        if (filters?.endDate) {
            summaryQuery.andWhere('b.serviceCompletedAt <= :endDate', {
                endDate: new Date(filters.endDate + 'T23:59:59')
            });
        }
        if (filters?.businessOwnerId) {
            summaryQuery.andWhere('b.businessOwnerId = :businessOwnerId', {
                businessOwnerId: filters.businessOwnerId
            });
        }
        const configDate = filters?.endDate ? new Date(filters.endDate) : new Date();
        const { commissionPercent, gstPercent } = await this.getCommissionConfig(configDate);
        const summaryResult = await summaryQuery.getRawOne();
        const totalTransactionsAmount = parseFloat(summaryResult.total) || 0;
        const commissionAmount = (totalTransactionsAmount * commissionPercent) / 100;
        const gstAmount = (commissionAmount * gstPercent) / 100;
        const totalDeduction = commissionAmount + gstAmount;
        const settlementAmount = totalTransactionsAmount - totalDeduction;
        const history = bookings.map(booking => {
            const amount = Number(booking.totalAmount) || 0;
            const commission = (amount * commissionPercent) / 100;
            const gst = (commission * gstPercent) / 100;
            const deduction = commission + gst;
            const settlement = amount - deduction;
            const bo = booking.businessOwner;
            const primaryAddress = bo?.addresses?.find(a => a.isPrimary) || bo?.addresses?.[0];
            return {
                bookingId: booking.id,
                date: booking.serviceCompletedAt?.toISOString().split('T')[0] || 'N/A',
                completedAt: booking.serviceCompletedAt,
                businessOwnerId: bo?.id || 'N/A',
                ownerName: bo ? [bo.firstName, bo.lastName].filter(Boolean).join(' ') || 'N/A' : 'N/A',
                salonName: bo?.businessName || 'N/A',
                email: bo?.user?.email || 'N/A',
                mobileNumber: bo?.user?.phone || 'N/A',
                address: primaryAddress
                    ? [primaryAddress.streetAddress, primaryAddress.city, primaryAddress.state].filter(Boolean).join(', ')
                    : 'N/A',
                customerName: booking.customer
                    ? [booking.customer.firstName, booking.customer.lastName].filter(Boolean).join(' ') || 'N/A'
                    : 'N/A',
                amount: Math.round(amount * 100) / 100,
                paymentMethod: booking.paymentMethod || 'N/A',
                commissionAmount: Math.round(commission * 100) / 100,
                gstAmount: Math.round(gst * 100) / 100,
                totalDeduction: Math.round(deduction * 100) / 100,
                settlementAmount: Math.round(settlement * 100) / 100,
            };
        });
        return {
            history,
            total: totalCount,
            page,
            totalPages: Math.ceil(totalCount / limit),
            summary: {
                totalTransactionsAmount: Math.round(totalTransactionsAmount * 100) / 100,
                totalCommissionAmount: Math.round(commissionAmount * 100) / 100,
                totalGstAmount: Math.round(gstAmount * 100) / 100,
                totalDeduction: Math.round(totalDeduction * 100) / 100,
                totalSettlementAmount: Math.round(settlementAmount * 100) / 100,
                totalBookings: parseInt(summaryResult.count) || 0,
            },
        };
    }
    async getSettlementDetails(params) {
        const { businessOwnerId, date, startDate, endDate } = params;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!businessOwnerId || !uuidRegex.test(businessOwnerId)) {
            throw new common_1.BadRequestException(`Invalid businessOwnerId format: ${businessOwnerId}`);
        }
        this.logger.log(`Fetching settlement details for ${businessOwnerId}, date: ${date}, range: ${startDate} - ${endDate}`);
        try {
            const businessOwner = await this.businessOwnerRepository.findOne({
                where: { id: businessOwnerId },
                relations: ['user', 'addresses'],
            });
            if (!businessOwner) {
                throw new common_1.NotFoundException(`Business owner not found with ID: ${businessOwnerId}`);
            }
            let startRange;
            let endRange;
            const isValidDate = (d) => d && d !== 'null' && !isNaN(new Date(d).getTime());
            if (isValidDate(date)) {
                startRange = new Date(`${date}T00:00:00`);
                endRange = new Date(`${date}T23:59:59.999`);
            }
            else {
                const sDate = isValidDate(startDate) ? startDate : '2000-01-01';
                const eDate = isValidDate(endDate) ? endDate : new Date().toISOString().split('T')[0];
                startRange = new Date(`${sDate}T00:00:00`);
                endRange = new Date(`${eDate}T23:59:59.999`);
            }
            let completedBookings = await this.bookingRepository
                .createQueryBuilder('b')
                .leftJoinAndSelect('b.customer', 'customer')
                .leftJoinAndSelect('customer.user', 'customerUser')
                .leftJoinAndSelect('b.bookingServices', 'bookingServices')
                .leftJoinAndSelect('bookingServices.service', 'service')
                .where('b.businessOwnerId = :businessOwnerId', { businessOwnerId })
                .andWhere('b.status = :status', { status: enums_1.BookingStatus.COMPLETED })
                .andWhere('b.serviceCompletedAt BETWEEN :startRange AND :endRange', { startRange, endRange })
                .orderBy('b.serviceCompletedAt', 'DESC')
                .getMany();
            if (completedBookings.length === 0) {
                this.logger.log(`No bookings found via serviceCompletedAt, trying appointmentDate fallback...`);
                completedBookings = await this.bookingRepository
                    .createQueryBuilder('b')
                    .leftJoinAndSelect('b.customer', 'customer')
                    .leftJoinAndSelect('customer.user', 'customerUser')
                    .leftJoinAndSelect('b.bookingServices', 'bookingServices')
                    .leftJoinAndSelect('bookingServices.service', 'service')
                    .where('b.businessOwnerId = :businessOwnerId', { businessOwnerId })
                    .andWhere('b.status = :status', { status: enums_1.BookingStatus.COMPLETED })
                    .andWhere('b.appointmentDate BETWEEN :startDate AND :endDate', {
                    startDate: startRange.toISOString().split('T')[0],
                    endDate: endRange.toISOString().split('T')[0]
                })
                    .orderBy('b.appointmentDate', 'DESC')
                    .getMany();
            }
            this.logger.log(`Found ${completedBookings.length} completed bookings for the period`);
            const transactions = completedBookings.map(booking => ({
                bookingId: booking.id,
                customerName: booking.customer
                    ? [booking.customer.firstName, booking.customer.lastName].filter(Boolean).join(' ') || 'N/A'
                    : 'N/A',
                customerPhone: booking.customer?.user?.phone || 'N/A',
                services: booking.bookingServices?.map(bs => ({
                    name: bs.service?.name || 'N/A',
                    price: Number(bs.price) || 0,
                })) || [],
                amount: Number(booking.totalAmount) || 0,
                paymentMethod: booking.paymentMethod || 'N/A',
                completedAt: booking.serviceCompletedAt,
            }));
            const totalTransactionsCount = completedBookings.length;
            let totalTransactionsAmount = 0;
            let totalCashAmount = 0;
            let totalOnlineAmount = 0;
            completedBookings.forEach(booking => {
                const amount = Number(booking.totalAmount) || 0;
                totalTransactionsAmount += amount;
                if (booking.paymentMethod === entities_1.PaymentMethodType.COD) {
                    totalCashAmount += amount;
                }
                else if (booking.paymentMethod === entities_1.PaymentMethodType.ONLINE) {
                    totalOnlineAmount += amount;
                }
            });
            this.logger.log(`Calculated totals: Count=${totalTransactionsCount}, Amount=${totalTransactionsAmount}`);
            const configDate = endRange || new Date();
            const { commissionPercent, gstPercent } = await this.getCommissionConfig(configDate);
            const commissionAmount = (totalTransactionsAmount * commissionPercent) / 100;
            const gstAmount = (commissionAmount * gstPercent) / 100;
            const totalDeduction = commissionAmount + gstAmount;
            const settlementAmount = totalOnlineAmount - totalDeduction;
            const ownerName = [businessOwner.firstName, businessOwner.lastName].filter(Boolean).join(' ') || 'N/A';
            const salonName = businessOwner.businessName || 'N/A';
            const email = businessOwner.user?.email || '';
            const mobileNumber = businessOwner.user?.phone || '';
            const primaryAddress = businessOwner.addresses?.find(a => a.isPrimary) || businessOwner.addresses?.[0];
            const address = primaryAddress
                ? [primaryAddress.streetAddress, primaryAddress.city, primaryAddress.state, primaryAddress.postalCode]
                    .filter(Boolean)
                    .join(', ')
                : 'N/A';
            const displayDate = date || (startDate && endDate ? `${startDate} to ${endDate}` : 'All Time');
            return {
                date: displayDate,
                ownerDetails: {
                    businessOwnerId,
                    ownerName,
                    email,
                    mobileNumber,
                },
                businessDetails: {
                    salonName,
                    address,
                    shopId: businessOwner.shopId || 'N/A',
                },
                transactions,
                settlement: {
                    totalTransactionsCount,
                    totalTransactionsAmount: Math.round(totalTransactionsAmount * 100) / 100,
                    totalCashAmount: Math.round(totalCashAmount * 100) / 100,
                    totalOnlineAmount: Math.round(totalOnlineAmount * 100) / 100,
                    commissionPercent: commissionPercent,
                    commissionAmount: Math.round(commissionAmount * 100) / 100,
                    gstPercent: gstPercent,
                    gstAmount: Math.round(gstAmount * 100) / 100,
                    totalDeduction: Math.round(totalDeduction * 100) / 100,
                    settlementAmount: Math.round(settlementAmount * 100) / 100,
                },
            };
        }
        catch (error) {
            this.logger.error(`Error in getSettlementDetails: ${error.message}`, error.stack);
            throw error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException
                ? error
                : new common_1.BadRequestException('Failed to fetch settlement details. Please check the parameters.');
        }
    }
    async updateSettlementStatus(settlementId, status, transactionReference, adminNotes) {
        const settlement = await this.dailySettlementRepository.findOne({
            where: { id: settlementId },
        });
        if (!settlement) {
            throw new common_1.NotFoundException(`Settlement not found with ID: ${settlementId}`);
        }
        settlement.paidStatus = status;
        if (status === entities_1.SettlementPaidStatus.PAID) {
            settlement.paidAt = new Date();
        }
        if (transactionReference) {
            settlement.transactionReference = transactionReference;
        }
        if (adminNotes) {
            settlement.adminNotes = adminNotes;
        }
        const updated = await this.dailySettlementRepository.save(settlement);
        this.logger.log(`Settlement ${settlementId} status updated to ${status}`);
        return updated;
    }
    async updateSettlementStatusByBusinessOwner(businessOwnerId, date, status, transactionReference, adminNotes) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { id: businessOwnerId },
            relations: ['user', 'addresses'],
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException(`Business owner not found with ID: ${businessOwnerId}`);
        }
        const isValidDate = (d) => d && d !== 'null' && !isNaN(new Date(d).getTime());
        if (!isValidDate(date)) {
            throw new common_1.BadRequestException(`Invalid date format for settlement: ${date}`);
        }
        const settlementDate = new Date(date);
        let settlement = await this.dailySettlementRepository.findOne({
            where: {
                businessOwnerId,
                settlementDate,
            },
        });
        if (!settlement) {
            const startOfDay = new Date(settlementDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(settlementDate);
            endOfDay.setHours(23, 59, 59, 999);
            const stats = await this.bookingRepository
                .createQueryBuilder('b')
                .where('b.businessOwnerId = :businessOwnerId', { businessOwnerId })
                .andWhere('b.status = :status', { status: enums_1.BookingStatus.COMPLETED })
                .andWhere('b.serviceCompletedAt BETWEEN :startOfRange AND :endOfRange', {
                startOfRange: startOfDay,
                endOfRange: endOfDay
            })
                .select('COUNT(*)', 'count')
                .addSelect('COALESCE(SUM(b.totalAmount), 0)', 'total')
                .addSelect(`COALESCE(SUM(CASE WHEN b.paymentMethod = '${entities_1.PaymentMethodType.COD}' THEN b.totalAmount ELSE 0 END), 0)`, 'cash')
                .addSelect(`COALESCE(SUM(CASE WHEN b.paymentMethod = '${entities_1.PaymentMethodType.ONLINE}' THEN b.totalAmount ELSE 0 END), 0)`, 'online')
                .getRawOne();
            const totalCount = parseInt(stats.count) || 0;
            const totalAmount = parseFloat(stats.total) || 0;
            const totalCashAmount = parseFloat(stats.cash) || 0;
            const totalOnlineAmount = parseFloat(stats.online) || 0;
            const { commissionPercent, gstPercent } = await this.getCommissionConfig(settlementDate);
            const commissionAmount = (totalAmount * commissionPercent) / 100;
            const gstAmount = (commissionAmount * gstPercent) / 100;
            const totalDeduction = commissionAmount + gstAmount;
            const settlementAmount = totalOnlineAmount - totalDeduction;
            const ownerName = [businessOwner.firstName, businessOwner.lastName].filter(Boolean).join(' ') || 'N/A';
            const salonName = businessOwner.businessName || 'N/A';
            const email = businessOwner.user?.email || '';
            const mobileNumber = businessOwner.user?.phone || '';
            const primaryAddress = businessOwner.addresses?.find(a => a.isPrimary) || businessOwner.addresses?.[0];
            const address = primaryAddress
                ? [primaryAddress.streetAddress, primaryAddress.city, primaryAddress.state, primaryAddress.postalCode]
                    .filter(Boolean)
                    .join(', ')
                : 'N/A';
            settlement = this.dailySettlementRepository.create({
                businessOwnerId,
                settlementDate,
                ownerName,
                salonName,
                email,
                mobileNumber,
                address,
                totalTransactionsCount: totalCount,
                totalTransactionsAmount: totalAmount,
                totalCashAmount,
                totalOnlineAmount,
                commissionPercent: commissionPercent,
                commissionAmount,
                gstPercent: gstPercent,
                gstAmount,
                totalDeduction,
                settlementAmount,
                paidStatus: status,
            });
        }
        else {
            settlement.paidStatus = status;
        }
        if (status === entities_1.SettlementPaidStatus.PAID) {
            settlement.paidAt = new Date();
        }
        if (transactionReference) {
            settlement.transactionReference = transactionReference;
        }
        if (adminNotes) {
            settlement.adminNotes = adminNotes;
        }
        await this.dailySettlementRepository.save(settlement);
        this.logger.log(`Settlement for ${businessOwnerId} on ${date} updated to ${status}`);
        return {
            message: `Settlement status updated to ${status}`,
            settlement: {
                businessOwnerId,
                date,
                paidStatus: status,
                transactionReference: settlement.transactionReference,
                adminNotes: settlement.adminNotes,
                paidAt: settlement.paidAt,
            },
        };
    }
    async generateDailySettlements(date) {
        const targetDate = new Date(date);
        const approvedBusinessOwners = await this.businessOwnerRepository.find({
            where: { isApproved: true },
            relations: ['user', 'addresses'],
        });
        let generated = 0;
        let updated = 0;
        for (const businessOwner of approvedBusinessOwners) {
            try {
                const result = await this.generateSettlementForBusinessOwner(businessOwner, targetDate);
                if (result === 'created')
                    generated++;
                else if (result === 'updated')
                    updated++;
            }
            catch (error) {
                this.logger.error(`Failed to generate settlement for business owner ${businessOwner.id}: ${error.message}`);
            }
        }
        this.logger.log(`Daily settlements for ${date}: Generated ${generated}, Updated ${updated}`);
        return { generated, updated };
    }
    async generateSettlementForBusinessOwner(businessOwner, date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        const completedBookings = await this.bookingRepository.find({
            where: {
                businessOwnerId: businessOwner.id,
                status: enums_1.BookingStatus.COMPLETED,
                serviceCompletedAt: (0, typeorm_2.Between)(startOfDay, endOfDay),
            },
        });
        if (completedBookings.length === 0) {
            return 'skipped';
        }
        const totalTransactionsCount = completedBookings.length;
        const totalTransactionsAmount = completedBookings.reduce((sum, booking) => sum + Number(booking.totalAmount), 0);
        const totalCashAmount = completedBookings.reduce((sum, booking) => sum + (booking.paymentMethod === entities_1.PaymentMethodType.COD ? Number(booking.totalAmount) : 0), 0);
        const totalOnlineAmount = completedBookings.reduce((sum, booking) => sum + (booking.paymentMethod === entities_1.PaymentMethodType.ONLINE ? Number(booking.totalAmount) : 0), 0);
        const { commissionPercent, gstPercent } = await this.getCommissionConfig(date);
        const commissionAmount = (totalTransactionsAmount * commissionPercent) / 100;
        const gstAmount = (commissionAmount * gstPercent) / 100;
        const totalDeduction = commissionAmount + gstAmount;
        const settlementAmount = totalOnlineAmount - totalDeduction;
        const ownerName = [businessOwner.firstName, businessOwner.lastName].filter(Boolean).join(' ') || 'N/A';
        const salonName = businessOwner.businessName || 'N/A';
        const email = businessOwner.user?.email || '';
        const mobileNumber = businessOwner.user?.phone || '';
        const primaryAddress = businessOwner.addresses?.find(a => a.isPrimary) || businessOwner.addresses?.[0];
        const address = primaryAddress
            ? [primaryAddress.streetAddress, primaryAddress.city, primaryAddress.state, primaryAddress.postalCode]
                .filter(Boolean)
                .join(', ')
            : 'N/A';
        const dateString = date.toISOString().split('T')[0];
        let existing = await this.dailySettlementRepository.findOne({
            where: {
                businessOwnerId: businessOwner.id,
                settlementDate: new Date(dateString),
            },
        });
        if (existing) {
            existing.ownerName = ownerName;
            existing.salonName = salonName;
            existing.email = email;
            existing.mobileNumber = mobileNumber;
            existing.address = address;
            existing.totalTransactionsCount = totalTransactionsCount;
            existing.totalTransactionsAmount = totalTransactionsAmount;
            existing.totalCashAmount = totalCashAmount;
            existing.totalOnlineAmount = totalOnlineAmount;
            existing.commissionPercent = commissionPercent;
            existing.commissionAmount = commissionAmount;
            existing.gstPercent = gstPercent;
            existing.gstAmount = gstAmount;
            existing.totalDeduction = totalDeduction;
            existing.settlementAmount = settlementAmount;
            await this.dailySettlementRepository.save(existing);
            return 'updated';
        }
        else {
            const newSettlement = this.dailySettlementRepository.create({
                businessOwnerId: businessOwner.id,
                settlementDate: new Date(dateString),
                ownerName,
                salonName,
                email,
                mobileNumber,
                address,
                totalTransactionsCount,
                totalTransactionsAmount,
                commissionPercent: commissionPercent,
                commissionAmount,
                gstPercent: gstPercent,
                gstAmount,
                totalDeduction,
                settlementAmount,
                paidStatus: entities_1.SettlementPaidStatus.PENDING,
            });
            await this.dailySettlementRepository.save(newSettlement);
            return 'created';
        }
    }
    async getSettlementById(id) {
        const settlement = await this.dailySettlementRepository.findOne({
            where: { id },
            relations: ['businessOwner'],
        });
        if (!settlement) {
            throw new common_1.NotFoundException(`Settlement not found with ID: ${id}`);
        }
        return settlement;
    }
};
exports.DailySettlementService = DailySettlementService;
exports.DailySettlementService = DailySettlementService = DailySettlementService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.DailySettlement)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.Booking)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.BusinessOwner)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.BusinessAddress)),
    __param(4, (0, typeorm_1.InjectRepository)(entities_1.CommissionConfig)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], DailySettlementService);
//# sourceMappingURL=daily-settlement.service.js.map