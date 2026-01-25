import { Repository } from 'typeorm';
import { BusinessOwner, Wallet, WalletTransaction } from '../../database/entities';
import { BusinessOwnerTransactionHistoryQueryDto, UpdateTransactionRemarkDto } from '../dto/business-owner-transaction-history.dto';
export declare class BusinessOwnerTransactionHistoryService {
    private readonly businessOwnerRepository;
    private readonly walletRepository;
    private readonly walletTransactionRepository;
    private readonly logger;
    constructor(businessOwnerRepository: Repository<BusinessOwner>, walletRepository: Repository<Wallet>, walletTransactionRepository: Repository<WalletTransaction>);
    getAllBusinessOwnerTransactions(queryDto: BusinessOwnerTransactionHistoryQueryDto): Promise<any>;
    getTransactionById(transactionId: string): Promise<any>;
    getTransactionDayWise(query: any): Promise<any>;
    updateTransactionRemark(transactionId: string, updateDto: UpdateTransactionRemarkDto): Promise<any>;
    deleteTransaction(transactionId: string): Promise<any>;
    private formatTransactionResponseWithBusinessOwner;
    private getBusinessOwnerTransactionsSummary;
}
