import { SubscriptionStatus, BillingType } from '../../common/enums';
export declare class SubscriptionPlanResponseDto {
    id: string;
    name: string;
    description: string;
    billingType: BillingType;
    price: number;
    currency: string;
    features: string[];
    isActive: boolean;
    formattedPrice: string;
    isRecurring: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class BusinessSubscriptionResponseDto {
    id: string;
    businessOwnerId: string;
    status: SubscriptionStatus;
    startedAt: Date;
    expiresAt?: Date;
    autoRenew: boolean;
    isActive: boolean;
    isExpired: boolean;
    daysUntilExpiry?: number;
    isNearExpiry: boolean;
    subscriptionPlan: SubscriptionPlanResponseDto;
    createdAt: Date;
    updatedAt: Date;
}
export declare class SubscriptionListResponseDto {
    plans: SubscriptionPlanResponseDto[];
    total: number;
}
export declare class BusinessSubscriptionListResponseDto {
    subscriptions: BusinessSubscriptionResponseDto[];
    total: number;
}
