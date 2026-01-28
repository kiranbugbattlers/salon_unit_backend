import { SettlementService } from './settlement.service';
export declare class SettlementController {
    private readonly settlementService;
    constructor(settlementService: SettlementService);
    test(): Promise<any>;
    getBusinessOwnerSettlementHistory(businessOwnerId: string, req: any): Promise<any>;
    debugUserInfo(req: any): Promise<any>;
    getMySettlementHistory(req: any): Promise<any>;
}
