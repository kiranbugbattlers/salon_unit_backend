import { BusinessOwner } from '../../database/entities/business-owner.entity';
import { Wallet } from '../../database/entities/wallet.entity';
export declare enum CommissionPaymentStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed",
    REFUNDED = "refunded"
}
export declare class CommissionPayment {
    id: string;
    businessOwnerId: string;
    businessOwner: BusinessOwner;
    walletId: string;
    wallet: Wallet;
    amount: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    status: CommissionPaymentStatus;
    balanceBefore: string;
    balanceAfter: string;
    paymentMethod: string;
    paymentDescription: string;
    notes: string;
    failureReason: string;
    defaulterRemoved: boolean;
    processedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
