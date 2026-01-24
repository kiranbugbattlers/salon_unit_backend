import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { SubscriptionPlan, BusinessSubscription, SubscriptionTransaction, BusinessOwner } from '../database/entities';
import { CreateSubscriptionPlanDto, UpdateSubscriptionPlanDto, SubscribeBusinessDto, CancelSubscriptionDto, SubscriptionPlanResponseDto, BusinessSubscriptionResponseDto, SubscriptionListResponseDto, BusinessSubscriptionListResponseDto, CreateSubscriptionPaymentOrderDto, VerifySubscriptionPaymentDto, SubscriptionPaymentOrderResponseDto, VerifySubscriptionPaymentResponseDto, SubscriptionPaymentStatusResponseDto } from './dto';
export declare class SubscriptionService {
    private subscriptionPlanRepository;
    private businessSubscriptionRepository;
    private transactionRepository;
    private businessOwnerRepository;
    private readonly configService;
    private razorpay;
    constructor(subscriptionPlanRepository: Repository<SubscriptionPlan>, businessSubscriptionRepository: Repository<BusinessSubscription>, transactionRepository: Repository<SubscriptionTransaction>, businessOwnerRepository: Repository<BusinessOwner>, configService: ConfigService);
    createSubscriptionPlan(createPlanDto: CreateSubscriptionPlanDto): Promise<SubscriptionPlanResponseDto>;
    getAllSubscriptionPlans(): Promise<SubscriptionListResponseDto>;
    getActiveSubscriptionPlans(): Promise<SubscriptionListResponseDto>;
    getSubscriptionPlanById(id: string): Promise<SubscriptionPlanResponseDto>;
    updateSubscriptionPlan(id: string, updatePlanDto: UpdateSubscriptionPlanDto): Promise<SubscriptionPlanResponseDto>;
    deleteSubscriptionPlan(id: string): Promise<void>;
    subscribeBusinessToPlan(userId: string, subscribeDto: SubscribeBusinessDto): Promise<BusinessSubscriptionResponseDto>;
    getBusinessSubscription(userId: string): Promise<BusinessSubscriptionResponseDto>;
    cancelBusinessSubscription(userId: string, cancelDto: CancelSubscriptionDto): Promise<void>;
    getBusinessSubscriptionHistory(userId: string): Promise<BusinessSubscriptionListResponseDto>;
    hasActiveSubscription(userId: string): Promise<{
        hasActive: boolean;
        subscription?: BusinessSubscriptionResponseDto;
    }>;
    updateExpiredSubscriptions(): Promise<{
        updated: number;
    }>;
    getExpiringSubscriptions(daysAhead?: number): Promise<BusinessSubscription[]>;
    getAllBusinessSubscriptions(): Promise<BusinessSubscriptionListResponseDto>;
    private getBusinessSubscriptionById;
    private mapToSubscriptionPlanResponse;
    private mapToBusinessSubscriptionResponse;
    createSubscriptionPaymentOrder(userId: string, createDto: CreateSubscriptionPaymentOrderDto): Promise<SubscriptionPaymentOrderResponseDto>;
    verifySubscriptionPayment(userId: string, verifyDto: VerifySubscriptionPaymentDto): Promise<VerifySubscriptionPaymentResponseDto>;
    getSubscriptionPaymentStatus(userId: string, subscriptionId: string): Promise<SubscriptionPaymentStatusResponseDto>;
    private verifyRazorpaySignature;
}
