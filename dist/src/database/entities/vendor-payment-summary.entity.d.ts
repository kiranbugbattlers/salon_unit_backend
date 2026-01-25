import { BusinessOwner } from './business-owner.entity';
import { VendorPaymentStatus } from './user-booking-history.entity';
export declare class VendorPaymentSummary {
    id: string;
    businessOwnerId: string;
    summaryDate: Date;
    totalBookings: number;
    totalRevenue: number;
    totalCommission: number;
    vendorEarning: number;
    amountPaid: number;
    amountDue: number;
    paymentStatus: VendorPaymentStatus;
    createdAt: Date;
    updatedAt: Date;
    businessOwner: BusinessOwner;
    get isPaid(): boolean;
    get isOverdue(): boolean;
    get isPartiallyPaid(): boolean;
    get hasDueAmount(): boolean;
    get paymentPercentage(): number;
}
