import { DailySettlementService } from '../../wallet/daily-settlement.service';
import { GetDailySettlementsDto } from '../dto/get-daily-settlements.dto';
import { UpdateSettlementStatusDto } from '../dto/update-settlement-status.dto';
export declare class AdminSettlementController {
    private readonly dailySettlementService;
    constructor(dailySettlementService: DailySettlementService);
    getAllSettlements(query: GetDailySettlementsDto): Promise<{
        businesses: any[];
        total: number;
        page: number;
        totalPages: number;
        dateFilter: {
            date?: string;
            startDate?: string;
            endDate?: string;
        };
        summary: {
            totalTransactionsAmount: number;
            totalCashAmount: number;
            totalOnlineAmount: number;
            totalCommissionAmount: number;
            totalGstAmount: number;
            totalDeduction: number;
            totalSettlementAmount: number;
            totalBusinesses: number;
        };
    }>;
    getAllHistory(page?: number, limit?: number, startDate?: string, endDate?: string, businessOwnerId?: string): Promise<any>;
    updateSettlementStatus(dto: UpdateSettlementStatusDto): Promise<{
        message: string;
        settlement: any;
    }>;
    getSettlementDetails(businessOwnerId: string, date?: string, startDate?: string, endDate?: string): Promise<any>;
    generateSettlements(body: {
        date: string;
    }): Promise<{
        generated: number;
        updated: number;
    }>;
}
