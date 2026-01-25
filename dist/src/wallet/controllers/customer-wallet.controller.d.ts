import { WalletService } from '../wallet.service';
import { RewardPointsService } from '../reward-points.service';
import { RedeemPointsDto } from '../dto/wallet.dto';
export declare class CustomerWalletController {
    private readonly walletService;
    private readonly rewardPointsService;
    constructor(walletService: WalletService, rewardPointsService: RewardPointsService);
    getWalletStats(req: any): Promise<any>;
    getTransactions(req: any, page?: number, limit?: number, category?: string): Promise<any>;
    getTierBenefits(tier?: string): Promise<any>;
    redeemPoints(req: any, redeemDto: RedeemPointsDto): Promise<any>;
}
