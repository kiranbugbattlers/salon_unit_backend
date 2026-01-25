import { Repository } from 'typeorm';
import { Wallet, BusinessOwner, Admin } from '../database/entities';
import { NotificationService } from '../common/services/notification.service';
export declare class WalletMonitorService {
    private readonly walletRepository;
    private readonly businessOwnerRepository;
    private readonly adminRepository;
    private readonly notificationService;
    private readonly logger;
    constructor(walletRepository: Repository<Wallet>, businessOwnerRepository: Repository<BusinessOwner>, adminRepository: Repository<Admin>, notificationService: NotificationService);
    checkNegativeBalances(): Promise<void>;
    checkCreditLimitBreaches(): Promise<{
        notifiedCount: number;
        totalNegativeWallets: number;
    }>;
    getDefaultersSummary(): Promise<{
        totalDefaulters: number;
        totalNegativeBalance: number;
        defaulters: Array<{
            businessOwnerId: string;
            shopId: string;
            businessName: string;
            walletBalance: number;
            defaulterSince: Date;
        }>;
    }>;
}
