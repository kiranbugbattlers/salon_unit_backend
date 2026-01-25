export declare enum SortOrderEnum {
    ASC = "ASC",
    DESC = "DESC"
}
export declare enum SortByEnum {
    CREATED_AT = "createdAt",
    AMOUNT = "amount",
    TYPE = "type",
    CATEGORY = "category"
}
export declare class BusinessOwnerTransactionHistoryQueryDto {
    type?: string;
    category?: string;
    status?: string;
    businessOwnerId?: string;
    fromDate?: string;
    toDate?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
}
export declare class BusinessOwnerTransactionResponseDto {
    id: string;
    createdAt: Date;
    description: string;
    previousBalance: number;
    amount: number;
    currentBalance: number;
    transactionId: string;
    transactionType: string;
    status: string;
    remark: string;
    category: string;
    bookingId?: string;
    paymentId?: string;
    settlementId?: string;
    businessOwner?: {
        id: string;
        businessName?: string;
        ownerName?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
        shopId?: string;
        isApproved: boolean;
        isActive: boolean;
        vendorStatus: string;
        creditLimit?: number;
        upiId?: string;
        createdAt: Date;
        updatedAt: Date;
    };
    wallet?: {
        id: string;
        currentBalance: number;
        userId: string;
        userType: string;
    };
}
export declare class UpdateTransactionRemarkDto {
    remark: string;
}
export declare class TransactionSummaryDto {
    totalCredits: number;
    totalDebits: number;
    netBalance: number;
    totalTransactions: number;
    successfulTransactions: number;
    pendingTransactions: number;
    failedTransactions: number;
}
