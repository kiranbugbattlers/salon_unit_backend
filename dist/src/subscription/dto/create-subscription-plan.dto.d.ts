import { BillingType } from '../../common/enums';
export declare class CreateSubscriptionPlanDto {
    name: string;
    description: string;
    billingType: BillingType;
    price: number;
    currency?: string;
    features: string[];
}
