import { Repository, DataSource } from 'typeorm';
import { DailySettlement, SettlementPaidStatus, Booking, BusinessOwner, BusinessAddress, CommissionConfig } from '../database/entities';
export declare class DailySettlementService {
    private readonly dailySettlementRepository;
    private readonly bookingRepository;
    private readonly businessOwnerRepository;
    private readonly businessAddressRepository;
    private readonly commissionConfigRepository;
    private readonly dataSource;
    private readonly logger;
    private readonly DEFAULT_COMMISSION_PERCENT;
    private readonly DEFAULT_GST_PERCENT;
    constructor(dailySettlementRepository: Repository<DailySettlement>, bookingRepository: Repository<Booking>, businessOwnerRepository: Repository<BusinessOwner>, businessAddressRepository: Repository<BusinessAddress>, commissionConfigRepository: Repository<CommissionConfig>, dataSource: DataSource);
    private getCommissionConfig;
    getAllSettlements(filters: {
        date?: string;
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        businesses: any[];
        total: number;
        page: number;
        totalPages: number;
        dateFilter: {
            date?: string;
            startDate?: string;
            endDate?: string;
        };
        summary: {
            totalTransactionsAmount: number;
            totalCashAmount: number;
            totalOnlineAmount: number;
            totalCommissionAmount: number;
            totalGstAmount: number;
            totalDeduction: number;
            totalSettlementAmount: number;
            totalBusinesses: number;
        };
    }>;
    getAllHistory(filters: {
        page?: number;
        limit?: number;
        startDate?: string;
        endDate?: string;
        businessOwnerId?: string;
    }): Promise<any>;
    getSettlementDetails(params: {
        businessOwnerId: string;
        date?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<any>;
    updateSettlementStatus(settlementId: string, status: SettlementPaidStatus, transactionReference?: string, adminNotes?: string): Promise<DailySettlement>;
    updateSettlementStatusByBusinessOwner(businessOwnerId: string, date: string, status: SettlementPaidStatus, transactionReference?: string, adminNotes?: string): Promise<{
        message: string;
        settlement: any;
    }>;
    generateDailySettlements(date: string): Promise<{
        generated: number;
        updated: number;
    }>;
    private generateSettlementForBusinessOwner;
    getSettlementById(id: string): Promise<DailySettlement>;
}
