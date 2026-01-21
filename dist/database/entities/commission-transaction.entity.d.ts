import { Booking } from './booking.entity';
import { Payment } from './payment.entity';
import { BusinessOwner } from './business-owner.entity';
import { Customer } from './customer.entity';
import { WalletTransaction } from './wallet-transaction.entity';
import { CommissionConfig } from './commission-config.entity';
export declare enum CommissionTransactionStatus {
    CALCULATED = "calculated",
    APPLIED = "applied",
    REVERSED = "reversed",
    FAILED = "failed"
}
export declare class CommissionTransaction {
    id: string;
    bookingId: string;
    paymentId?: string;
    businessOwnerId: string;
    customerId: string;
    commissionConfigId: string;
    bookingAmount: number;
    businessOwnerCommissionPercent: number;
    businessOwnerCommissionAmount: number;
    customerRewardPercent: number;
    customerRewardAmount: number;
    businessOwnerWalletTransactionId?: string;
    customerWalletTransactionId?: string;
    status: CommissionTransactionStatus;
    calculatedAt: Date;
    createdAt: Date;
    booking: Booking;
    payment?: Payment;
    businessOwner: BusinessOwner;
    customer: Customer;
    commissionConfig: CommissionConfig;
    businessOwnerWalletTransaction?: WalletTransaction;
    customerWalletTransaction?: WalletTransaction;
}
