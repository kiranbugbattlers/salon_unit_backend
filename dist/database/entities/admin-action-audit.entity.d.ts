import { Admin } from './admin.entity';
export declare enum AdminActionType {
    WALLET_ADJUSTMENT = "wallet_adjustment",
    DEFAULTER_MARK = "defaulter_mark",
    DEFAULTER_RESTORE = "defaulter_restore",
    COMMISSION_CONFIG_CREATE = "commission_config_create",
    SETTLEMENT_MANUAL_GENERATE = "settlement_manual_generate",
    PAYOUT_PROCESS = "payout_process",
    PAYOUT_MARK_PAID = "payout_mark_paid",
    WALLET_FREEZE = "wallet_freeze",
    WALLET_UNFREEZE = "wallet_unfreeze",
    BANKING_INFO_VERIFY = "banking_info_verify",
    TRANSACTION_REVERSE = "transaction_reverse"
}
export declare class AdminActionAudit {
    id: string;
    adminId: string;
    actionType: AdminActionType;
    entityType: string;
    entityId: string;
    stateBefore?: any;
    stateAfter?: any;
    reason: string;
    notes?: string;
    ipAddress: string;
    userAgent?: string;
    metadata?: any;
    createdAt: Date;
    admin: Admin;
}
