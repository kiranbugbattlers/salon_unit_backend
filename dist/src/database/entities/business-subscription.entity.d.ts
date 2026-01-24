import { SubscriptionStatus } from '../../common/enums';
import { BusinessOwner } from './business-owner.entity';
import { SubscriptionPlan } from './subscription-plan.entity';
import { SubscriptionTransaction } from './subscription-transaction.entity';
export declare class BusinessSubscription {
    id: string;
    businessOwnerId: string;
    subscriptionPlanId: string;
    status: SubscriptionStatus;
    startedAt: Date;
    expiresAt?: Date;
    autoRenew: boolean;
    paymentMethodId?: string;
    cancellationReason?: string;
    cancelledAt?: Date;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    lastPaymentAttemptAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    businessOwner: BusinessOwner;
    subscriptionPlan: SubscriptionPlan;
    transactions: SubscriptionTransaction[];
    get isActive(): boolean;
    get isExpired(): boolean;
    get daysUntilExpiry(): number | null;
    get isNearExpiry(): boolean;
}
