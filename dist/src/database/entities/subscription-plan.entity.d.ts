import { BillingType } from '../../common/enums';
import { BusinessSubscription } from './business-subscription.entity';
export declare class SubscriptionPlan {
    id: string;
    name: string;
    description: string;
    billingType: BillingType;
    price: number;
    currency: string;
    features: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    businessSubscriptions: BusinessSubscription[];
    get formattedPrice(): string;
    get isRecurring(): boolean;
}
