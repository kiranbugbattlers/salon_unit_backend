import { BusinessOwner } from './business-owner.entity';
import { Admin } from './admin.entity';
export declare enum DuePaymentStatus {
    PENDING = "pending",
    OVERDUE = "overdue",
    PAID = "paid",
    PARTIALLY_PAID = "partially_paid"
}
export declare class VendorDuePayment {
    id: string;
    businessOwnerId: string;
    dueAmount: number;
    paidAmount: number;
    remainingAmount: number;
    alternateNumber?: string;
    salonName?: string;
    ownerName?: string;
    mobileNumber?: string;
    isBusinessEnabled: boolean;
    dueDate: Date;
    status: DuePaymentStatus;
    description?: string;
    createdByAdminId?: string;
    updatedByAdminId?: string;
    markedOverdueAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    businessOwner: BusinessOwner;
    createdByAdmin?: Admin;
    updatedByAdmin?: Admin;
    get isOverdue(): boolean;
    get isPaid(): boolean;
    get isPartiallyPaid(): boolean;
    get isPending(): boolean;
}
