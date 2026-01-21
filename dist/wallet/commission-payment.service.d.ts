import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { CommissionPayment } from '../database/entities/commission-payment.entity';
import { Wallet } from '../database/entities/wallet.entity';
import { BusinessOwner } from '../database/entities/business-owner.entity';
import { WalletTransaction } from '../database/entities/wallet-transaction.entity';
export declare class CommissionPaymentService {
    private readonly commissionPaymentRepository;
    private readonly walletRepository;
    private readonly businessOwnerRepository;
    private readonly walletTransactionRepository;
    private readonly configService;
    private readonly dataSource;
    private razorpay;
    constructor(commissionPaymentRepository: Repository<CommissionPayment>, walletRepository: Repository<Wallet>, businessOwnerRepository: Repository<BusinessOwner>, walletTransactionRepository: Repository<WalletTransaction>, configService: ConfigService, dataSource: DataSource);
    createCommissionPaymentOrder(businessOwnerId: string, amount: number, notes?: string): Promise<{
        orderId: string;
        amount: number;
        currency: string;
        razorpayKey: string;
        description: string;
        businessOwnerName: string;
        businessOwnerPhone: string;
    }>;
    verifyAndProcessPayment(businessOwnerId: string, razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string): Promise<{
        verified: boolean;
        amount: number;
        newBalance: number;
        defaulterStatusRemoved: boolean;
        paymentId: string;
    }>;
    private verifyRazorpaySignature;
    getPaymentHistory(businessOwnerId: string, options?: {
        page?: number;
        limit?: number;
    }): Promise<{
        payments: CommissionPayment[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getPaymentById(paymentId: string, businessOwnerId: string): Promise<CommissionPayment>;
    handlePaymentWebhook(payload: any): Promise<void>;
}
