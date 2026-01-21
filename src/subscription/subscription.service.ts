import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import {
  SubscriptionPlan,
  BusinessSubscription,
  SubscriptionTransaction,
  BusinessOwner,
} from '../database/entities';
import {
  SubscriptionStatus,
  BillingType,
  TransactionStatus,
} from '../common/enums';
import {
  CreateSubscriptionPlanDto,
  UpdateSubscriptionPlanDto,
  SubscribeBusinessDto,
  CancelSubscriptionDto,
  SubscriptionPlanResponseDto,
  BusinessSubscriptionResponseDto,
  SubscriptionListResponseDto,
  BusinessSubscriptionListResponseDto,
  CreateSubscriptionPaymentOrderDto,
  VerifySubscriptionPaymentDto,
  SubscriptionPaymentOrderResponseDto,
  SubscriptionPaymentOrderDataDto,
  VerifySubscriptionPaymentResponseDto,
  VerifySubscriptionPaymentDataDto,
  SubscriptionPaymentStatusResponseDto,
  SubscriptionPaymentStatusDataDto,
} from './dto';

@Injectable()
export class SubscriptionService {
  private razorpay: any;

  constructor(
    @InjectRepository(SubscriptionPlan)
    private subscriptionPlanRepository: Repository<SubscriptionPlan>,
    @InjectRepository(BusinessSubscription)
    private businessSubscriptionRepository: Repository<BusinessSubscription>,
    @InjectRepository(SubscriptionTransaction)
    private transactionRepository: Repository<SubscriptionTransaction>,
    @InjectRepository(BusinessOwner)
    private businessOwnerRepository: Repository<BusinessOwner>,
    private readonly configService: ConfigService,
  ) {
    // Initialize Razorpay
    this.razorpay = new Razorpay({
      key_id: this.configService.get<string>('RAZORPAY_KEY_ID'),
      key_secret: this.configService.get<string>('RAZORPAY_KEY_SECRET'),
    });
  }

  // Admin methods for managing subscription plans

  async createSubscriptionPlan(
    createPlanDto: CreateSubscriptionPlanDto,
  ): Promise<SubscriptionPlanResponseDto> {
    const plan = this.subscriptionPlanRepository.create({
      ...createPlanDto,
      currency: createPlanDto.currency || 'USD',
    });

    const savedPlan = await this.subscriptionPlanRepository.save(plan);
    return this.mapToSubscriptionPlanResponse(savedPlan);
  }

  async getAllSubscriptionPlans(): Promise<SubscriptionListResponseDto> {
    const plans = await this.subscriptionPlanRepository.find({
      order: { createdAt: 'DESC' },
    });

    return {
      plans: plans.map(this.mapToSubscriptionPlanResponse),
      total: plans.length,
    };
  }

  async getActiveSubscriptionPlans(): Promise<SubscriptionListResponseDto> {
    const plans = await this.subscriptionPlanRepository.find({
      where: { isActive: true },
      order: { price: 'ASC' },
    });

    return {
      plans: plans.map(this.mapToSubscriptionPlanResponse),
      total: plans.length,
    };
  }

  async getSubscriptionPlanById(id: string): Promise<SubscriptionPlanResponseDto> {
    const plan = await this.subscriptionPlanRepository.findOne({ where: { id } });
    
    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    return this.mapToSubscriptionPlanResponse(plan);
  }

  async updateSubscriptionPlan(
    id: string,
    updatePlanDto: UpdateSubscriptionPlanDto,
  ): Promise<SubscriptionPlanResponseDto> {
    const plan = await this.subscriptionPlanRepository.findOne({ 
      where: { id },
      relations: ['businessSubscriptions']
    });
    
    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    // Prevent disabling plan with active subscriptions
    if (updatePlanDto.isActive === false) {
      const activeSubscriptions = plan.businessSubscriptions?.filter(
        (sub) => sub.status === SubscriptionStatus.ACTIVE
      ) || [];

      if (activeSubscriptions.length > 0) {
        throw new BadRequestException(
          `Cannot disable plan with ${activeSubscriptions.length} active subscriptions`
        );
      }
    }

    // Validate price changes
    if (updatePlanDto.price !== undefined && updatePlanDto.price < 0) {
      throw new BadRequestException('Price cannot be negative');
    }

    Object.assign(plan, updatePlanDto);
    const updatedPlan = await this.subscriptionPlanRepository.save(plan);
    
    return this.mapToSubscriptionPlanResponse(updatedPlan);
  }

  async deleteSubscriptionPlan(id: string): Promise<void> {
    const plan = await this.subscriptionPlanRepository.findOne({
      where: { id },
      relations: ['businessSubscriptions'],
    });

    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    // Check if ANY business has subscriptions to this plan (active or historical)
    if (plan.businessSubscriptions && plan.businessSubscriptions.length > 0) {
      // Check for active subscriptions
      const activeSubscriptions = plan.businessSubscriptions.filter(
        (sub) => sub.status === SubscriptionStatus.ACTIVE
      );

      if (activeSubscriptions.length > 0) {
        throw new BadRequestException(
          `Cannot delete subscription plan with ${activeSubscriptions.length} active subscription(s). Please cancel or expire them first.`
        );
      }

      // If there are historical subscriptions, prevent deletion to maintain data integrity
      throw new BadRequestException(
        `Cannot delete subscription plan with ${plan.businessSubscriptions.length} historical subscription(s). Consider disabling the plan instead.`
      );
    }

    await this.subscriptionPlanRepository.remove(plan);
  }

  // Business subscription methods

  async subscribeBusinessToPlan(
    userId: string,
    subscribeDto: SubscribeBusinessDto,
  ): Promise<BusinessSubscriptionResponseDto> {
    // Find business owner by user ID
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business not found');
    }

    if (!businessOwner.isApproved) {
      throw new ForbiddenException('Only approved businesses can subscribe to plans');
    }

    // Check for existing active subscription
    const existingSubscription = await this.businessSubscriptionRepository.findOne({
      where: {
        businessOwnerId: businessOwner.id,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (existingSubscription) {
      // Check if existing subscription is expired but still marked as active
      if (existingSubscription.isExpired) {
        existingSubscription.status = SubscriptionStatus.EXPIRED;
        await this.businessSubscriptionRepository.save(existingSubscription);
      } else {
        throw new ConflictException('Business already has an active subscription');
      }
    }

    // Get subscription plan
    const plan = await this.subscriptionPlanRepository.findOne({
      where: { id: subscribeDto.subscriptionPlanId, isActive: true },
    });

    if (!plan) {
      throw new NotFoundException('Subscription plan not found or inactive');
    }

    // Calculate expiry date
    const startedAt = new Date();
    let expiresAt: Date | null = null;

    if (plan.billingType === BillingType.MONTHLY) {
      expiresAt = new Date(startedAt);
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else if (plan.billingType === BillingType.YEARLY) {
      expiresAt = new Date(startedAt);
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }
    // One-time subscriptions don't have expiry date

    // Create subscription
    const subscription = this.businessSubscriptionRepository.create({
      businessOwnerId: businessOwner.id,
      subscriptionPlanId: plan.id,
      status: SubscriptionStatus.ACTIVE,
      startedAt,
      expiresAt,
      autoRenew: subscribeDto.autoRenew || false,
    });

    const savedSubscription = await this.businessSubscriptionRepository.save(subscription);

    // Create transaction record (for future payment integration)
    const transaction = this.transactionRepository.create({
      businessSubscriptionId: savedSubscription.id,
      amount: plan.price,
      currency: plan.currency,
      status: TransactionStatus.COMPLETED, // For now, mark as completed
      transactionDate: new Date(),
      paymentMethod: 'manual', // Placeholder for future payment integration
    });

    await this.transactionRepository.save(transaction);

    return this.getBusinessSubscriptionById(savedSubscription.id);
  }

  async getBusinessSubscription(userId: string): Promise<BusinessSubscriptionResponseDto> {
    // Find business owner by user ID
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business not found');
    }

    const subscription = await this.businessSubscriptionRepository.findOne({
      where: { businessOwnerId: businessOwner.id },
      relations: ['subscriptionPlan'],
      order: { createdAt: 'DESC' },
    });

    if (!subscription) {
      throw new NotFoundException('No subscription found for this business');
    }

    // Auto-update expired subscription
    if (subscription.status === SubscriptionStatus.ACTIVE && subscription.isExpired) {
      subscription.status = SubscriptionStatus.EXPIRED;
      await this.businessSubscriptionRepository.save(subscription);
    }

    return this.mapToBusinessSubscriptionResponse(subscription);
  }

  async cancelBusinessSubscription(
    userId: string,
    cancelDto: CancelSubscriptionDto,
  ): Promise<void> {
    // Find business owner by user ID
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business not found');
    }

    const subscription = await this.businessSubscriptionRepository.findOne({
      where: {
        businessOwnerId: businessOwner.id,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (!subscription) {
      throw new NotFoundException('No active subscription found for this business');
    }

    subscription.status = SubscriptionStatus.CANCELLED;
    subscription.cancellationReason = cancelDto.cancellationReason;
    subscription.cancelledAt = new Date();
    subscription.autoRenew = false;

    await this.businessSubscriptionRepository.save(subscription);
  }

  async getBusinessSubscriptionHistory(userId: string): Promise<BusinessSubscriptionListResponseDto> {
    // Find business owner by user ID
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business not found');
    }

    const subscriptions = await this.businessSubscriptionRepository.find({
      where: { businessOwnerId: businessOwner.id },
      relations: ['subscriptionPlan'],
      order: { createdAt: 'DESC' },
    });

    return {
      subscriptions: subscriptions.map(this.mapToBusinessSubscriptionResponse),
      total: subscriptions.length,
    };
  }

  // Utility methods

  async hasActiveSubscription(userId: string): Promise<{ hasActive: boolean; subscription?: BusinessSubscriptionResponseDto }> {
    try {
      const subscription = await this.getBusinessSubscription(userId);
      return {
        hasActive: subscription.isActive,
        subscription: subscription.isActive ? subscription : undefined,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { hasActive: false };
      }
      throw error;
    }
  }

  async updateExpiredSubscriptions(): Promise<{ updated: number }> {
    const expiredSubscriptions = await this.businessSubscriptionRepository
      .createQueryBuilder('subscription')
      .where('subscription.status = :status', { status: SubscriptionStatus.ACTIVE })
      .andWhere('subscription.expiresAt IS NOT NULL')
      .andWhere('subscription.expiresAt < :now', { now: new Date() })
      .getMany();

    let updatedCount = 0;
    for (const subscription of expiredSubscriptions) {
      subscription.status = SubscriptionStatus.EXPIRED;
      await this.businessSubscriptionRepository.save(subscription);
      updatedCount++;
    }

    return { updated: updatedCount };
  }

  async getExpiringSubscriptions(daysAhead: number = 7): Promise<BusinessSubscription[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return this.businessSubscriptionRepository
      .createQueryBuilder('subscription')
      .leftJoinAndSelect('subscription.subscriptionPlan', 'plan')
      .leftJoinAndSelect('subscription.businessOwner', 'businessOwner')
      .where('subscription.status = :status', { status: SubscriptionStatus.ACTIVE })
      .andWhere('subscription.expiresAt IS NOT NULL')
      .andWhere('subscription.expiresAt BETWEEN :now AND :future', {
        now: new Date(),
        future: futureDate
      })
      .getMany();
  }

  // Admin methods for viewing all business subscriptions

  async getAllBusinessSubscriptions(): Promise<BusinessSubscriptionListResponseDto> {
    const subscriptions = await this.businessSubscriptionRepository.find({
      relations: ['subscriptionPlan', 'businessOwner'],
      order: { createdAt: 'DESC' },
    });

    return {
      subscriptions: subscriptions.map(this.mapToBusinessSubscriptionResponse),
      total: subscriptions.length,
    };
  }

  private async getBusinessSubscriptionById(id: string): Promise<BusinessSubscriptionResponseDto> {
    const subscription = await this.businessSubscriptionRepository.findOne({
      where: { id },
      relations: ['subscriptionPlan'],
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return this.mapToBusinessSubscriptionResponse(subscription);
  }

  private mapToSubscriptionPlanResponse(plan: SubscriptionPlan): SubscriptionPlanResponseDto {
    return {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      billingType: plan.billingType,
      price: plan.price,
      currency: plan.currency,
      features: plan.features,
      isActive: plan.isActive,
      formattedPrice: plan.formattedPrice,
      isRecurring: plan.isRecurring,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
  }

  private mapToBusinessSubscriptionResponse(subscription: BusinessSubscription): BusinessSubscriptionResponseDto {
    return {
      id: subscription.id,
      businessOwnerId: subscription.businessOwnerId,
      status: subscription.status,
      startedAt: subscription.startedAt,
      expiresAt: subscription.expiresAt,
      autoRenew: subscription.autoRenew,
      isActive: subscription.isActive,
      isExpired: subscription.isExpired,
      daysUntilExpiry: subscription.daysUntilExpiry,
      isNearExpiry: subscription.isNearExpiry,
      subscriptionPlan: this.mapToSubscriptionPlanResponse(subscription.subscriptionPlan),
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    };
  }

  // Payment methods for subscription

  async createSubscriptionPaymentOrder(
    userId: string,
    createDto: CreateSubscriptionPaymentOrderDto,
  ): Promise<SubscriptionPaymentOrderResponseDto> {
    // Find business owner by user ID
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business not found');
    }

    if (!businessOwner.isApproved) {
      throw new ForbiddenException('Only approved businesses can subscribe to plans');
    }

    // Check for existing active subscription
    const existingSubscription = await this.businessSubscriptionRepository.findOne({
      where: {
        businessOwnerId: businessOwner.id,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (existingSubscription) {
      // Check if existing subscription is expired but still marked as active
      if (existingSubscription.isExpired) {
        existingSubscription.status = SubscriptionStatus.EXPIRED;
        await this.businessSubscriptionRepository.save(existingSubscription);
      } else {
        throw new ConflictException('Business already has an active subscription');
      }
    }

    // Check for existing pending subscription
    const pendingSubscription = await this.businessSubscriptionRepository.findOne({
      where: {
        businessOwnerId: businessOwner.id,
        status: SubscriptionStatus.PENDING,
      },
      relations: ['subscriptionPlan'],
    });

    if (pendingSubscription) {
      // Return existing order details if plan is same
      if (pendingSubscription.subscriptionPlanId === createDto.subscriptionPlanId && pendingSubscription.razorpayOrderId) {
        const responseData: SubscriptionPaymentOrderDataDto = {
          orderId: pendingSubscription.razorpayOrderId,
          amount: Math.round(pendingSubscription.subscriptionPlan.price * 100),
          currency: pendingSubscription.subscriptionPlan.currency === 'USD' ? 'INR' : pendingSubscription.subscriptionPlan.currency,
          razorpayKeyId: this.configService.get<string>('RAZORPAY_KEY_ID'),
          subscriptionId: pendingSubscription.id,
          planName: pendingSubscription.subscriptionPlan.name,
          description: pendingSubscription.subscriptionPlan.description,
        };

        return {
          code: 200,
          success: true,
          message: 'Existing payment order retrieved. Complete payment to activate subscription.',
          data: responseData,
        };
      }
      // Cancel old pending subscription if different plan
      await this.businessSubscriptionRepository.remove(pendingSubscription);
    }

    // Get subscription plan
    const plan = await this.subscriptionPlanRepository.findOne({
      where: { id: createDto.subscriptionPlanId, isActive: true },
    });

    if (!plan) {
      throw new NotFoundException('Subscription plan not found or inactive');
    }

    // Calculate amount in smallest currency unit (paise for INR, cents for USD)
    const currency = plan.currency === 'USD' ? 'INR' : plan.currency;
    const amountInSmallestUnit = Math.round(plan.price * 100);

    // Create Razorpay order
    const razorpayOrder = await this.razorpay.orders.create({
      amount: amountInSmallestUnit,
      currency: currency,
      receipt: `sub_${businessOwner.id.substring(0, 32)}`,
      notes: {
        subscriptionPlanId: plan.id,
        businessOwnerId: businessOwner.id,
        planName: plan.name,
      },
    });

    // Calculate expiry date (not set until payment is verified)
    const startedAt = new Date();
    let expiresAt: Date | null = null;

    if (plan.billingType === BillingType.MONTHLY) {
      expiresAt = new Date(startedAt);
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else if (plan.billingType === BillingType.YEARLY) {
      expiresAt = new Date(startedAt);
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    // Create PENDING subscription
    const subscription = this.businessSubscriptionRepository.create({
      businessOwnerId: businessOwner.id,
      subscriptionPlanId: plan.id,
      status: SubscriptionStatus.PENDING,
      startedAt,
      expiresAt,
      autoRenew: createDto.autoRenew || false,
      razorpayOrderId: razorpayOrder.id,
      lastPaymentAttemptAt: new Date(),
    });

    const savedSubscription = await this.businessSubscriptionRepository.save(subscription);

    // Create PENDING transaction record
    const transaction = this.transactionRepository.create({
      businessSubscriptionId: savedSubscription.id,
      amount: plan.price,
      currency: plan.currency,
      status: TransactionStatus.PENDING,
      transactionDate: new Date(),
      paymentProvider: 'razorpay',
      razorpayOrderId: razorpayOrder.id,
      paymentAttemptedAt: new Date(),
    });

    await this.transactionRepository.save(transaction);

    const responseData: SubscriptionPaymentOrderDataDto = {
      orderId: razorpayOrder.id,
      amount: amountInSmallestUnit,
      currency: currency,
      razorpayKeyId: this.configService.get<string>('RAZORPAY_KEY_ID'),
      subscriptionId: savedSubscription.id,
      planName: plan.name,
      description: plan.description,
    };

    return {
      code: 200,
      success: true,
      message: 'Payment order created successfully. Complete payment in Flutter app.',
      data: responseData,
    };
  }

  async verifySubscriptionPayment(
    userId: string,
    verifyDto: VerifySubscriptionPaymentDto,
  ): Promise<VerifySubscriptionPaymentResponseDto> {
    // Find business owner by user ID
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business not found');
    }

    // Fetch subscription
    const subscription = await this.businessSubscriptionRepository.findOne({
      where: {
        id: verifyDto.subscriptionId,
        businessOwnerId: businessOwner.id,
      },
      relations: ['subscriptionPlan'],
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Verify ownership
    if (subscription.businessOwnerId !== businessOwner.id) {
      throw new ForbiddenException('You can only verify payment for your own subscription');
    }

    // Check if already active
    if (subscription.status === SubscriptionStatus.ACTIVE && subscription.razorpayPaymentId) {
      throw new BadRequestException('Subscription already activated');
    }

    // Verify Razorpay signature
    const isValidSignature = this.verifyRazorpaySignature(
      verifyDto.razorpayOrderId,
      verifyDto.razorpayPaymentId,
      verifyDto.razorpaySignature,
    );

    if (!isValidSignature) {
      throw new BadRequestException('Payment signature verification failed');
    }

    // Fetch payment details from Razorpay
    let paymentMethod = 'unknown';
    try {
      const razorpayPayment = await this.razorpay.payments.fetch(verifyDto.razorpayPaymentId);
      paymentMethod = razorpayPayment.method || 'unknown';
    } catch (error) {
      // Continue even if fetching fails
    }

    // Update subscription status to ACTIVE
    subscription.status = SubscriptionStatus.ACTIVE;
    subscription.razorpayPaymentId = verifyDto.razorpayPaymentId;
    const updatedSubscription = await this.businessSubscriptionRepository.save(subscription);

    // Update transaction record
    const transaction = await this.transactionRepository.findOne({
      where: {
        businessSubscriptionId: subscription.id,
        razorpayOrderId: verifyDto.razorpayOrderId,
      },
    });

    if (transaction) {
      transaction.status = TransactionStatus.COMPLETED;
      transaction.razorpayPaymentId = verifyDto.razorpayPaymentId;
      transaction.razorpaySignature = verifyDto.razorpaySignature;
      transaction.paymentMethod = paymentMethod;
      transaction.paymentCompletedAt = new Date();
      await this.transactionRepository.save(transaction);
    }

    const responseData: VerifySubscriptionPaymentDataDto = {
      status: 'activated',
      subscriptionId: updatedSubscription.id,
      razorpayPaymentId: verifyDto.razorpayPaymentId,
      subscription: this.mapToBusinessSubscriptionResponse(updatedSubscription),
    };

    return {
      code: 200,
      success: true,
      message: 'Payment verified successfully. Subscription activated!',
      data: responseData,
    };
  }

  async getSubscriptionPaymentStatus(
    userId: string,
    subscriptionId: string,
  ): Promise<SubscriptionPaymentStatusResponseDto> {
    // Find business owner by user ID
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business not found');
    }

    // Fetch subscription
    const subscription = await this.businessSubscriptionRepository.findOne({
      where: {
        id: subscriptionId,
        businessOwnerId: businessOwner.id,
      },
      relations: ['subscriptionPlan'],
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const canRetry = subscription.status === SubscriptionStatus.PENDING;

    const responseData: SubscriptionPaymentStatusDataDto = {
      subscriptionId: subscription.id,
      status: subscription.status,
      razorpayOrderId: subscription.razorpayOrderId,
      canRetry,
      planName: subscription.subscriptionPlan.name,
      amount: subscription.subscriptionPlan.price,
      currency: subscription.subscriptionPlan.currency,
    };

    return {
      code: 200,
      success: true,
      message: 'Subscription payment status retrieved successfully',
      data: responseData,
    };
  }

  private verifyRazorpaySignature(orderId: string, paymentId: string, signature: string): boolean {
    const razorpaySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
    const text = orderId + '|' + paymentId;

    const generatedSignature = crypto
      .createHmac('sha256', razorpaySecret)
      .update(text)
      .digest('hex');

    return generatedSignature === signature;
  }
}