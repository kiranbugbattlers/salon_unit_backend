"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const razorpay_1 = __importDefault(require("razorpay"));
const crypto = __importStar(require("crypto"));
const entities_1 = require("../database/entities");
const enums_1 = require("../common/enums");
let SubscriptionService = class SubscriptionService {
    constructor(subscriptionPlanRepository, businessSubscriptionRepository, transactionRepository, businessOwnerRepository, configService) {
        this.subscriptionPlanRepository = subscriptionPlanRepository;
        this.businessSubscriptionRepository = businessSubscriptionRepository;
        this.transactionRepository = transactionRepository;
        this.businessOwnerRepository = businessOwnerRepository;
        this.configService = configService;
        this.razorpay = new razorpay_1.default({
            key_id: this.configService.get('RAZORPAY_KEY_ID'),
            key_secret: this.configService.get('RAZORPAY_KEY_SECRET'),
        });
    }
    async createSubscriptionPlan(createPlanDto) {
        const plan = this.subscriptionPlanRepository.create({
            ...createPlanDto,
            currency: createPlanDto.currency || 'USD',
        });
        const savedPlan = await this.subscriptionPlanRepository.save(plan);
        return this.mapToSubscriptionPlanResponse(savedPlan);
    }
    async getAllSubscriptionPlans() {
        const plans = await this.subscriptionPlanRepository.find({
            order: { createdAt: 'DESC' },
        });
        return {
            plans: plans.map(this.mapToSubscriptionPlanResponse),
            total: plans.length,
        };
    }
    async getActiveSubscriptionPlans() {
        const plans = await this.subscriptionPlanRepository.find({
            where: { isActive: true },
            order: { price: 'ASC' },
        });
        return {
            plans: plans.map(this.mapToSubscriptionPlanResponse),
            total: plans.length,
        };
    }
    async getSubscriptionPlanById(id) {
        const plan = await this.subscriptionPlanRepository.findOne({ where: { id } });
        if (!plan) {
            throw new common_1.NotFoundException('Subscription plan not found');
        }
        return this.mapToSubscriptionPlanResponse(plan);
    }
    async updateSubscriptionPlan(id, updatePlanDto) {
        const plan = await this.subscriptionPlanRepository.findOne({
            where: { id },
            relations: ['businessSubscriptions']
        });
        if (!plan) {
            throw new common_1.NotFoundException('Subscription plan not found');
        }
        if (updatePlanDto.isActive === false) {
            const activeSubscriptions = plan.businessSubscriptions?.filter((sub) => sub.status === enums_1.SubscriptionStatus.ACTIVE) || [];
            if (activeSubscriptions.length > 0) {
                throw new common_1.BadRequestException(`Cannot disable plan with ${activeSubscriptions.length} active subscriptions`);
            }
        }
        if (updatePlanDto.price !== undefined && updatePlanDto.price < 0) {
            throw new common_1.BadRequestException('Price cannot be negative');
        }
        Object.assign(plan, updatePlanDto);
        const updatedPlan = await this.subscriptionPlanRepository.save(plan);
        return this.mapToSubscriptionPlanResponse(updatedPlan);
    }
    async deleteSubscriptionPlan(id) {
        const plan = await this.subscriptionPlanRepository.findOne({
            where: { id },
            relations: ['businessSubscriptions'],
        });
        if (!plan) {
            throw new common_1.NotFoundException('Subscription plan not found');
        }
        if (plan.businessSubscriptions && plan.businessSubscriptions.length > 0) {
            const activeSubscriptions = plan.businessSubscriptions.filter((sub) => sub.status === enums_1.SubscriptionStatus.ACTIVE);
            if (activeSubscriptions.length > 0) {
                throw new common_1.BadRequestException(`Cannot delete subscription plan with ${activeSubscriptions.length} active subscription(s). Please cancel or expire them first.`);
            }
            throw new common_1.BadRequestException(`Cannot delete subscription plan with ${plan.businessSubscriptions.length} historical subscription(s). Consider disabling the plan instead.`);
        }
        await this.subscriptionPlanRepository.remove(plan);
    }
    async subscribeBusinessToPlan(userId, subscribeDto) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { userId },
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business not found');
        }
        if (!businessOwner.isApproved) {
            throw new common_1.ForbiddenException('Only approved businesses can subscribe to plans');
        }
        const existingSubscription = await this.businessSubscriptionRepository.findOne({
            where: {
                businessOwnerId: businessOwner.id,
                status: enums_1.SubscriptionStatus.ACTIVE,
            },
        });
        if (existingSubscription) {
            if (existingSubscription.isExpired) {
                existingSubscription.status = enums_1.SubscriptionStatus.EXPIRED;
                await this.businessSubscriptionRepository.save(existingSubscription);
            }
            else {
                throw new common_1.ConflictException('Business already has an active subscription');
            }
        }
        const plan = await this.subscriptionPlanRepository.findOne({
            where: { id: subscribeDto.subscriptionPlanId, isActive: true },
        });
        if (!plan) {
            throw new common_1.NotFoundException('Subscription plan not found or inactive');
        }
        const startedAt = new Date();
        let expiresAt = null;
        if (plan.billingType === enums_1.BillingType.MONTHLY) {
            expiresAt = new Date(startedAt);
            expiresAt.setMonth(expiresAt.getMonth() + 1);
        }
        else if (plan.billingType === enums_1.BillingType.YEARLY) {
            expiresAt = new Date(startedAt);
            expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        }
        const subscription = this.businessSubscriptionRepository.create({
            businessOwnerId: businessOwner.id,
            subscriptionPlanId: plan.id,
            status: enums_1.SubscriptionStatus.ACTIVE,
            startedAt,
            expiresAt,
            autoRenew: subscribeDto.autoRenew || false,
        });
        const savedSubscription = await this.businessSubscriptionRepository.save(subscription);
        const transaction = this.transactionRepository.create({
            businessSubscriptionId: savedSubscription.id,
            amount: plan.price,
            currency: plan.currency,
            status: enums_1.TransactionStatus.COMPLETED,
            transactionDate: new Date(),
            paymentMethod: 'manual',
        });
        await this.transactionRepository.save(transaction);
        return this.getBusinessSubscriptionById(savedSubscription.id);
    }
    async getBusinessSubscription(userId) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { userId },
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business not found');
        }
        const subscription = await this.businessSubscriptionRepository.findOne({
            where: { businessOwnerId: businessOwner.id },
            relations: ['subscriptionPlan'],
            order: { createdAt: 'DESC' },
        });
        if (!subscription) {
            throw new common_1.NotFoundException('No subscription found for this business');
        }
        if (subscription.status === enums_1.SubscriptionStatus.ACTIVE && subscription.isExpired) {
            subscription.status = enums_1.SubscriptionStatus.EXPIRED;
            await this.businessSubscriptionRepository.save(subscription);
        }
        return this.mapToBusinessSubscriptionResponse(subscription);
    }
    async cancelBusinessSubscription(userId, cancelDto) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { userId },
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business not found');
        }
        const subscription = await this.businessSubscriptionRepository.findOne({
            where: {
                businessOwnerId: businessOwner.id,
                status: enums_1.SubscriptionStatus.ACTIVE,
            },
        });
        if (!subscription) {
            throw new common_1.NotFoundException('No active subscription found for this business');
        }
        subscription.status = enums_1.SubscriptionStatus.CANCELLED;
        subscription.cancellationReason = cancelDto.cancellationReason;
        subscription.cancelledAt = new Date();
        subscription.autoRenew = false;
        await this.businessSubscriptionRepository.save(subscription);
    }
    async getBusinessSubscriptionHistory(userId) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { userId },
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business not found');
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
    async hasActiveSubscription(userId) {
        try {
            const subscription = await this.getBusinessSubscription(userId);
            return {
                hasActive: subscription.isActive,
                subscription: subscription.isActive ? subscription : undefined,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                return { hasActive: false };
            }
            throw error;
        }
    }
    async updateExpiredSubscriptions() {
        const expiredSubscriptions = await this.businessSubscriptionRepository
            .createQueryBuilder('subscription')
            .where('subscription.status = :status', { status: enums_1.SubscriptionStatus.ACTIVE })
            .andWhere('subscription.expiresAt IS NOT NULL')
            .andWhere('subscription.expiresAt < :now', { now: new Date() })
            .getMany();
        let updatedCount = 0;
        for (const subscription of expiredSubscriptions) {
            subscription.status = enums_1.SubscriptionStatus.EXPIRED;
            await this.businessSubscriptionRepository.save(subscription);
            updatedCount++;
        }
        return { updated: updatedCount };
    }
    async getExpiringSubscriptions(daysAhead = 7) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + daysAhead);
        return this.businessSubscriptionRepository
            .createQueryBuilder('subscription')
            .leftJoinAndSelect('subscription.subscriptionPlan', 'plan')
            .leftJoinAndSelect('subscription.businessOwner', 'businessOwner')
            .where('subscription.status = :status', { status: enums_1.SubscriptionStatus.ACTIVE })
            .andWhere('subscription.expiresAt IS NOT NULL')
            .andWhere('subscription.expiresAt BETWEEN :now AND :future', {
            now: new Date(),
            future: futureDate
        })
            .getMany();
    }
    async getAllBusinessSubscriptions() {
        const subscriptions = await this.businessSubscriptionRepository.find({
            relations: ['subscriptionPlan', 'businessOwner'],
            order: { createdAt: 'DESC' },
        });
        return {
            subscriptions: subscriptions.map(this.mapToBusinessSubscriptionResponse),
            total: subscriptions.length,
        };
    }
    async getBusinessSubscriptionById(id) {
        const subscription = await this.businessSubscriptionRepository.findOne({
            where: { id },
            relations: ['subscriptionPlan'],
        });
        if (!subscription) {
            throw new common_1.NotFoundException('Subscription not found');
        }
        return this.mapToBusinessSubscriptionResponse(subscription);
    }
    mapToSubscriptionPlanResponse(plan) {
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
    mapToBusinessSubscriptionResponse(subscription) {
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
    async createSubscriptionPaymentOrder(userId, createDto) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { userId },
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business not found');
        }
        if (!businessOwner.isApproved) {
            throw new common_1.ForbiddenException('Only approved businesses can subscribe to plans');
        }
        const existingSubscription = await this.businessSubscriptionRepository.findOne({
            where: {
                businessOwnerId: businessOwner.id,
                status: enums_1.SubscriptionStatus.ACTIVE,
            },
        });
        if (existingSubscription) {
            if (existingSubscription.isExpired) {
                existingSubscription.status = enums_1.SubscriptionStatus.EXPIRED;
                await this.businessSubscriptionRepository.save(existingSubscription);
            }
            else {
                throw new common_1.ConflictException('Business already has an active subscription');
            }
        }
        const pendingSubscription = await this.businessSubscriptionRepository.findOne({
            where: {
                businessOwnerId: businessOwner.id,
                status: enums_1.SubscriptionStatus.PENDING,
            },
            relations: ['subscriptionPlan'],
        });
        if (pendingSubscription) {
            if (pendingSubscription.subscriptionPlanId === createDto.subscriptionPlanId && pendingSubscription.razorpayOrderId) {
                const responseData = {
                    orderId: pendingSubscription.razorpayOrderId,
                    amount: Math.round(pendingSubscription.subscriptionPlan.price * 100),
                    currency: pendingSubscription.subscriptionPlan.currency === 'USD' ? 'INR' : pendingSubscription.subscriptionPlan.currency,
                    razorpayKeyId: this.configService.get('RAZORPAY_KEY_ID'),
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
            await this.businessSubscriptionRepository.remove(pendingSubscription);
        }
        const plan = await this.subscriptionPlanRepository.findOne({
            where: { id: createDto.subscriptionPlanId, isActive: true },
        });
        if (!plan) {
            throw new common_1.NotFoundException('Subscription plan not found or inactive');
        }
        const currency = plan.currency === 'USD' ? 'INR' : plan.currency;
        const amountInSmallestUnit = Math.round(plan.price * 100);
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
        const startedAt = new Date();
        let expiresAt = null;
        if (plan.billingType === enums_1.BillingType.MONTHLY) {
            expiresAt = new Date(startedAt);
            expiresAt.setMonth(expiresAt.getMonth() + 1);
        }
        else if (plan.billingType === enums_1.BillingType.YEARLY) {
            expiresAt = new Date(startedAt);
            expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        }
        const subscription = this.businessSubscriptionRepository.create({
            businessOwnerId: businessOwner.id,
            subscriptionPlanId: plan.id,
            status: enums_1.SubscriptionStatus.PENDING,
            startedAt,
            expiresAt,
            autoRenew: createDto.autoRenew || false,
            razorpayOrderId: razorpayOrder.id,
            lastPaymentAttemptAt: new Date(),
        });
        const savedSubscription = await this.businessSubscriptionRepository.save(subscription);
        const transaction = this.transactionRepository.create({
            businessSubscriptionId: savedSubscription.id,
            amount: plan.price,
            currency: plan.currency,
            status: enums_1.TransactionStatus.PENDING,
            transactionDate: new Date(),
            paymentProvider: 'razorpay',
            razorpayOrderId: razorpayOrder.id,
            paymentAttemptedAt: new Date(),
        });
        await this.transactionRepository.save(transaction);
        const responseData = {
            orderId: razorpayOrder.id,
            amount: amountInSmallestUnit,
            currency: currency,
            razorpayKeyId: this.configService.get('RAZORPAY_KEY_ID'),
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
    async verifySubscriptionPayment(userId, verifyDto) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { userId },
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business not found');
        }
        const subscription = await this.businessSubscriptionRepository.findOne({
            where: {
                id: verifyDto.subscriptionId,
                businessOwnerId: businessOwner.id,
            },
            relations: ['subscriptionPlan'],
        });
        if (!subscription) {
            throw new common_1.NotFoundException('Subscription not found');
        }
        if (subscription.businessOwnerId !== businessOwner.id) {
            throw new common_1.ForbiddenException('You can only verify payment for your own subscription');
        }
        if (subscription.status === enums_1.SubscriptionStatus.ACTIVE && subscription.razorpayPaymentId) {
            throw new common_1.BadRequestException('Subscription already activated');
        }
        const isValidSignature = this.verifyRazorpaySignature(verifyDto.razorpayOrderId, verifyDto.razorpayPaymentId, verifyDto.razorpaySignature);
        if (!isValidSignature) {
            throw new common_1.BadRequestException('Payment signature verification failed');
        }
        let paymentMethod = 'unknown';
        try {
            const razorpayPayment = await this.razorpay.payments.fetch(verifyDto.razorpayPaymentId);
            paymentMethod = razorpayPayment.method || 'unknown';
        }
        catch (error) {
        }
        subscription.status = enums_1.SubscriptionStatus.ACTIVE;
        subscription.razorpayPaymentId = verifyDto.razorpayPaymentId;
        const updatedSubscription = await this.businessSubscriptionRepository.save(subscription);
        const transaction = await this.transactionRepository.findOne({
            where: {
                businessSubscriptionId: subscription.id,
                razorpayOrderId: verifyDto.razorpayOrderId,
            },
        });
        if (transaction) {
            transaction.status = enums_1.TransactionStatus.COMPLETED;
            transaction.razorpayPaymentId = verifyDto.razorpayPaymentId;
            transaction.razorpaySignature = verifyDto.razorpaySignature;
            transaction.paymentMethod = paymentMethod;
            transaction.paymentCompletedAt = new Date();
            await this.transactionRepository.save(transaction);
        }
        const responseData = {
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
    async getSubscriptionPaymentStatus(userId, subscriptionId) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { userId },
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business not found');
        }
        const subscription = await this.businessSubscriptionRepository.findOne({
            where: {
                id: subscriptionId,
                businessOwnerId: businessOwner.id,
            },
            relations: ['subscriptionPlan'],
        });
        if (!subscription) {
            throw new common_1.NotFoundException('Subscription not found');
        }
        const canRetry = subscription.status === enums_1.SubscriptionStatus.PENDING;
        const responseData = {
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
    verifyRazorpaySignature(orderId, paymentId, signature) {
        const razorpaySecret = this.configService.get('RAZORPAY_KEY_SECRET');
        const text = orderId + '|' + paymentId;
        const generatedSignature = crypto
            .createHmac('sha256', razorpaySecret)
            .update(text)
            .digest('hex');
        return generatedSignature === signature;
    }
};
exports.SubscriptionService = SubscriptionService;
exports.SubscriptionService = SubscriptionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.SubscriptionPlan)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.BusinessSubscription)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.SubscriptionTransaction)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.BusinessOwner)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService])
], SubscriptionService);
//# sourceMappingURL=subscription.service.js.map