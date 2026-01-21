import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import Razorpay from 'razorpay';
import { CommissionPayment, CommissionPaymentStatus } from '../database/entities/commission-payment.entity';
import { Wallet, WalletUserType } from '../database/entities/wallet.entity';
import { BusinessOwner } from '../database/entities/business-owner.entity';
import {
  WalletTransaction,
  WalletTransactionType,
  WalletTransactionCategory,
  WalletTransactionStatus
} from '../database/entities/wallet-transaction.entity';

@Injectable()
export class CommissionPaymentService {
  private razorpay: Razorpay;

  constructor(
    @InjectRepository(CommissionPayment)
    private readonly commissionPaymentRepository: Repository<CommissionPayment>,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(BusinessOwner)
    private readonly businessOwnerRepository: Repository<BusinessOwner>,
    @InjectRepository(WalletTransaction)
    private readonly walletTransactionRepository: Repository<WalletTransaction>,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {
    this.razorpay = new Razorpay({
      key_id: this.configService.get<string>('RAZORPAY_KEY_ID'),
      key_secret: this.configService.get<string>('RAZORPAY_KEY_SECRET'),
    });
  }

  /**
   * Create a Razorpay order for commission payment
   */
  async createCommissionPaymentOrder(
    businessOwnerId: string,
    amount: number,
    notes?: string,
  ): Promise<{
    orderId: string;
    amount: number;
    currency: string;
    razorpayKey: string;
    description: string;
    businessOwnerName: string;
    businessOwnerPhone: string;
  }> {
    // Get business owner details
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { id: businessOwnerId },
      relations: ['user'],
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    // Get wallet
    const wallet = await this.walletRepository.findOne({
      where: {
        userId: businessOwner.userId,
        userType: WalletUserType.BUSINESS_OWNER,
      },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    // Validate amount
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    const currentBalance = Number(wallet.balance);
    if (currentBalance >= 0) {
      throw new BadRequestException('No commission debt to pay. Your balance is already positive.');
    }

    // Optional: Limit payment to actual debt
    const maxPayment = Math.abs(currentBalance);
    if (amount > maxPayment) {
      throw new BadRequestException(
        `Payment amount (₹${amount}) exceeds your debt (₹${maxPayment}). Maximum payment allowed: ₹${maxPayment}`,
      );
    }

    // Convert to paise (Razorpay uses smallest currency unit)
    const amountInPaise = Math.round(amount * 100);

    // Generate short receipt (max 40 chars) using timestamp and short BO ID
    const shortBoId = businessOwnerId.substring(0, 8);
    const timestamp = Date.now().toString().substring(6); // Last 7 digits
    const receipt = `com_${shortBoId}_${timestamp}`;

    // Create Razorpay order
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

    // Create payment record
    const payment = this.commissionPaymentRepository.create({
      businessOwnerId,
      walletId: wallet.id,
      amount: amount.toString(),
      razorpayOrderId: razorpayOrder.id,
      status: CommissionPaymentStatus.PENDING,
      balanceBefore: wallet.balance.toString(),
      paymentDescription: `Commission payment - ${businessOwner.businessName || 'Business'}`,
      notes: notes || null,
    });

    await this.commissionPaymentRepository.save(payment);

    return {
      orderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      razorpayKey: this.configService.get<string>('RAZORPAY_KEY_ID'),
      description: `Commission Payment - ${businessOwner.businessName || 'Your Business'}`,
      businessOwnerName: `${businessOwner.firstName || ''} ${businessOwner.lastName || ''}`.trim() || 'Business Owner',
      businessOwnerPhone: businessOwner.user?.phone || '',
    };
  }

  /**
   * Verify payment and update wallet
   */
  async verifyAndProcessPayment(
    businessOwnerId: string,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
  ): Promise<{
    verified: boolean;
    amount: number;
    newBalance: number;
    defaulterStatusRemoved: boolean;
    paymentId: string;
  }> {
    // Find payment record
    const payment = await this.commissionPaymentRepository.findOne({
      where: {
        businessOwnerId,
        razorpayOrderId,
        status: CommissionPaymentStatus.PENDING,
      },
      relations: ['businessOwner', 'wallet'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found or already processed');
    }

    // Verify signature
    const isValidSignature = this.verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    );

    if (!isValidSignature) {
      // Mark as failed
      payment.status = CommissionPaymentStatus.FAILED;
      payment.failureReason = 'Invalid signature';
      await this.commissionPaymentRepository.save(payment);

      throw new BadRequestException('Payment verification failed. Invalid signature.');
    }

    // Start transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update payment record
      payment.razorpayPaymentId = razorpayPaymentId;
      payment.razorpaySignature = razorpaySignature;
      payment.status = CommissionPaymentStatus.COMPLETED;
      payment.processedAt = new Date();

      // Get wallet with lock
      const wallet = await queryRunner.manager.findOne(Wallet, {
        where: { id: payment.walletId },
        lock: { mode: 'pessimistic_write' },
      });

      const balanceBefore = Number(wallet.balance);
      const paymentAmount = Number(payment.amount);
      const balanceAfter = balanceBefore + paymentAmount;

      // Update wallet balance
      wallet.balance = Number(balanceAfter.toFixed(2));
      wallet.totalEarned = Number((Number(wallet.totalEarned) + paymentAmount).toFixed(2));
      wallet.lastTransactionAt = new Date();
      await queryRunner.manager.save(wallet);

      payment.balanceAfter = balanceAfter.toFixed(2);

      // Create wallet transaction
      const transaction = queryRunner.manager.create(WalletTransaction, {
        walletId: wallet.id,
        type: WalletTransactionType.CREDIT,
        category: WalletTransactionCategory.COMMISSION_PAYMENT,
        amount: Number(paymentAmount.toFixed(2)),
        balanceBefore: Number(balanceBefore.toFixed(2)),
        balanceAfter: Number(balanceAfter.toFixed(2)),
        description: `Commission payment via Razorpay (Order: ${razorpayOrderId})`,
        status: WalletTransactionStatus.COMPLETED,
        metadata: {
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: razorpayPaymentId,
          payment_id: payment.id,
        },
      });
      await queryRunner.manager.save(WalletTransaction, transaction);

      // Check if defaulter status should be removed
      let defaulterRemoved = false;
      if (balanceAfter >= 0) {
        const businessOwner = await queryRunner.manager.findOne(BusinessOwner, {
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

      // Commit transaction
      await queryRunner.commitTransaction();

      return {
        verified: true,
        amount: paymentAmount,
        newBalance: balanceAfter,
        defaulterStatusRemoved: defaulterRemoved,
        paymentId: payment.id,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      // Mark payment as failed
      payment.status = CommissionPaymentStatus.FAILED;
      payment.failureReason = error.message;
      await this.commissionPaymentRepository.save(payment);

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Verify Razorpay signature
   */
  private verifyRazorpaySignature(
    orderId: string,
    paymentId: string,
    signature: string,
  ): boolean {
    const secret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
    const body = orderId + '|' + paymentId;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === signature;
  }

  /**
   * Get payment history for business owner
   */
  async getPaymentHistory(
    businessOwnerId: string,
    options: { page?: number; limit?: number } = {},
  ): Promise<{
    payments: CommissionPayment[];
    total: number;
    page: number;
    totalPages: number;
  }> {
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

  /**
   * Get payment details by ID
   */
  async getPaymentById(paymentId: string, businessOwnerId: string): Promise<CommissionPayment> {
    const payment = await this.commissionPaymentRepository.findOne({
      where: {
        id: paymentId,
        businessOwnerId,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  /**
   * Handle payment webhook from Razorpay
   */
  async handlePaymentWebhook(payload: any): Promise<void> {
    const event = payload.event;
    const paymentData = payload.payload.payment.entity;

    if (event === 'payment.captured') {
      const orderId = paymentData.order_id;
      const paymentId = paymentData.id;

      // Find payment by order ID
      const payment = await this.commissionPaymentRepository.findOne({
        where: { razorpayOrderId: orderId },
      });

      if (!payment) {
        console.error(`Payment not found for order: ${orderId}`);
        return;
      }

      if (payment.status === CommissionPaymentStatus.COMPLETED) {
        // Already processed
        return;
      }

      // Update status to processing
      payment.status = CommissionPaymentStatus.PROCESSING;
      payment.razorpayPaymentId = paymentId;
      await this.commissionPaymentRepository.save(payment);

      // Note: Actual wallet update should be done through verify endpoint
      // This is just to update the status
    } else if (event === 'payment.failed') {
      const orderId = paymentData.order_id;

      const payment = await this.commissionPaymentRepository.findOne({
        where: { razorpayOrderId: orderId },
      });

      if (payment) {
        payment.status = CommissionPaymentStatus.FAILED;
        payment.failureReason = paymentData.error_description || 'Payment failed';
        await this.commissionPaymentRepository.save(payment);
      }
    }
  }
}
