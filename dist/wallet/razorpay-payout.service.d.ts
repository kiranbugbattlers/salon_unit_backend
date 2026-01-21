import { ConfigService } from '@nestjs/config';
import { Repository, DataSource } from 'typeorm';
import { BankingInfo, MonthlySettlement, BusinessOwner } from '../database/entities';
import { EncryptionService } from './encryption.service';
interface RazorpayContact {
    id: string;
    entity: string;
    name: string;
    contact: string;
    email: string;
    type: string;
    reference_id: string;
    notes: any;
    created_at: number;
}
export declare class RazorpayPayoutService {
    private readonly configService;
    private readonly encryptionService;
    private readonly dataSource;
    private readonly bankingInfoRepository;
    private readonly settlementRepository;
    private readonly logger;
    private readonly razorpay;
    private readonly accountNumber;
    constructor(configService: ConfigService, encryptionService: EncryptionService, dataSource: DataSource, bankingInfoRepository: Repository<BankingInfo>, settlementRepository: Repository<MonthlySettlement>);
    createContact(businessOwner: BusinessOwner): Promise<RazorpayContact>;
    createFundAccount(bankingInfoId: string): Promise<string>;
    processPayout(settlementId: string): Promise<MonthlySettlement>;
    pollPayoutStatus(settlementId: string): Promise<void>;
    handlePayoutWebhook(payload: any): Promise<void>;
    retryPayout(settlementId: string): Promise<MonthlySettlement>;
    private determinePayoutMode;
    getPayoutStats(month?: string): Promise<any>;
}
export {};
