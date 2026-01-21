import { User } from './user.entity';
import { Booking } from './booking.entity';
import { BusinessOwner } from './business-owner.entity';
import { PaymentMethod } from './business-owner-transaction-history.entity';
export declare enum BookingPaymentStatus {
    PENDING = "pending",
    PAID = "paid",
    REFUNDED = "refunded",
    PARTIALLY_PAID = "partially_paid"
}
export declare enum VendorPaymentStatus {
    PENDING = "pending",
    PAID = "paid",
    OVERDUE = "overdue",
    PARTIALLY_PAID = "partially_paid"
}
export declare enum BookingStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    NO_SHOW = "no_show"
}
export declare class UserBookingHistory {
    id: string;
    userId: string;
    bookingId?: string;
    businessOwnerId: string;
    customerName: string;
    customerMobile: string;
    bookingDate: Date;
    bookingAmount: number;
    paymentStatus: BookingPaymentStatus;
    paymentMethod?: PaymentMethod;
    vendorPaymentStatus: VendorPaymentStatus;
    vendorPaidAmount: number;
    vendorPaymentDate?: Date;
    commissionAmount: number;
    vendorEarning: number;
    bookingStatus: BookingStatus;
    remarks?: string;
    createdAt: Date;
    updatedAt: Date;
    user: User;
    booking?: Booking;
    businessOwner: BusinessOwner;
    get isPaid(): boolean;
    get isVendorPaid(): boolean;
    get isCompleted(): boolean;
    get isCancelled(): boolean;
}
