import { WalletMonitorService } from '../wallet-monitor.service';
import { WalletService } from '../wallet.service';
import { Repository } from 'typeorm';
import { BusinessOwner, Wallet, BankingInfo } from '../../database/entities';
import { ManualDefaulterActionDto } from '../dto/defaulter.dto';
export declare class AdminDefaulterController {
    private readonly walletMonitorService;
    private readonly walletService;
    private readonly businessOwnerRepository;
    private readonly walletRepository;
    private readonly bankingInfoRepository;
    constructor(walletMonitorService: WalletMonitorService, walletService: WalletService, businessOwnerRepository: Repository<BusinessOwner>, walletRepository: Repository<Wallet>, bankingInfoRepository: Repository<BankingInfo>);
    getAllDefaulters(): Promise<any>;
    getDefaultersSummary(): Promise<any>;
    getDefaulterDetails(businessOwnerId: string): Promise<any>;
    checkDefaulters(): Promise<any>;
    manuallyMarkDefaulter(businessOwnerId: string, actionDto: ManualDefaulterActionDto, req: any): Promise<any>;
    manuallyRestoreDefaulter(businessOwnerId: string, actionDto: ManualDefaulterActionDto, req: any): Promise<any>;
    getDefaulterStats(): Promise<any>;
}
