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
export declare enum PaymentMethod {
    CASH = "cash",
    ONLINE = "online",
    UPI = "upi",
    CARD = "card",
    BANK_TRANSFER = "bank_transfer"
}
export declare class UserBookingHistoryItemDto {
    id: string;
    userId: string;
    userName: string;
    userMobile: string;
    bookingId?: string;
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
    paymentDetails?: {
        paymentId?: string;
        razorpayOrderId?: string;
        razorpayPaymentId?: string;
        paymentMethod?: string;
        cardNetwork?: string;
        bankName?: string;
        walletName?: string;
        vpa?: string;
        refundId?: string;
        refundAmount?: number;
        refundStatus?: string;
        refundReason?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
export declare class DayWiseUserBookingHistoryDto {
    date: Date;
    bookings: UserBookingHistoryItemDto[];
    totalBookingAmount: number;
    totalCommissionAmount: number;
    totalVendorEarning: number;
    totalPaidBookings: number;
    totalCompletedBookings: number;
    bookingCount: number;
}
export declare class UserBookingHistoryResponseDto {
    businessOwnerId: string;
    businessOwnerName: string;
    shopId: string;
    businessName?: string;
    dayWiseHistory: DayWiseUserBookingHistoryDto[];
    totalBookingAmount: number;
    totalCommissionAmount: number;
    totalVendorEarning: number;
    totalBookings: number;
    totalPaidBookings: number;
    totalCompletedBookings: number;
    filters: {
        startDate?: Date;
        endDate?: Date;
        paymentStatus?: BookingPaymentStatus;
        vendorPaymentStatus?: VendorPaymentStatus;
        bookingStatus?: BookingStatus;
        paymentMethod?: PaymentMethod;
    };
}
