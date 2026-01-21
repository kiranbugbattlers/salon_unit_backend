import { BusinessOwner } from './business-owner.entity';
import { SettlementTransaction } from './settlement-transaction.entity';
export declare enum SettlementStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed",
    REQUIRES_PAYMENT = "requires_payment",
    PAYMENT_RECEIVED = "payment_received"
}
export declare class MonthlySettlement {
    id: string;
    businessOwnerId: string;
    settlementMonth: string;
    totalBookingAmount: number;
    totalCommissionAmount: number;
    netPayableToBusinessOwner: number;
    totalCODAmount: number;
    totalOnlineAmount: number;
    bookingCount: number;
    status: SettlementStatus;
    razorpayPayoutId?: string;
    razorpayFundAccountId?: string;
    payoutInitiatedAt?: Date;
    payoutCompletedAt?: Date;
    failureReason?: string;
    payoutStatus?: string;
    payoutMode?: string;
    payoutUtr?: string;
    payoutMetadata?: any;
    retryCount?: number;
    lastRetryAt?: Date;
    metadata?: any;
    adminNotes?: string;
    createdAt: Date;
    updatedAt: Date;
    businessOwner: BusinessOwner;
    transactions: SettlementTransaction[];
}
