import { CreateSubscriptionPlanDto } from './create-subscription-plan.dto';
declare const UpdateSubscriptionPlanDto_base: import("@nestjs/common").Type<Partial<CreateSubscriptionPlanDto>>;
export declare class UpdateSubscriptionPlanDto extends UpdateSubscriptionPlanDto_base {
    isActive?: boolean;
}
export {};
