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
var BusinessOwnerTransactionHistoryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessOwnerTransactionHistoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../../database/entities");
const wallet_entity_1 = require("../../database/entities/wallet.entity");
let BusinessOwnerTransactionHistoryService = BusinessOwnerTransactionHistoryService_1 = class BusinessOwnerTransactionHistoryService {
    constructor(businessOwnerRepository, walletRepository, walletTransactionRepository) {
        this.businessOwnerRepository = businessOwnerRepository;
        this.walletRepository = walletRepository;
        this.walletTransactionRepository = walletTransactionRepository;
        this.logger = new common_1.Logger(BusinessOwnerTransactionHistoryService_1.name);
    }
    async getAllBusinessOwnerTransactions(queryDto) {
        try {
            this.logger.log('Getting all business owner transactions with filters');
            const whereConditions = {};
            if (queryDto.type)
                whereConditions.type = queryDto.type;
            if (queryDto.category)
                whereConditions.category = queryDto.category;
            if (queryDto.status)
                whereConditions.status = queryDto.status;
            if (queryDto.fromDate && queryDto.toDate) {
                const fromDate = new Date(queryDto.fromDate);
                const toDate = new Date(queryDto.toDate);
                toDate.setHours(23, 59, 59, 999);
                whereConditions.createdAt = (0, typeorm_2.Between)(fromDate, toDate);
            }
            else if (queryDto.fromDate) {
                whereConditions.createdAt = (0, typeorm_2.MoreThanOrEqual)(new Date(queryDto.fromDate));
            }
            else if (queryDto.toDate) {
                const toDate = new Date(queryDto.toDate);
                toDate.setHours(23, 59, 59, 999);
                whereConditions.createdAt = (0, typeorm_2.LessThanOrEqual)(toDate);
            }
            if (queryDto.search) {
                whereConditions.description = (0, typeorm_2.Like)(`%${queryDto.search}%`);
            }
            const orderBy = {};
            const validSortFields = ['createdAt', 'amount', 'type', 'category'];
            const validSortOrders = ['ASC', 'DESC'];
            const sortField = validSortFields.includes(queryDto.sortBy) ? queryDto.sortBy : 'createdAt';
            const sortOrder = validSortOrders.includes(queryDto.sortOrder) ? queryDto.sortOrder : 'DESC';
            orderBy[sortField] = sortOrder;
            const [transactions, total] = await this.walletTransactionRepository.findAndCount({
                where: whereConditions,
                relations: ['wallet', 'wallet.user', 'wallet.user.businessOwner', 'booking', 'payment', 'settlement'],
                order: orderBy,
                skip: (queryDto.page - 1) * queryDto.limit,
                take: queryDto.limit,
            });
            const businessOwnerTransactions = transactions.filter(transaction => transaction.wallet?.userType === wallet_entity_1.WalletUserType.BUSINESS_OWNER);
            let filteredTransactions = businessOwnerTransactions;
            if (queryDto.businessOwnerId) {
                filteredTransactions = businessOwnerTransactions.filter(transaction => transaction.wallet?.user?.businessOwner?.id === queryDto.businessOwnerId);
            }
            const enrichedTransactions = filteredTransactions.map(transaction => this.formatTransactionResponseWithBusinessOwner(transaction));
            const summary = await this.getBusinessOwnerTransactionsSummary(whereConditions, queryDto.businessOwnerId);
            return {
                code: 200,
                success: true,
                message: 'Business owner transactions retrieved successfully',
                data: {
                    transactions: enrichedTransactions,
                    pagination: {
                        page: queryDto.page,
                        limit: queryDto.limit,
                        total: filteredTransactions.length,
                        totalPages: Math.ceil(filteredTransactions.length / queryDto.limit),
                    },
                    summary,
                    filters: {
                        type: queryDto.type,
                        category: queryDto.category,
                        status: queryDto.status,
                        businessOwnerId: queryDto.businessOwnerId,
                        fromDate: queryDto.fromDate,
                        toDate: queryDto.toDate,
                        search: queryDto.search,
                    },
                },
            };
        }
        catch (error) {
            this.logger.error('Failed to get business owner transactions:', error);
            throw error;
        }
    }
    async getTransactionById(transactionId) {
        try {
            this.logger.log(`Getting transaction by ID: ${transactionId}`);
            const transaction = await this.walletTransactionRepository.findOne({
                where: { id: transactionId },
                relations: ['wallet', 'wallet.user', 'wallet.user.businessOwner', 'booking', 'payment', 'settlement'],
            });
            if (!transaction) {
                throw new common_1.NotFoundException('Transaction not found');
            }
            if (transaction.wallet?.userType !== wallet_entity_1.WalletUserType.BUSINESS_OWNER) {
                throw new common_1.BadRequestException('This is not a business owner transaction');
            }
            const enrichedTransaction = this.formatTransactionResponseWithBusinessOwner(transaction);
            return {
                code: 200,
                success: true,
                message: 'Transaction retrieved successfully',
                data: enrichedTransaction,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get transaction ${transactionId}:`, error);
            throw error;
        }
    }
    async getTransactionDayWise(query) {
        try {
            this.logger.log('Getting day-wise business owner transactions');
            const vendorWallets = await this.walletRepository.find({
                where: { userType: wallet_entity_1.WalletUserType.BUSINESS_OWNER },
                select: ['id', 'userId'],
            });
            let vendorWalletIds = vendorWallets.map(w => w.id);
            if (query.businessOwnerId) {
                const specificWallet = await this.walletRepository.findOne({
                    where: { userId: query.businessOwnerId, userType: wallet_entity_1.WalletUserType.BUSINESS_OWNER },
                    select: ['id'],
                });
                vendorWalletIds = specificWallet ? [specificWallet.id] : [];
            }
            if (vendorWalletIds.length === 0) {
                return {
                    code: 200,
                    success: true,
                    message: 'Day-wise transactions retrieved successfully',
                    data: {
                        dayWiseTransactions: [],
                        summary: {
                            totalDays: 0,
                            totalTransactions: 0,
                            totalAmount: 0,
                        },
                    },
                };
            }
            const queryBuilder = this.walletTransactionRepository.createQueryBuilder('transaction')
                .leftJoinAndSelect('transaction.wallet', 'wallet')
                .leftJoinAndSelect('wallet.user', 'user')
                .leftJoinAndSelect('user.businessOwner', 'businessOwner')
                .where('transaction.walletId IN (:...walletIds)', { walletIds: vendorWalletIds });
            if (query.date) {
                const targetDate = new Date(query.date);
                const startOfDay = new Date(targetDate);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(targetDate);
                endOfDay.setHours(23, 59, 59, 999);
                queryBuilder.andWhere('transaction.createdAt BETWEEN :startOfDay AND :endOfDay', {
                    startOfDay,
                    endOfDay
                });
                this.logger.log(`Filtering for exact date: ${query.date} (${startOfDay.toISOString()} to ${endOfDay.toISOString()})`);
            }
            else if (query.fromDate && query.toDate) {
                queryBuilder.andWhere('transaction.createdAt BETWEEN :fromDate AND :toDate', {
                    fromDate: new Date(query.fromDate),
                    toDate: new Date(query.toDate),
                });
            }
            else if (query.fromDate) {
                queryBuilder.andWhere('transaction.createdAt >= :fromDate', {
                    fromDate: new Date(query.fromDate),
                });
            }
            else if (query.toDate) {
                queryBuilder.andWhere('transaction.createdAt <= :toDate', {
                    toDate: new Date(query.toDate),
                });
            }
            const transactions = await queryBuilder.orderBy('transaction.createdAt', 'DESC').getMany();
            const dayWiseMap = new Map();
            transactions.forEach(transaction => {
                const date = transaction.createdAt.toISOString().split('T')[0];
                if (!dayWiseMap.has(date)) {
                    dayWiseMap.set(date, []);
                }
                dayWiseMap.get(date).push(this.formatTransactionResponseWithBusinessOwner(transaction));
            });
            const dayWiseTransactions = Array.from(dayWiseMap.entries()).map(([date, dayTransactions]) => {
                const totalAmount = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
                const creditAmount = dayTransactions
                    .filter(t => t.transactionType.toLowerCase() === 'credit')
                    .reduce((sum, t) => sum + t.amount, 0);
                const debitAmount = dayTransactions
                    .filter(t => t.transactionType.toLowerCase() === 'debit')
                    .reduce((sum, t) => sum + t.amount, 0);
                return {
                    date,
                    transactions: dayTransactions,
                    summary: {
                        totalTransactions: dayTransactions.length,
                        totalAmount,
                        creditAmount,
                        debitAmount,
                        netAmount: creditAmount - debitAmount,
                    },
                };
            }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            const totalTransactions = transactions.length;
            const totalAmount = transactions.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
            const totalCreditAmount = transactions
                .filter(t => t.type === 'credit')
                .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
            const totalDebitAmount = transactions
                .filter(t => t.type === 'debit')
                .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
            return {
                code: 200,
                success: true,
                message: 'Day-wise transactions retrieved successfully',
                data: {
                    dayWiseTransactions,
                    summary: {
                        totalDays: dayWiseTransactions.length,
                        totalTransactions,
                        totalAmount,
                        totalCreditAmount,
                        totalDebitAmount,
                        netAmount: totalCreditAmount - totalDebitAmount,
                    },
                    filters: {
                        date: query.date,
                        businessOwnerId: query.businessOwnerId,
                        fromDate: query.fromDate,
                        toDate: query.toDate,
                    },
                },
            };
        }
        catch (error) {
            this.logger.error('Failed to get day-wise transactions:', error);
            throw error;
        }
    }
    async updateTransactionRemark(transactionId, updateDto) {
        try {
            this.logger.log(`Updating remark for transaction: ${transactionId}`);
            const transaction = await this.walletTransactionRepository.findOne({
                where: { id: transactionId },
                relations: ['wallet'],
            });
            if (!transaction) {
                throw new common_1.NotFoundException('Transaction not found');
            }
            if (transaction.wallet?.userType !== wallet_entity_1.WalletUserType.BUSINESS_OWNER) {
                throw new common_1.BadRequestException('This is not a business owner transaction');
            }
            const oldDescription = transaction.description;
            transaction.description = `${oldDescription} [Remark: ${updateDto.remark}]`;
            await this.walletTransactionRepository.save(transaction);
            return {
                code: 200,
                success: true,
                message: 'Transaction remark updated successfully',
                data: {
                    id: transaction.id,
                    description: transaction.description,
                    remark: updateDto.remark,
                },
            };
        }
        catch (error) {
            this.logger.error(`Failed to update remark for transaction ${transactionId}:`, error);
            throw error;
        }
    }
    async deleteTransaction(transactionId) {
        try {
            this.logger.log(`Deleting transaction: ${transactionId}`);
            const transaction = await this.walletTransactionRepository.findOne({
                where: { id: transactionId },
                relations: ['wallet'],
            });
            if (!transaction) {
                throw new common_1.NotFoundException('Transaction not found');
            }
            if (transaction.wallet?.userType !== wallet_entity_1.WalletUserType.BUSINESS_OWNER) {
                throw new common_1.BadRequestException('This is not a business owner transaction');
            }
            if (transaction.status === entities_1.WalletTransactionStatus.COMPLETED) {
                throw new common_1.BadRequestException('Cannot delete completed transactions');
            }
            transaction.status = entities_1.WalletTransactionStatus.FAILED;
            transaction.description = `${transaction.description} [DELETED]`;
            await this.walletTransactionRepository.save(transaction);
            return {
                code: 200,
                success: true,
                message: 'Transaction deleted successfully',
                data: {
                    id: transaction.id,
                    status: transaction.status,
                },
            };
        }
        catch (error) {
            this.logger.error(`Failed to delete transaction ${transactionId}:`, error);
            throw error;
        }
    }
    formatTransactionResponseWithBusinessOwner(transaction) {
        const businessOwner = transaction.wallet?.user?.businessOwner;
        const user = transaction.wallet?.user;
        return {
            id: transaction.id,
            createdAt: transaction.createdAt,
            description: transaction.description,
            previousBalance: parseFloat(transaction.balanceBefore.toString()),
            amount: parseFloat(transaction.amount.toString()),
            currentBalance: parseFloat(transaction.balanceAfter.toString()),
            transactionId: transaction.id,
            transactionType: transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1),
            status: transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1),
            remark: transaction.metadata?.remark || transaction.description,
            category: transaction.category,
            bookingId: transaction.bookingId,
            paymentId: transaction.paymentId,
            settlementId: transaction.settlementId,
            businessOwner: businessOwner ? {
                id: businessOwner.id,
                businessName: businessOwner.businessName || 'N/A',
                ownerName: businessOwner.firstName && businessOwner.lastName
                    ? `${businessOwner.firstName} ${businessOwner.lastName}`.trim()
                    : businessOwner.businessName || 'N/A',
                firstName: businessOwner.firstName || 'N/A',
                lastName: businessOwner.lastName || 'N/A',
                email: user?.email || 'N/A',
                phone: user?.phone || 'N/A',
                shopId: businessOwner.shopId || 'N/A',
                isApproved: businessOwner.isApproved || false,
                isActive: businessOwner.isActive || false,
                vendorStatus: businessOwner.vendorStatus || 'N/A',
                creditLimit: businessOwner.creditLimit || 0,
                upiId: businessOwner.upiId || 'N/A',
                createdAt: businessOwner.createdAt,
                updatedAt: businessOwner.updatedAt,
            } : null,
            wallet: {
                id: transaction.wallet?.id,
                currentBalance: transaction.wallet?.balance || 0,
                userId: transaction.wallet?.userId,
                userType: transaction.wallet?.userType,
            },
        };
    }
    async getBusinessOwnerTransactionsSummary(whereConditions, businessOwnerId) {
        try {
            const vendorWallets = await this.walletRepository.find({
                where: { userType: wallet_entity_1.WalletUserType.BUSINESS_OWNER },
                select: ['id', 'userId'],
            });
            let vendorWalletIds = vendorWallets.map(w => w.id);
            if (businessOwnerId) {
                const specificWallet = await this.walletRepository.findOne({
                    where: { userId: businessOwnerId, userType: wallet_entity_1.WalletUserType.BUSINESS_OWNER },
                    select: ['id'],
                });
                vendorWalletIds = specificWallet ? [specificWallet.id] : [];
            }
            if (vendorWalletIds.length === 0) {
                return {
                    totalCredits: 0,
                    totalDebits: 0,
                    netBalance: 0,
                    totalTransactions: 0,
                    successfulTransactions: 0,
                    pendingTransactions: 0,
                    failedTransactions: 0,
                };
            }
            const queryBuilder = this.walletTransactionRepository.createQueryBuilder('transaction');
            if (whereConditions.type) {
                queryBuilder.andWhere('transaction.type = :type', { type: whereConditions.type });
            }
            if (whereConditions.category) {
                queryBuilder.andWhere('transaction.category = :category', { category: whereConditions.category });
            }
            if (whereConditions.status) {
                queryBuilder.andWhere('transaction.status = :status', { status: whereConditions.status });
            }
            if (whereConditions.description) {
                queryBuilder.andWhere('transaction.description ILIKE :description', { description: whereConditions.description });
            }
            if (whereConditions.createdAt) {
                if (whereConditions.createdAt instanceof typeorm_2.Between) {
                    queryBuilder.andWhere('transaction.createdAt BETWEEN :fromDate AND :toDate', {
                        fromDate: whereConditions.createdAt.value[0],
                        toDate: whereConditions.createdAt.value[1],
                    });
                }
                else if (whereConditions.createdAt instanceof typeorm_2.MoreThanOrEqual) {
                    queryBuilder.andWhere('transaction.createdAt >= :fromDate', { fromDate: whereConditions.createdAt.value });
                }
                else if (whereConditions.createdAt instanceof typeorm_2.LessThanOrEqual) {
                    queryBuilder.andWhere('transaction.createdAt <= :toDate', { toDate: whereConditions.createdAt.value });
                }
            }
            queryBuilder.andWhere('transaction.walletId IN (:...walletIds)', { walletIds: vendorWalletIds });
            const transactions = await queryBuilder.getMany();
            const totalCredits = transactions
                .filter(t => t.type === 'credit')
                .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
            const totalDebits = transactions
                .filter(t => t.type === 'debit')
                .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
            const successfulTransactions = transactions.filter(t => t.status === 'completed').length;
            const pendingTransactions = transactions.filter(t => t.status === 'pending').length;
            const failedTransactions = transactions.filter(t => t.status === 'failed').length;
            return {
                totalCredits,
                totalDebits,
                netBalance: totalCredits - totalDebits,
                totalTransactions: transactions.length,
                successfulTransactions,
                pendingTransactions,
                failedTransactions,
            };
        }
        catch (error) {
            this.logger.error('Failed to calculate business owner transactions summary:', error);
            return {
                totalCredits: 0,
                totalDebits: 0,
                netBalance: 0,
                totalTransactions: 0,
                successfulTransactions: 0,
                pendingTransactions: 0,
                failedTransactions: 0,
            };
        }
    }
};
exports.BusinessOwnerTransactionHistoryService = BusinessOwnerTransactionHistoryService;
exports.BusinessOwnerTransactionHistoryService = BusinessOwnerTransactionHistoryService = BusinessOwnerTransactionHistoryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.BusinessOwner)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.Wallet)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.WalletTransaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], BusinessOwnerTransactionHistoryService);
//# sourceMappingURL=business-owner-transaction-history.service.js.map