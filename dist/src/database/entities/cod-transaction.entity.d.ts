import { Booking } from './booking.entity';
import { BusinessOwner } from './business-owner.entity';
import { Customer } from './customer.entity';
import { MonthlySettlement } from './monthly-settlement.entity';
export declare enum CODTransactionStatus {
    PENDING = "pending",
    SETTLED = "settled",
    DISPUTED = "disputed"
}
export declare class CODTransaction {
    id: string;
    bookingId: string;
    businessOwnerId: string;
    customerId: string;
    amount: number;
    commissionAmount: number;
    netAmount: number;
    collectedAt: Date;
    settledInMonth?: string;
    settlementId?: string;
    status: CODTransactionStatus;
    notes?: string;
    createdAt: Date;
    booking: Booking;
    businessOwner: BusinessOwner;
    customer: Customer;
    settlement?: MonthlySettlement;
}
