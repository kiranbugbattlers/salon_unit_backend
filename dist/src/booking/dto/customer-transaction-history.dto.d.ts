export declare enum PaymentMethod {
    CASH = "CASH",
    ONLINE = "ONLINE"
}
export declare class TransactionHistoryItemDto {
    bookingId: string;
    customerName: string;
    bookingAmount: number;
    paymentMethod: PaymentMethod;
    bookingDateTime: Date;
}
export declare class DayWiseTransactionHistoryDto {
    date: Date;
    transactions: TransactionHistoryItemDto[];
    totalAmount: number;
    transactionCount: number;
}
export declare class CustomerTransactionHistoryResponseDto {
    customerId: string;
    dayWiseHistory: DayWiseTransactionHistoryDto[];
    totalAmount: number;
    totalTransactions: number;
}
