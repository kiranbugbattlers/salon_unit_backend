import { Repository } from 'typeorm';
import { BusinessOwner } from '../database/entities/business-owner.entity';
import { BusinessOwnerTransactionHistory } from '../database/entities/business-owner-transaction-history.entity';
export declare class SettlementService {
    private readonly businessOwnerRepository;
    private readonly transactionHistoryRepository;
    constructor(businessOwnerRepository: Repository<BusinessOwner>, transactionHistoryRepository: Repository<BusinessOwnerTransactionHistory>);
    getBusinessOwnerSettlementHistory(businessOwnerId: string, user: any): Promise<any>;
}
