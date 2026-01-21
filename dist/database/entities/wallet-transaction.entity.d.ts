import { Wallet } from './wallet.entity';
import { Booking } from './booking.entity';
import { Payment } from './payment.entity';
import { MonthlySettlement } from './monthly-settlement.entity';
export declare enum WalletTransactionType {
    CREDIT = "credit",
    DEBIT = "debit"
}
export declare enum WalletTransactionCategory {
    BOOKING_PAYMENT = "booking_payment",
    COMMISSION = "commission",
    COMMISSION_PAYMENT = "commission_payment",
    SETTLEMENT = "settlement",
    REWARD_POINTS = "reward_points",
    REFUND = "refund",
    ADJUSTMENT = "adjustment",
    WITHDRAWAL = "withdrawal"
}
export declare enum WalletTransactionStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed",
    REVERSED = "reversed"
}
export declare class WalletTransaction {
    id: string;
    walletId: string;
    type: WalletTransactionType;
    category: WalletTransactionCategory;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    bookingId?: string;
    paymentId?: string;
    settlementId?: string;
    description: string;
    metadata?: any;
    status: WalletTransactionStatus;
    createdAt: Date;
    wallet: Wallet;
    booking?: Booking;
    payment?: Payment;
    settlement?: MonthlySettlement;
}
