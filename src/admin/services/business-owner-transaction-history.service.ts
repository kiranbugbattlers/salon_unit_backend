import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, Like } from 'typeorm';
import { BusinessOwner, Wallet, WalletTransaction, WalletTransactionStatus } from '../../database/entities';
import { WalletUserType } from '../../database/entities/wallet.entity';
import { 
  BusinessOwnerTransactionHistoryQueryDto, 
  BusinessOwnerTransactionResponseDto, 
  UpdateTransactionRemarkDto,
  TransactionSummaryDto 
} from '../dto/business-owner-transaction-history.dto';

@Injectable()
export class BusinessOwnerTransactionHistoryService {
  private readonly logger = new Logger(BusinessOwnerTransactionHistoryService.name);

  constructor(
    @InjectRepository(BusinessOwner)
    private readonly businessOwnerRepository: Repository<BusinessOwner>,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(WalletTransaction)
    private readonly walletTransactionRepository: Repository<WalletTransaction>,
  ) {}

  /**
   * Get all business owner transactions with filtering and pagination
   */
  async getAllBusinessOwnerTransactions(queryDto: BusinessOwnerTransactionHistoryQueryDto): Promise<any> {
    try {
      this.logger.log('Getting all business owner transactions with filters');

      // Build query conditions
      const whereConditions: any = {};

      if (queryDto.type) whereConditions.type = queryDto.type;
      if (queryDto.category) whereConditions.category = queryDto.category;
      if (queryDto.status) whereConditions.status = queryDto.status;

      // Date filtering
      if (queryDto.fromDate && queryDto.toDate) {
        const fromDate = new Date(queryDto.fromDate);
        const toDate = new Date(queryDto.toDate);
        // Set toDate to end of day (23:59:59.999)
        toDate.setHours(23, 59, 59, 999);
        
        whereConditions.createdAt = Between(fromDate, toDate);
      } else if (queryDto.fromDate) {
        whereConditions.createdAt = MoreThanOrEqual(new Date(queryDto.fromDate));
      } else if (queryDto.toDate) {
        const toDate = new Date(queryDto.toDate);
        // Set toDate to end of day (23:59:59.999)
        toDate.setHours(23, 59, 59, 999);
        
        whereConditions.createdAt = LessThanOrEqual(toDate);
      }

      // Search filtering
      if (queryDto.search) {
        whereConditions.description = Like(`%${queryDto.search}%`);
      }

      // Build order by with validation
      const orderBy: any = {};
      const validSortFields = ['createdAt', 'amount', 'type', 'category'];
      const validSortOrders = ['ASC', 'DESC'];
      
      const sortField = validSortFields.includes(queryDto.sortBy) ? queryDto.sortBy : 'createdAt';
      const sortOrder = validSortOrders.includes(queryDto.sortOrder) ? queryDto.sortOrder : 'DESC';
      
      orderBy[sortField] = sortOrder;

      // Get transactions with pagination and relations
      const [transactions, total] = await this.walletTransactionRepository.findAndCount({
        where: whereConditions,
        relations: ['wallet', 'wallet.user', 'wallet.user.businessOwner', 'booking', 'payment', 'settlement'],
        order: orderBy,
        skip: (queryDto.page - 1) * queryDto.limit,
        take: queryDto.limit,
      });

      // Filter only business owner transactions
      const businessOwnerTransactions = transactions.filter(
        transaction => transaction.wallet?.userType === WalletUserType.BUSINESS_OWNER
      );

      // If businessOwnerId filter is specified, further filter
      let filteredTransactions = businessOwnerTransactions;
      if (queryDto.businessOwnerId) {
        filteredTransactions = businessOwnerTransactions.filter(
          transaction => transaction.wallet?.user?.businessOwner?.id === queryDto.businessOwnerId
        );
      }

      // Enrich transaction data with business owner details
      const enrichedTransactions = filteredTransactions.map(transaction => 
        this.formatTransactionResponseWithBusinessOwner(transaction)
      );

      // Get summary statistics
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
    } catch (error) {
      this.logger.error('Failed to get business owner transactions:', error);
      throw error;
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(transactionId: string): Promise<any> {
    try {
      this.logger.log(`Getting transaction by ID: ${transactionId}`);

      const transaction = await this.walletTransactionRepository.findOne({
        where: { id: transactionId },
        relations: ['wallet', 'wallet.user', 'wallet.user.businessOwner', 'booking', 'payment', 'settlement'],
      });

      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }

      // Check if it's a business owner transaction
      if (transaction.wallet?.userType !== WalletUserType.BUSINESS_OWNER) {
        throw new BadRequestException('This is not a business owner transaction');
      }

      const enrichedTransaction = this.formatTransactionResponseWithBusinessOwner(transaction);

      return {
        code: 200,
        success: true,
        message: 'Transaction retrieved successfully',
        data: enrichedTransaction,
      };
    } catch (error) {
      this.logger.error(`Failed to get transaction ${transactionId}:`, error);
      throw error;
    }
  }

  /**
   * Get business owner transactions grouped by day
   */
  async getTransactionDayWise(query: any): Promise<any> {
    try {
      this.logger.log('Getting day-wise business owner transactions');

      // Get all business owner wallet IDs first
      const vendorWallets = await this.walletRepository.find({
        where: { userType: WalletUserType.BUSINESS_OWNER },
        select: ['id', 'userId'],
      });

      let vendorWalletIds = vendorWallets.map(w => w.id);
      
      // If businessOwnerId filter is specified, get only that business owner's wallet
      if (query.businessOwnerId) {
        const specificWallet = await this.walletRepository.findOne({
          where: { userId: query.businessOwnerId, userType: WalletUserType.BUSINESS_OWNER },
          select: ['id'],
        });
        vendorWalletIds = specificWallet ? [specificWallet.id] : [];
      }
      
      // If no vendor wallets found, return empty result
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

      // Use TypeORM QueryBuilder for proper filtering
      const queryBuilder = this.walletTransactionRepository.createQueryBuilder('transaction')
        .leftJoinAndSelect('transaction.wallet', 'wallet')
        .leftJoinAndSelect('wallet.user', 'user')
        .leftJoinAndSelect('user.businessOwner', 'businessOwner')
        .where('transaction.walletId IN (:...walletIds)', { walletIds: vendorWalletIds });

      // Apply date filters directly
      if (query.date) {
        // Filter for specific date only - get exact 24-hour period
        const targetDate = new Date(query.date);
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0); // Start of day: 00:00:00.000
        
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999); // End of day: 23:59:59.999
        
        queryBuilder.andWhere('transaction.createdAt BETWEEN :startOfDay AND :endOfDay', {
          startOfDay,
          endOfDay
        });
        this.logger.log(`Filtering for exact date: ${query.date} (${startOfDay.toISOString()} to ${endOfDay.toISOString()})`);
      } else if (query.fromDate && query.toDate) {
        queryBuilder.andWhere('transaction.createdAt BETWEEN :fromDate AND :toDate', {
          fromDate: new Date(query.fromDate),
          toDate: new Date(query.toDate),
        });
      } else if (query.fromDate) {
        queryBuilder.andWhere('transaction.createdAt >= :fromDate', {
          fromDate: new Date(query.fromDate),
        });
      } else if (query.toDate) {
        queryBuilder.andWhere('transaction.createdAt <= :toDate', {
          toDate: new Date(query.toDate),
        });
      }

      const transactions = await queryBuilder.orderBy('transaction.createdAt', 'DESC').getMany();

      // Group transactions by date
      const dayWiseMap = new Map<string, any[]>();
      
      transactions.forEach(transaction => {
        const date = transaction.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        if (!dayWiseMap.has(date)) {
          dayWiseMap.set(date, []);
        }
        
        dayWiseMap.get(date).push(this.formatTransactionResponseWithBusinessOwner(transaction));
      });

      // Convert map to array and calculate daily summaries
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
      }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date descending

      // Calculate overall summary
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
    } catch (error) {
      this.logger.error('Failed to get day-wise transactions:', error);
      throw error;
    }
  }

  /**
   * Update transaction remark
   */
  async updateTransactionRemark(
    transactionId: string,
    updateDto: UpdateTransactionRemarkDto,
  ): Promise<any> {
    try {
      this.logger.log(`Updating remark for transaction: ${transactionId}`);

      const transaction = await this.walletTransactionRepository.findOne({
        where: { id: transactionId },
        relations: ['wallet'],
      });

      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }

      // Check if it's a business owner transaction
      if (transaction.wallet?.userType !== WalletUserType.BUSINESS_OWNER) {
        throw new BadRequestException('This is not a business owner transaction');
      }

      // Update the remark (store in metadata or description)
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
    } catch (error) {
      this.logger.error(`Failed to update remark for transaction ${transactionId}:`, error);
      throw error;
    }
  }

  /**
   * Delete transaction (soft delete by marking as failed)
   */
  async deleteTransaction(transactionId: string): Promise<any> {
    try {
      this.logger.log(`Deleting transaction: ${transactionId}`);

      const transaction = await this.walletTransactionRepository.findOne({
        where: { id: transactionId },
        relations: ['wallet'],
      });

      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }

      // Check if it's a business owner transaction
      if (transaction.wallet?.userType !== WalletUserType.BUSINESS_OWNER) {
        throw new BadRequestException('This is not a business owner transaction');
      }

      // Check if transaction can be deleted (only pending or failed transactions)
      if (transaction.status === WalletTransactionStatus.COMPLETED) {
        throw new BadRequestException('Cannot delete completed transactions');
      }

      // Soft delete by marking as failed
      transaction.status = WalletTransactionStatus.FAILED;
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
    } catch (error) {
      this.logger.error(`Failed to delete transaction ${transactionId}:`, error);
      throw error;
    }
  }

  /**
   * Format transaction response with business owner details
   */
  private formatTransactionResponseWithBusinessOwner(transaction: WalletTransaction): BusinessOwnerTransactionResponseDto {
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
      transactionType: transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1), // Credit/Debit
      status: transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1), // Success/Pending/Failed
      remark: transaction.metadata?.remark || transaction.description,
      category: transaction.category,
      bookingId: transaction.bookingId,
      paymentId: transaction.paymentId,
      settlementId: transaction.settlementId,
      // Business Owner Details
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
      // Wallet Details
      wallet: {
        id: transaction.wallet?.id,
        currentBalance: transaction.wallet?.balance || 0,
        userId: transaction.wallet?.userId,
        userType: transaction.wallet?.userType,
      },
    };
  }

  /**
   * Get business owner transactions summary
   */
  private async getBusinessOwnerTransactionsSummary(
    whereConditions: any, 
    businessOwnerId?: string
  ): Promise<TransactionSummaryDto> {
    try {
      // Get all business owner wallet IDs first
      const vendorWallets = await this.walletRepository.find({
        where: { userType: WalletUserType.BUSINESS_OWNER },
        select: ['id', 'userId'],
      });

      let vendorWalletIds = vendorWallets.map(w => w.id);
      
      // If businessOwnerId filter is specified, get only that business owner's wallet
      if (businessOwnerId) {
        const specificWallet = await this.walletRepository.findOne({
          where: { userId: businessOwnerId, userType: WalletUserType.BUSINESS_OWNER },
          select: ['id'],
        });
        vendorWalletIds = specificWallet ? [specificWallet.id] : [];
      }
      
      // If no vendor wallets found, return empty summary
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

      // Use TypeORM QueryBuilder for proper IN clause syntax
      const queryBuilder = this.walletTransactionRepository.createQueryBuilder('transaction');
      
      // Apply base conditions
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
        if (whereConditions.createdAt instanceof Between) {
          queryBuilder.andWhere('transaction.createdAt BETWEEN :fromDate AND :toDate', {
            fromDate: whereConditions.createdAt.value[0],
            toDate: whereConditions.createdAt.value[1],
          });
        } else if (whereConditions.createdAt instanceof MoreThanOrEqual) {
          queryBuilder.andWhere('transaction.createdAt >= :fromDate', { fromDate: whereConditions.createdAt.value });
        } else if (whereConditions.createdAt instanceof LessThanOrEqual) {
          queryBuilder.andWhere('transaction.createdAt <= :toDate', { toDate: whereConditions.createdAt.value });
        }
      }
      
      // Add wallet filter using proper IN clause
      queryBuilder.andWhere('transaction.walletId IN (:...walletIds)', { walletIds: vendorWalletIds });

      const transactions = await queryBuilder.getMany();

      // Calculate summary statistics
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
    } catch (error) {
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
}
