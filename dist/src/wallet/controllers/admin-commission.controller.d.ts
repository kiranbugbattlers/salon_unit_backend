import { CommissionService } from '../commission.service';
import { SettlementService } from '../settlement.service';
import { WalletService } from '../wallet.service';
import { CreateCommissionConfigDto, MarkPaymentReceivedDto } from '../dto/wallet.dto';
export declare class AdminCommissionController {
    private readonly commissionService;
    private readonly settlementService;
    private readonly walletService;
    constructor(commissionService: CommissionService, settlementService: SettlementService, walletService: WalletService);
    createCommissionConfig(req: any, createDto: CreateCommissionConfigDto): Promise<any>;
    getActiveCommissionConfig(): Promise<any>;
    getCommissionConfigHistory(limit?: number): Promise<any>;
    getAllSettlements(page?: number, limit?: number, status?: string, month?: string): Promise<any>;
    getPendingApprovals(): Promise<any>;
    getSettlementStats(month: string): Promise<any>;
    getSettlementById(id: string): Promise<any>;
    generateMonthlySettlements(month: string): Promise<any>;
    processPayout(id: string): Promise<any>;
    markPaymentReceived(id: string, dto: MarkPaymentReceivedDto): Promise<any>;
    getCommissionTransactions(businessOwnerId?: string, customerId?: string, status?: string, startDate?: string, endDate?: string, page?: number, limit?: number): Promise<any>;
    getAllWallets(userType?: string, page?: number, limit?: number): Promise<any>;
    adjustWallet(req: any, walletId: string, body: {
        amount: number;
        reason: string;
    }): Promise<any>;
    reconcileWallet(walletId: string): Promise<any>;
    getCommissionSummaryReport(startDate?: string, endDate?: string): Promise<any>;
    getWalletSummaryReport(): Promise<any>;
}
