import { MonthlySettlement } from './monthly-settlement.entity';
import { Booking } from './booking.entity';
import { CommissionTransaction } from './commission-transaction.entity';
export declare enum PaymentMethodType {
    ONLINE = "online",
    COD = "cod"
}
export declare class SettlementTransaction {
    id: string;
    settlementId: string;
    bookingId: string;
    commissionTransactionId?: string;
    amount: number;
    commissionAmount: number;
    netAmount: number;
    paymentMethod: PaymentMethodType;
    bookingCompletedAt: Date;
    createdAt: Date;
    settlement: MonthlySettlement;
    booking: Booking;
    commissionTransaction?: CommissionTransaction;
}
