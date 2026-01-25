import { User } from './user.entity';
import { WalletTransaction } from './wallet-transaction.entity';
export declare enum WalletUserType {
    CUSTOMER = "customer",
    BUSINESS_OWNER = "business_owner"
}
export declare class Wallet {
    id: string;
    userId: string;
    userType: WalletUserType;
    balance: number;
    totalEarned: number;
    totalSpent: number;
    totalCommissionPaid: number;
    totalCommissionReceived: number;
    isActive: boolean;
    lastTransactionAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    user: User;
    transactions: WalletTransaction[];
}
