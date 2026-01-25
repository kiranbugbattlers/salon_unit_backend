import { SettlementPaidStatus } from '../../database/entities/daily-settlement.entity';
export declare class UpdateSettlementStatusDto {
    businessOwnerId: string;
    date: string;
    status: SettlementPaidStatus;
    transactionReference?: string;
    adminNotes?: string;
}
