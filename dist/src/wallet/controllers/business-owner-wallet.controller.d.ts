import { WalletService } from '../wallet.service';
import { CommissionService } from '../commission.service';
import { SettlementService } from '../settlement.service';
import { CommissionPaymentService } from '../commission-payment.service';
import { DailySettlementService } from '../daily-settlement.service';
import { CreateCommissionPaymentDto, VerifyCommissionPaymentDto } from '../dto/commission-payment.dto';
export declare class BusinessOwnerWalletController {
    private readonly walletService;
    private readonly commissionService;
    private readonly settlementService;
    private readonly commissionPaymentService;
    private readonly dailySettlementService;
    constructor(walletService: WalletService, commissionService: CommissionService, settlementService: SettlementService, commissionPaymentService: CommissionPaymentService, dailySettlementService: DailySettlementService);
    getWalletStats(req: any): Promise<any>;
    getDailyStats(req: any, date?: string, startDate?: string, endDate?: string): Promise<any>;
    getDailyHistory(req: any, page?: number, limit?: number, startDate?: string, endDate?: string): Promise<any>;
    getTransactions(req: any, page?: number, limit?: number, category?: string, type?: string): Promise<any>;
    getCompleteTransactionHistory(req: any, page?: number, limit?: number, category?: string, type?: string, fromDate?: string, toDate?: string): Promise<any>;
    getSettlements(req: any, page?: number, limit?: number, status?: string): Promise<any>;
    getSettlementDetails(req: any, id: string): Promise<any>;
    getEarningsReport(req: any, year?: number, month?: number): Promise<any>;
    createCommissionPayment(req: any, createPaymentDto: CreateCommissionPaymentDto): Promise<any>;
    verifyCommissionPayment(req: any, verifyDto: VerifyCommissionPaymentDto): Promise<any>;
    getPaymentHistory(req: any, page?: number, limit?: number): Promise<any>;
    getPaymentDetails(req: any, id: string): Promise<any>;
}
