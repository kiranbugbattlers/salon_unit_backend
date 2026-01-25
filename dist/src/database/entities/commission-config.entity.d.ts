import { Admin } from './admin.entity';
export declare class CommissionConfig {
    id: string;
    businessOwnerCommissionPercent: number;
    customerRewardPercent: number;
    isActive: boolean;
    effectiveFrom: Date;
    effectiveUntil?: Date;
    createdByAdminId: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: Admin;
}
