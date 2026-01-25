import { Repository, DataSource } from 'typeorm';
import { Wallet, BusinessOwner, BankingInfo, WalletTransaction } from '../database/entities';
import { RazorpayPayoutService } from './razorpay-payout.service';
interface PayoutResult {
    businessOwnerId: string;
    shopId: string;
    walletId: string;
    amount: number;
    status: 'success' | 'failed' | 'skipped';
    reason?: string;
    razorpayPayoutId?: string;
}
interface PayoutSummary {
    totalProcessed: number;
    successCount: number;
    failedCount: number;
    skippedCount: number;
    totalPaidOut: number;
    results: PayoutResult[];
}
export declare class DailyPayoutService {
    private readonly walletRepository;
    private readonly businessOwnerRepository;
    private readonly bankingInfoRepository;
    private readonly walletTransactionRepository;
    private readonly razorpayPayoutService;
    private readonly dataSource;
    private readonly logger;
    constructor(walletRepository: Repository<Wallet>, businessOwnerRepository: Repository<BusinessOwner>, bankingInfoRepository: Repository<BankingInfo>, walletTransactionRepository: Repository<WalletTransaction>, razorpayPayoutService: RazorpayPayoutService, dataSource: DataSource);
    processDailyPayouts(): Promise<PayoutSummary>;
    private getEligibleWallets;
    private processBusinessOwnerPayout;
    private executePayout;
    private determinePayoutMode;
    private delay;
    getPayoutHistory(businessOwnerId: string, options?: {
        limit?: number;
        offset?: number;
    }): Promise<WalletTransaction[]>;
}
export {};
