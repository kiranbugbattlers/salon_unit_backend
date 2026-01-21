import { Repository, DataSource } from 'typeorm';
import { Wallet, WalletUserType, WalletTransaction, WalletTransactionType, WalletTransactionCategory, BusinessOwner } from '../database/entities';
export declare class WalletService {
    readonly walletRepository: Repository<Wallet>;
    private readonly walletTransactionRepository;
    private readonly businessOwnerRepository;
    private readonly dataSource;
    private readonly logger;
    constructor(walletRepository: Repository<Wallet>, walletTransactionRepository: Repository<WalletTransaction>, businessOwnerRepository: Repository<BusinessOwner>, dataSource: DataSource);
    getOrCreateWallet(userId: string, userType: WalletUserType): Promise<Wallet>;
    getWalletById(walletId: string): Promise<Wallet>;
    getWalletByUser(userId: string, userType: WalletUserType): Promise<Wallet>;
    createTransaction(walletId: string, type: WalletTransactionType, category: WalletTransactionCategory, amount: number, description: string, metadata?: {
        bookingId?: string;
        paymentId?: string;
        settlementId?: string;
        additionalData?: any;
    }): Promise<WalletTransaction>;
    credit(walletId: string, category: WalletTransactionCategory, amount: number, description: string, metadata?: any): Promise<WalletTransaction>;
    debit(walletId: string, category: WalletTransactionCategory, amount: number, description: string, metadata?: any): Promise<WalletTransaction>;
    getTransactions(walletId: string, options?: {
        page?: number;
        limit?: number;
        category?: WalletTransactionCategory;
        type?: WalletTransactionType;
        startDate?: Date;
        endDate?: Date;
    }): Promise<{
        transactions: WalletTransaction[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getBalance(walletId: string): Promise<number>;
    reverseTransaction(transactionId: string, reason: string): Promise<WalletTransaction>;
    reconcileWallet(walletId: string): Promise<{
        isBalanced: boolean;
        expectedBalance: number;
        actualBalance: number;
        difference: number;
    }>;
    adminAdjustWallet(walletId: string, amount: number, reason: string, adminId: string): Promise<WalletTransaction>;
    getWalletStats(walletId: string, options?: {
        businessOwnerId?: string;
        customerId?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<{
        balance: number;
        totalEarned: number;
        totalSpent: number;
        totalCommissionPaid: number;
        totalCommissionReceived: number;
        transactionCount: number;
        lastTransactionAt: Date | null;
        totalBookings?: number;
        totalBookingAmount?: number;
        averageCommissionPercent?: number;
        netEarnings?: number;
    }>;
}
