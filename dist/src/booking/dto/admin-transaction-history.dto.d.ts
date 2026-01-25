export declare enum TransactionType {
    CREDIT = "CREDIT",
    DEBIT = "DEBIT"
}
export declare enum TransactionStatus {
    SUCCESS = "SUCCESS",
    PENDING = "PENDING",
    FAILED = "FAILED"
}
export declare enum SettlementType {
    DAILY = "DAILY",
    WEEKLY = "WEEKLY",
    MONTHLY = "MONTHLY"
}
export declare class AdminTransactionHistoryItemDto {
    transactionId: string;
    businessOwnerName: string;
    shopId: string;
    businessName: string;
    transactionDateTime: Date;
    previousBalance: number;
    amount: number;
    currentBalance: number;
    transactionType: TransactionType;
    status: TransactionStatus;
    remark: string;
    commissionAmount: number;
    commissionPercentage: number;
    settlementAmount: number;
    settlementType?: SettlementType;
    relatedBookingId?: string;
    paymentMethod?: string;
    createdByAdminId?: string;
    commissionRelatedBookingId?: string;
    commissionStatus?: TransactionStatus;
    commissionSettlementDate?: Date;
    commissionRemarks?: string;
}
export declare class DayWiseAdminTransactionHistoryDto {
    date: Date;
    transactions: AdminTransactionHistoryItemDto[];
    totalCredit: number;
    totalDebit: number;
    totalCommission: number;
    totalSettlement: number;
    netAmount: number;
    transactionCount: number;
}
export declare class AdminTransactionHistoryResponseDto {
    businessOwners: Array<{
        businessOwnerId: string;
        businessOwnerName: string;
        shopId: string;
        businessName: string;
        dayWiseHistory: DayWiseAdminTransactionHistoryDto[];
        totalCredit: number;
        totalDebit: number;
        totalCommission: number;
        totalSettlement: number;
        netBalance: number;
        totalTransactions: number;
    }>;
    overallTotals: {
        totalCredit: number;
        totalDebit: number;
        totalCommission: number;
        totalSettlement: number;
        netBalance: number;
        totalTransactions: number;
        totalBusinessOwners: number;
    };
    filters: {
        businessOwnerId?: string;
        startDate?: Date;
        endDate?: Date;
        settlementType?: SettlementType;
    };
}
