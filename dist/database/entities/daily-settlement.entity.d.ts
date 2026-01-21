import { BusinessOwner } from './business-owner.entity';
export declare enum SettlementPaidStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    PAID = "paid",
    FAILED = "failed"
}
export declare class DailySettlement {
    id: string;
    businessOwnerId: string;
    settlementDate: Date;
    ownerName?: string;
    salonName?: string;
    email?: string;
    mobileNumber?: string;
    address?: string;
    totalTransactionsCount: number;
    totalTransactionsAmount: number;
    totalCashAmount: number;
    totalOnlineAmount: number;
    commissionPercent: number;
    commissionAmount: number;
    gstPercent: number;
    gstAmount: number;
    totalDeduction: number;
    settlementAmount: number;
    paidStatus: SettlementPaidStatus;
    paidAt?: Date;
    transactionReference?: string;
    adminNotes?: string;
    createdAt: Date;
    updatedAt: Date;
    businessOwner: BusinessOwner;
}
