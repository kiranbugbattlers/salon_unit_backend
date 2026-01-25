import { BusinessOwnerTransactionHistoryService } from '../services/business-owner-transaction-history.service';
import { BusinessOwnerTransactionHistoryQueryDto, UpdateTransactionRemarkDto } from '../dto/business-owner-transaction-history.dto';
export declare class BusinessOwnerTransactionHistoryController {
    private readonly businessOwnerTransactionHistoryService;
    private readonly logger;
    constructor(businessOwnerTransactionHistoryService: BusinessOwnerTransactionHistoryService);
    getAllBusinessOwnerTransactions(queryDto: BusinessOwnerTransactionHistoryQueryDto): Promise<any>;
    getTransactionDayWise(query: any): Promise<any>;
    getTransactionById(transactionId: string): Promise<any>;
    updateTransactionRemark(transactionId: string, updateDto: UpdateTransactionRemarkDto): Promise<any>;
    deleteTransaction(transactionId: string): Promise<any>;
}
