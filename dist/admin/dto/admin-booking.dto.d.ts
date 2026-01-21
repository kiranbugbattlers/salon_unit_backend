import { BookingStatus, ServiceLocation } from '../../common/enums';
import { BookingRequestStatus } from '../../database/entities';
export declare class AdminBookingQueryDto {
    status?: BookingStatus;
    businessOwnerId?: string;
    customerId?: string;
    staffId?: string;
    dateFrom?: string;
    dateTo?: string;
    serviceLocation?: ServiceLocation;
    page?: number;
    limit?: number;
}
export declare class AdminBookingRequestQueryDto {
    status?: BookingRequestStatus;
    businessOwnerId?: string;
    customerId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
}
export declare class ForceCancelBookingDto {
    reason: string;
    refundRequired?: boolean;
    notifyCustomer?: boolean;
    notifyBusinessOwner?: boolean;
}
export declare class ForceCompleteBookingDto {
    reason: string;
    notes?: string;
    calculateCommission?: boolean;
}
export declare class AdminCustomerInfoDto {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    profilePic?: string;
}
export declare class AdminBusinessInfoDto {
    id: string;
    shopId: string;
    businessName: string;
    address: string;
    phone: string;
    email?: string;
}
export declare class AdminStaffInfoDto {
    id: string;
    firstName: string;
    lastName: string;
    profilePic?: string;
    phone?: string;
}
export declare class AdminServiceInfoDto {
    id: string;
    name: string;
    description: string;
    basePrice: number;
    defaultDuration: number;
}
export declare class AdminBookingServiceInfoDto {
    id: string;
    serviceName: string;
    servicePrice: number;
    serviceDuration: number;
    isAddOn: boolean;
    addedAt?: Date;
}
export declare class AdminPaymentInfoDto {
    paymentId?: string;
    paymentMethod?: string;
    paymentStatus?: string;
    amount?: number;
    razorpayPaymentId?: string;
    razorpayOrderId?: string;
    paymentCompletedAt?: Date;
}
export declare class AdminCommissionInfoDto {
    commissionTransactionId?: string;
    businessOwnerCommission?: number;
    customerReward?: number;
    commissionPercent?: number;
    rewardPercent?: number;
}
export declare class AdminBookingDetailDto {
    id: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    status: BookingStatus;
    serviceLocation: ServiceLocation;
    totalAmount: number;
    deliveryCharge?: number;
    deliveryDistance?: number;
    addOnServicesTotal?: number;
    paymentCompleted?: boolean;
    specialRequests?: string;
    otpCode: string;
    otpVerifiedAt?: Date;
    serviceStartedAt?: Date;
    serviceCompletedAt?: Date;
    cancellationReason?: string;
    cancelledAt?: Date;
    bookingRequestId?: string;
    createdAt: Date;
    updatedAt: Date;
    customer: AdminCustomerInfoDto;
    business: AdminBusinessInfoDto;
    staff: AdminStaffInfoDto;
    service: AdminServiceInfoDto;
    bookingServices?: AdminBookingServiceInfoDto[];
    paymentInfo?: AdminPaymentInfoDto;
    commissionInfo?: AdminCommissionInfoDto;
}
export declare class AdminBookingRequestDetailDto {
    id: string;
    requestedDate: string;
    requestedStartTime: string;
    requestedEndTime: string;
    status: BookingRequestStatus;
    totalEstimatedPrice: number;
    totalEstimatedDuration: number;
    approvedStartTime?: string;
    approvedEndTime?: string;
    finalPrice?: number;
    arrivalOtp?: string;
    arrivalOtpGeneratedAt?: Date;
    arrivalOtpVerifiedAt?: Date;
    rejectionReason?: string;
    businessNotes?: string;
    createdAt: Date;
    updatedAt: Date;
    customer: AdminCustomerInfoDto;
    business: AdminBusinessInfoDto;
    requestedStaff?: AdminStaffInfoDto;
    assignedStaff?: AdminStaffInfoDto;
    services: any[];
    confirmedBookingId?: string;
    paymentInfo?: AdminPaymentInfoDto;
}
export declare class AdminBookingListResponseDto {
    code: number;
    success: boolean;
    message: string;
    data: AdminBookingDetailDto[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
export declare class AdminBookingRequestListResponseDto {
    code: number;
    success: boolean;
    message: string;
    data: AdminBookingRequestDetailDto[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
export declare class AdminBookingResponseDto {
    code: number;
    success: boolean;
    message: string;
    data: AdminBookingDetailDto;
}
export declare class AdminBookingRequestResponseDto {
    code: number;
    success: boolean;
    message: string;
    data: AdminBookingRequestDetailDto;
}
export declare class BookingAnalyticsDto {
    totalBookings: number;
    byStatus: {
        pending: number;
        confirmed: number;
        inProgress: number;
        completed: number;
        cancelled: number;
    };
    byPaymentMethod: {
        online: number;
        cod: number;
    };
    averageBookingValue: number;
    totalRevenue: number;
    totalCommission: number;
    completionRate: number;
    cancellationRate: number;
    topBusinesses: Array<{
        businessId: string;
        businessName: string;
        bookingCount: number;
        totalRevenue: number;
    }>;
    topCustomers: Array<{
        customerId: string;
        customerName: string;
        bookingCount: number;
        totalSpent: number;
    }>;
    bookingsByDay: Record<string, number>;
    revenueByDay: Record<string, number>;
}
export declare class BookingAnalyticsResponseDto {
    code: number;
    success: boolean;
    message: string;
    data: BookingAnalyticsDto;
}
export declare class AdminAnalyticsQueryDto {
    dateFrom?: string;
    dateTo?: string;
    businessOwnerId?: string;
}
export declare class BusinessPerformanceReportQueryDto {
    reportType: 'daily' | 'monthly';
    dateFrom: string;
    dateTo: string;
    shopId?: string;
    sortBy?: 'revenue' | 'bookings' | 'commission' | 'businessName';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}
export declare class BusinessPerformanceMetricsDto {
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    totalRevenue: number;
    totalCommission: number;
    averageBookingValue: number;
    completionRate: number;
    cancellationRate: number;
}
export declare class BusinessContactDto {
    email?: string;
    phone?: string;
}
export declare class BusinessPerformanceDto {
    businessId: string;
    shopId: string;
    businessName: string;
    period: string;
    metrics: BusinessPerformanceMetricsDto;
    contact: BusinessContactDto;
}
export declare class BusinessReportSummaryDto {
    totalBusinesses: number;
    totalBookings: number;
    totalRevenue: number;
    totalCommission: number;
    averageRevenuePerBusiness: number;
}
export declare class BusinessPerformanceReportDataDto {
    reportType: 'daily' | 'monthly';
    period: {
        dateFrom: string;
        dateTo: string;
    };
    summary: BusinessReportSummaryDto;
    businesses: BusinessPerformanceDto[];
}
export declare class BusinessPerformanceReportResponseDto {
    code: number;
    success: boolean;
    message: string;
    data: BusinessPerformanceReportDataDto;
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
