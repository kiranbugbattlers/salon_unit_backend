export declare class BookingServiceDetailDto {
    id: string;
    bookingId: string;
    businessServiceId: string;
    serviceId: string;
    serviceName: string;
    price: number;
    servicePrice: number;
    durationMinutes: number;
    serviceDuration: number;
    isAddOn: boolean;
    addedAt?: Date;
    addedByStaffId?: string;
    customerApproved: boolean;
    approvedAt?: Date;
    rejectedAt?: Date;
    packageId?: string;
    packageName?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class ServiceSummaryDto {
    originalServicesCount: number;
    addOnServicesCount: number;
    totalServicesCount: number;
    totalDuration: number;
    estimatedEndTime?: string;
}
export declare class BookingDetailsDto {
    totalAmount: number;
    originalAmount: number;
    addOnServicesTotal: number;
    deliveryCharge: number;
    paymentCompleted: boolean;
    allServices: BookingServiceDetailDto[];
    originalServices: BookingServiceDetailDto[];
    addOnServices: BookingServiceDetailDto[];
    pendingAddOnServices: BookingServiceDetailDto[];
    approvedAddOnServices: BookingServiceDetailDto[];
    pendingAddOnServicesTotal: number;
    serviceSummary: ServiceSummaryDto;
}
