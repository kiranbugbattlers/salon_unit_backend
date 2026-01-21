import { Repository, DataSource } from 'typeorm';
import { MonthlySettlement, SettlementStatus, SettlementTransaction, CommissionTransaction, CODTransaction, Booking, BusinessOwner, BankingInfo } from '../database/entities';
import { WalletService } from './wallet.service';
import { RazorpayPayoutService } from './razorpay-payout.service';
export declare class SettlementService {
    private readonly settlementRepository;
    private readonly settlementTransactionRepository;
    private readonly commissionTransactionRepository;
    private readonly codTransactionRepository;
    private readonly bookingRepository;
    private readonly businessOwnerRepository;
    private readonly bankingInfoRepository;
    private readonly walletService;
    private readonly razorpayPayoutService;
    private readonly dataSource;
    private readonly logger;
    constructor(settlementRepository: Repository<MonthlySettlement>, settlementTransactionRepository: Repository<SettlementTransaction>, commissionTransactionRepository: Repository<CommissionTransaction>, codTransactionRepository: Repository<CODTransaction>, bookingRepository: Repository<Booking>, businessOwnerRepository: Repository<BusinessOwner>, bankingInfoRepository: Repository<BankingInfo>, walletService: WalletService, razorpayPayoutService: RazorpayPayoutService, dataSource: DataSource);
    generateMonthlySettlement(businessOwnerId: string, month: string): Promise<MonthlySettlement>;
    generateAllMonthlySettlements(month: string): Promise<MonthlySettlement[]>;
    processPayout(settlementId: string): Promise<MonthlySettlement>;
    markPaymentReceived(settlementId: string, adminNotes?: string): Promise<MonthlySettlement>;
    getSettlementById(settlementId: string): Promise<MonthlySettlement>;
    getBusinessOwnerSettlements(businessOwnerId: string, options?: {
        page?: number;
        limit?: number;
        status?: SettlementStatus;
    }): Promise<{
        settlements: MonthlySettlement[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getAllSettlements(options?: {
        page?: number;
        limit?: number;
        status?: SettlementStatus;
        month?: string;
    }): Promise<{
        settlements: MonthlySettlement[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getPendingApprovals(): Promise<MonthlySettlement[]>;
    getSettlementStats(month: string): Promise<{
        totalSettlements: number;
        totalBookings: number;
        totalBookingAmount: number;
        totalCommission: number;
        totalPayouts: number;
        pendingCount: number;
        completedCount: number;
        requiresPaymentCount: number;
    }>;
}
