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
exports.CommissionPaymentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const crypto = __importStar(require("crypto"));
const razorpay_1 = __importDefault(require("razorpay"));
const commission_payment_entity_1 = require("../database/entities/commission-payment.entity");
const wallet_entity_1 = require("../database/entities/wallet.entity");
const business_owner_entity_1 = require("../database/entities/business-owner.entity");
const wallet_transaction_entity_1 = require("../database/entities/wallet-transaction.entity");
let CommissionPaymentService = class CommissionPaymentService {
    constructor(commissionPaymentRepository, walletRepository, businessOwnerRepository, walletTransactionRepository, configService, dataSource) {
        this.commissionPaymentRepository = commissionPaymentRepository;
        this.walletRepository = walletRepository;
        this.businessOwnerRepository = businessOwnerRepository;
        this.walletTransactionRepository = walletTransactionRepository;
        this.configService = configService;
        this.dataSource = dataSource;
        this.razorpay = new razorpay_1.default({
            key_id: this.configService.get('RAZORPAY_KEY_ID'),
            key_secret: this.configService.get('RAZORPAY_KEY_SECRET'),
        });
    }
    async createCommissionPaymentOrder(businessOwnerId, amount, notes) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { id: businessOwnerId },
            relations: ['user'],
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner not found');
        }
        const wallet = await this.walletRepository.findOne({
            where: {
                userId: businessOwner.userId,
                userType: wallet_entity_1.WalletUserType.BUSINESS_OWNER,
            },
        });
        if (!wallet) {
            throw new common_1.NotFoundException('Wallet not found');
        }
        if (amount <= 0) {
            throw new common_1.BadRequestException('Amount must be greater than 0');
        }
        const currentBalance = Number(wallet.balance);
        if (currentBalance >= 0) {
            throw new common_1.BadRequestException('No commission debt to pay. Your balance is already positive.');
        }
        const maxPayment = Math.abs(currentBalance);
        if (amount > maxPayment) {
            throw new common_1.BadRequestException(`Payment amount (₹${amount}) exceeds your debt (₹${maxPayment}). Maximum payment allowed: ₹${maxPayment}`);
        }
        const amountInPaise = Math.round(amount * 100);
        const shortBoId = businessOwnerId.substring(0, 8);
        const timestamp = Date.now().toString().substring(6);
        const receipt = `com_${shortBoId}_${timestamp}`;
        const razorpayOrder = await this.razorpay.orders.create({
            amount: amountInPaise,
            currency: 'INR',
            receipt: receipt,
            notes: {
                business_owner_id: businessOwnerId,
                wallet_id: wallet.id,
                payment_type: 'commission_payment',
                business_name: businessOwner.businessName || 'N/A',
            },
        });
        const payment = this.commissionPaymentRepository.create({
            businessOwnerId,
            walletId: wallet.id,
            amount: amount.toString(),
            razorpayOrderId: razorpayOrder.id,
            status: commission_payment_entity_1.CommissionPaymentStatus.PENDING,
            balanceBefore: wallet.balance.toString(),
            paymentDescription: `Commission payment - ${businessOwner.businessName || 'Business'}`,
            notes: notes || null,
        });
        await this.commissionPaymentRepository.save(payment);
        return {
            orderId: razorpayOrder.id,
            amount: amountInPaise,
            currency: 'INR',
            razorpayKey: this.configService.get('RAZORPAY_KEY_ID'),
            description: `Commission Payment - ${businessOwner.businessName || 'Your Business'}`,
            businessOwnerName: `${businessOwner.firstName || ''} ${businessOwner.lastName || ''}`.trim() || 'Business Owner',
            businessOwnerPhone: businessOwner.user?.phone || '',
        };
    }
    async verifyAndProcessPayment(businessOwnerId, razorpayOrderId, razorpayPaymentId, razorpaySignature) {
        const payment = await this.commissionPaymentRepository.findOne({
            where: {
                businessOwnerId,
                razorpayOrderId,
                status: commission_payment_entity_1.CommissionPaymentStatus.PENDING,
            },
            relations: ['businessOwner', 'wallet'],
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found or already processed');
        }
        const isValidSignature = this.verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
        if (!isValidSignature) {
            payment.status = commission_payment_entity_1.CommissionPaymentStatus.FAILED;
            payment.failureReason = 'Invalid signature';
            await this.commissionPaymentRepository.save(payment);
            throw new common_1.BadRequestException('Payment verification failed. Invalid signature.');
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            payment.razorpayPaymentId = razorpayPaymentId;
            payment.razorpaySignature = razorpaySignature;
            payment.status = commission_payment_entity_1.CommissionPaymentStatus.COMPLETED;
            payment.processedAt = new Date();
            const wallet = await queryRunner.manager.findOne(wallet_entity_1.Wallet, {
                where: { id: payment.walletId },
                lock: { mode: 'pessimistic_write' },
            });
            const balanceBefore = Number(wallet.balance);
            const paymentAmount = Number(payment.amount);
            const balanceAfter = balanceBefore + paymentAmount;
            wallet.balance = Number(balanceAfter.toFixed(2));
            wallet.totalEarned = Number((Number(wallet.totalEarned) + paymentAmount).toFixed(2));
            wallet.lastTransactionAt = new Date();
            await queryRunner.manager.save(wallet);
            payment.balanceAfter = balanceAfter.toFixed(2);
            const transaction = queryRunner.manager.create(wallet_transaction_entity_1.WalletTransaction, {
                walletId: wallet.id,
                type: wallet_transaction_entity_1.WalletTransactionType.CREDIT,
                category: wallet_transaction_entity_1.WalletTransactionCategory.COMMISSION_PAYMENT,
                amount: Number(paymentAmount.toFixed(2)),
                balanceBefore: Number(balanceBefore.toFixed(2)),
                balanceAfter: Number(balanceAfter.toFixed(2)),
                description: `Commission payment via Razorpay (Order: ${razorpayOrderId})`,
                status: wallet_transaction_entity_1.WalletTransactionStatus.COMPLETED,
                metadata: {
                    razorpay_order_id: razorpayOrderId,
                    razorpay_payment_id: razorpayPaymentId,
                    payment_id: payment.id,
                },
            });
            await queryRunner.manager.save(wallet_transaction_entity_1.WalletTransaction, transaction);
            let defaulterRemoved = false;
            if (balanceAfter >= 0) {
                const businessOwner = await queryRunner.manager.findOne(business_owner_entity_1.BusinessOwner, {
                    where: { id: payment.businessOwnerId },
                });
                if (businessOwner.isDefaulter) {
                    businessOwner.isDefaulter = false;
                    businessOwner.defaulterSince = null;
                    await queryRunner.manager.save(businessOwner);
                    defaulterRemoved = true;
                    payment.defaulterRemoved = true;
                }
            }
            await queryRunner.manager.save(payment);
            await queryRunner.commitTransaction();
            return {
                verified: true,
                amount: paymentAmount,
                newBalance: balanceAfter,
                defaulterStatusRemoved: defaulterRemoved,
                paymentId: payment.id,
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            payment.status = commission_payment_entity_1.CommissionPaymentStatus.FAILED;
            payment.failureReason = error.message;
            await this.commissionPaymentRepository.save(payment);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    verifyRazorpaySignature(orderId, paymentId, signature) {
        const secret = this.configService.get('RAZORPAY_KEY_SECRET');
        const body = orderId + '|' + paymentId;
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body.toString())
            .digest('hex');
        return expectedSignature === signature;
    }
    async getPaymentHistory(businessOwnerId, options = {}) {
        const page = options.page || 1;
        const limit = options.limit || 20;
        const skip = (page - 1) * limit;
        const [payments, total] = await this.commissionPaymentRepository.findAndCount({
            where: { businessOwnerId },
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });
        return {
            payments,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getPaymentById(paymentId, businessOwnerId) {
        const payment = await this.commissionPaymentRepository.findOne({
            where: {
                id: paymentId,
                businessOwnerId,
            },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        return payment;
    }
    async handlePaymentWebhook(payload) {
        const event = payload.event;
        const paymentData = payload.payload.payment.entity;
        if (event === 'payment.captured') {
            const orderId = paymentData.order_id;
            const paymentId = paymentData.id;
            const payment = await this.commissionPaymentRepository.findOne({
                where: { razorpayOrderId: orderId },
            });
            if (!payment) {
                console.error(`Payment not found for order: ${orderId}`);
                return;
            }
            if (payment.status === commission_payment_entity_1.CommissionPaymentStatus.COMPLETED) {
                return;
            }
            payment.status = commission_payment_entity_1.CommissionPaymentStatus.PROCESSING;
            payment.razorpayPaymentId = paymentId;
            await this.commissionPaymentRepository.save(payment);
        }
        else if (event === 'payment.failed') {
            const orderId = paymentData.order_id;
            const payment = await this.commissionPaymentRepository.findOne({
                where: { razorpayOrderId: orderId },
            });
            if (payment) {
                payment.status = commission_payment_entity_1.CommissionPaymentStatus.FAILED;
                payment.failureReason = paymentData.error_description || 'Payment failed';
                await this.commissionPaymentRepository.save(payment);
            }
        }
    }
};
exports.CommissionPaymentService = CommissionPaymentService;
exports.CommissionPaymentService = CommissionPaymentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(commission_payment_entity_1.CommissionPayment)),
    __param(1, (0, typeorm_1.InjectRepository)(wallet_entity_1.Wallet)),
    __param(2, (0, typeorm_1.InjectRepository)(business_owner_entity_1.BusinessOwner)),
    __param(3, (0, typeorm_1.InjectRepository)(wallet_transaction_entity_1.WalletTransaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService,
        typeorm_2.DataSource])
], CommissionPaymentService);
//# sourceMappingURL=commission-payment.service.js.map