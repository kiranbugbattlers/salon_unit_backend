export declare enum BusinessOwnerTransactionType {
    CREDIT = "credit",
    DEBIT = "debit"
}
export declare enum BusinessOwnerTransactionStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled"
}
export declare enum PaymentMethod {
    CASH = "cash",
    ONLINE = "online",
    UPI = "upi",
    CARD = "card",
    BANK_TRANSFER = "bank_transfer"
}
export declare enum SettlementStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed",
    REQUIRES_PAYMENT = "requires_payment",
    PAYMENT_RECEIVED = "payment_received"
}
export declare class BusinessOwnerTransactionItemDto {
    id: string;
    transactionDate: Date;
    transactionAmount: number;
    transactionType: BusinessOwnerTransactionType;
    previousBalance: number;
    remainingBalance: number;
    status: BusinessOwnerTransactionStatus;
    paymentMethod?: PaymentMethod;
    remarks?: string;
    relatedBookingId?: string;
}
export declare class SettlementItemDto {
    id: string;
    settlementMonth: string;
    totalBookingAmount: number;
    totalCommissionAmount: number;
    netPayableToBusinessOwner: number;
    totalCODAmount: number;
    totalOnlineAmount: number;
    bookingCount: number;
    status: SettlementStatus;
    razorpayPayoutId?: string;
    payoutInitiatedAt?: Date;
    payoutCompletedAt?: Date;
    failureReason?: string;
    payoutStatus?: string;
    payoutMode?: string;
    payoutUtr?: string;
    adminNotes?: string;
    createdAt: Date;
}
export declare class BusinessOwnerTransactionHistoryResponseDto {
    businessOwnerId: string;
    businessOwnerName: string;
    shopId: string;
    businessName?: string;
    transactions: BusinessOwnerTransactionItemDto[];
    settlements: SettlementItemDto[];
    currentBalance: number;
    totalCredit: number;
    totalDebit: number;
    totalSettlementsReceived: number;
    totalPendingSettlements: number;
    totalTransactions: number;
    filters: {
        startDate?: Date;
        endDate?: Date;
        transactionType?: BusinessOwnerTransactionType;
        status?: BusinessOwnerTransactionStatus;
        settlementStatus?: SettlementStatus;
    };
}
