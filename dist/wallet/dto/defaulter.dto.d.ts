export declare class DefaulterBusinessDto {
    businessOwnerId: string;
    shopId: string;
    businessName: string;
    walletBalance: number;
    defaulterSince: Date;
    daysSinceDefaulter: number;
    userId: string;
    phone: string;
}
export declare class DefaulterDetailsDto extends DefaulterBusinessDto {
    bankingInfo?: {
        accountNumber: string;
        accountHolderName: string;
        ifscCode: string;
        bankName: string;
        branch?: string;
        isVerified: boolean;
    };
    recentTransactions: Array<{
        id: string;
        type: string;
        category: string;
        amount: number;
        description: string;
        createdAt: Date;
    }>;
    totalCommissionOwed: number;
}
export declare class DefaulterSummaryDto {
    totalDefaulters: number;
    totalNegativeBalance: number;
    averageDaysDefaulter: number;
    defaulters: DefaulterBusinessDto[];
}
export declare class ManualDefaulterActionDto {
    reason: string;
    notes?: string;
}
export declare class CheckDefaultersResponseDto {
    newDefaulters: number;
    alreadyDefaulters: number;
    totalNegativeWallets: number;
}
export declare class DefaulterHistoryEntryDto {
    businessOwnerId: string;
    shopId: string;
    businessName: string;
    action: 'marked' | 'restored';
    actionDate: Date;
    balanceAtAction: number;
    isManual: boolean;
    adminId?: string;
    reason?: string;
}
export declare class DefaulterHistoryDto {
    history: DefaulterHistoryEntryDto[];
    total: number;
    page: number;
    totalPages: number;
}
export declare class DefaulterListResponseDto {
    code: number;
    success: boolean;
    message: string;
    data: DefaulterSummaryDto;
}
export declare class DefaulterDetailsResponseDto {
    code: number;
    success: boolean;
    message: string;
    data: DefaulterDetailsDto;
}
export declare class CheckDefaultersApiResponseDto {
    code: number;
    success: boolean;
    message: string;
    data: CheckDefaultersResponseDto;
}
export declare class ManualActionResponseDto {
    code: number;
    success: boolean;
    message: string;
    data: {
        businessOwnerId: string;
        shopId: string;
        businessName: string;
        isDefaulter: boolean;
        walletBalance: number;
        actionDate: Date;
    };
}
export declare class DefaulterHistoryResponseDto {
    code: number;
    success: boolean;
    message: string;
    data: DefaulterHistoryDto;
}
