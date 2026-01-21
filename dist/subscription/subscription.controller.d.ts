import { CurrentUserData } from '../common/decorators/current-user.decorator';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionPlanDto, UpdateSubscriptionPlanDto, SubscribeBusinessDto, CancelSubscriptionDto, SubscriptionPlanResponseDto, BusinessSubscriptionResponseDto, SubscriptionListResponseDto, BusinessSubscriptionListResponseDto, CreateSubscriptionPaymentOrderDto, VerifySubscriptionPaymentDto, SubscriptionPaymentOrderResponseDto, VerifySubscriptionPaymentResponseDto, SubscriptionPaymentStatusResponseDto } from './dto';
export declare class SubscriptionController {
    private subscriptionService;
    constructor(subscriptionService: SubscriptionService);
    createSubscriptionPlan(createPlanDto: CreateSubscriptionPlanDto): Promise<ApiResponseDto<SubscriptionPlanResponseDto>>;
    getAllSubscriptionPlans(): Promise<ApiResponseDto<SubscriptionListResponseDto>>;
    getSubscriptionPlanById(id: string): Promise<ApiResponseDto<SubscriptionPlanResponseDto>>;
    updateSubscriptionPlan(id: string, updatePlanDto: UpdateSubscriptionPlanDto): Promise<ApiResponseDto<SubscriptionPlanResponseDto>>;
    deleteSubscriptionPlan(id: string): Promise<ApiResponseDto<null>>;
    getAllBusinessSubscriptions(): Promise<ApiResponseDto<BusinessSubscriptionListResponseDto>>;
    updateExpiredSubscriptions(): Promise<ApiResponseDto<{
        updated: number;
    }>>;
    getActiveSubscriptionPlans(): Promise<ApiResponseDto<SubscriptionListResponseDto>>;
    subscribeBusinessToPlan(user: CurrentUserData, subscribeDto: SubscribeBusinessDto): Promise<ApiResponseDto<BusinessSubscriptionResponseDto>>;
    getCurrentSubscription(user: CurrentUserData): Promise<ApiResponseDto<BusinessSubscriptionResponseDto>>;
    cancelSubscription(user: CurrentUserData, cancelDto: CancelSubscriptionDto): Promise<ApiResponseDto<null>>;
    getSubscriptionHistory(user: CurrentUserData): Promise<ApiResponseDto<BusinessSubscriptionListResponseDto>>;
    checkSubscriptionStatus(user: CurrentUserData): Promise<ApiResponseDto<{
        hasActive: boolean;
        subscription?: BusinessSubscriptionResponseDto;
    }>>;
    createSubscriptionPaymentOrder(user: CurrentUserData, createDto: CreateSubscriptionPaymentOrderDto): Promise<SubscriptionPaymentOrderResponseDto>;
    verifySubscriptionPayment(user: CurrentUserData, verifyDto: VerifySubscriptionPaymentDto): Promise<VerifySubscriptionPaymentResponseDto>;
    getSubscriptionPaymentStatus(user: CurrentUserData, subscriptionId: string): Promise<SubscriptionPaymentStatusResponseDto>;
}
