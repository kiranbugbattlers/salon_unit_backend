import { BusinessOwner } from './business-owner.entity';
import { Booking } from './booking.entity';
import { Admin } from './admin.entity';
export declare enum TransactionType {
    CREDIT = "credit",
    DEBIT = "debit"
}
export declare enum TransactionStatus {
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
export declare class BusinessOwnerTransactionHistory {
    id: string;
    businessOwnerId: string;
    transactionDate: Date;
    transactionAmount: number;
    transactionType: TransactionType;
    previousBalance: number;
    remainingBalance: number;
    status: TransactionStatus;
    paymentMethod?: PaymentMethod;
    remarks?: string;
    relatedBookingId?: string;
    createdByAdminId?: string;
    createdAt: Date;
    updatedAt: Date;
    businessOwner: BusinessOwner;
    relatedBooking?: Booking;
    createdByAdmin?: Admin;
    get isCredit(): boolean;
    get isDebit(): boolean;
    get isCompleted(): boolean;
}
