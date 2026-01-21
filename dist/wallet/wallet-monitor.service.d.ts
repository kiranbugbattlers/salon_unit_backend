import { Repository } from 'typeorm';
import { Wallet, BusinessOwner } from '../database/entities';
export declare class WalletMonitorService {
    private readonly walletRepository;
    private readonly businessOwnerRepository;
    private readonly logger;
    constructor(walletRepository: Repository<Wallet>, businessOwnerRepository: Repository<BusinessOwner>);
    checkNegativeBalances(): Promise<void>;
    checkAndMarkDefaulters(): Promise<{
        newDefaulters: number;
        alreadyDefaulters: number;
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
