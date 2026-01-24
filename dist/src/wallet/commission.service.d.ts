import { Repository, DataSource } from 'typeorm';
import { CommissionConfig, CommissionTransaction, CommissionTransactionStatus, Booking, Payment, CustomerRewardPoints, CODTransaction } from '../database/entities';
import { WalletService } from './wallet.service';
import { PaymentMethodType } from '../database/entities/settlement-transaction.entity';
export declare class CommissionService {
    private readonly commissionConfigRepository;
    private readonly commissionTransactionRepository;
    private readonly bookingRepository;
    private readonly paymentRepository;
    private readonly rewardPointsRepository;
    private readonly codTransactionRepository;
    private readonly walletService;
    private readonly dataSource;
    private readonly logger;
    constructor(commissionConfigRepository: Repository<CommissionConfig>, commissionTransactionRepository: Repository<CommissionTransaction>, bookingRepository: Repository<Booking>, paymentRepository: Repository<Payment>, rewardPointsRepository: Repository<CustomerRewardPoints>, codTransactionRepository: Repository<CODTransaction>, walletService: WalletService, dataSource: DataSource);
    getActiveCommissionConfig(date?: Date): Promise<CommissionConfig>;
    calculateAndApplyCommission(bookingId: string, paymentMethod?: PaymentMethodType): Promise<CommissionTransaction>;
    private updateCustomerRewardPoints;
    private calculateTier;
    reverseCommission(commissionTransactionId: string, reason: string): Promise<void>;
    getBusinessOwnerCommissionSummary(businessOwnerId: string, startDate?: Date, endDate?: Date): Promise<{
        totalBookings: number;
        totalBookingAmount: number;
        totalCommissionPaid: number;
        averageCommissionPercent: number;
        netEarnings: number;
        codAmount: number;
        onlineAmount: number;
        gstAmount: number;
        totalDeduction: number;
    }>;
    getCustomerRewardSummary(customerId: string): Promise<CustomerRewardPoints | null>;
    getCommissionTransactions(filters: {
        businessOwnerId?: string;
        customerId?: string;
        status?: CommissionTransactionStatus;
        startDate?: Date;
        endDate?: Date;
        page?: number;
        limit?: number;
    }): Promise<{
        transactions: CommissionTransaction[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    createCommissionConfig(businessOwnerCommissionPercent: number, customerRewardPercent: number, effectiveFrom: Date, createdByAdminId: string, notes?: string): Promise<CommissionConfig>;
    getCommissionConfigHistory(limit?: number): Promise<CommissionConfig[]>;
}
