import { BusinessOwner } from './business-owner.entity';
export declare class BankingInfo {
    id: string;
    businessOwnerId: string;
    accountNumber?: string;
    accountHolderName?: string;
    ifscCode?: string;
    bankName?: string;
    branch?: string;
    isVerified: boolean;
    verifiedAt?: Date;
    razorpayContactId?: string;
    razorpayFundAccountId?: string;
    fundAccountStatus?: string;
    fundAccountCreatedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    businessOwner: BusinessOwner;
}
