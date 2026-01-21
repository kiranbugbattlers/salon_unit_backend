import { BookingRequestStatus } from '../../database/entities/booking-request.entity';
import { ServiceLocation, BookingStatus } from '../../common/enums';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { PaymentInfoDto } from './payment-info.dto';
import { BookingDetailsDto } from './booking-details.dto';
import { CustomerAddressDto } from './customer-address.dto';
export declare class BusinessServiceDetailDto {
    id: string;
    customPrice: number;
    customDurationMinutes: number;
    service: {
        id: string;
        name: string;
        description: string;
    };
}
export declare class BookingRequestServiceDetailDto {
    id: string;
    quantity: number;
    estimatedPrice: number;
    estimatedDuration: number;
    businessService: BusinessServiceDetailDto;
}
export declare class CustomerDetailDto {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}
export declare class BusinessDetailDto {
    id: string;
    shopId: string;
    businessName: string;
    address: string;
}
export declare class StaffDetailDto {
    id: string;
    firstName: string;
    lastName: string;
}
export declare class BookingRequestDetailDto {
    id: string;
    requestedDate: string;
    requestedStartTime: string;
    requestedEndTime: string;
    status: BookingRequestStatus;
    serviceLocation?: ServiceLocation;
    totalEstimatedPrice: number;
    totalEstimatedDuration: number;
    rejectionReason?: string;
    businessNotes?: string;
    approvedStartTime?: string;
    approvedEndTime?: string;
    finalPrice?: number;
    createdAt: Date;
    updatedAt: Date;
    customer: CustomerDetailDto;
    business: BusinessDetailDto;
    requestedStaff?: StaffDetailDto;
    assignedStaff?: StaffDetailDto;
    services: BookingRequestServiceDetailDto[];
    confirmedBookingId?: string;
    otpCode?: string;
    arrivalOtp?: string;
    lifecycleState: BookingRequestStatus;
    isStaffAssigned: boolean;
    isApproved: boolean;
    isPaymentPending: boolean;
    isPaymentCompleted: boolean;
    isConfirmed: boolean;
    canCancel: boolean;
    canPay: boolean;
    requiresAction: boolean;
    bookingStatus?: BookingStatus;
    otpVerifiedAt?: Date;
    serviceStartedAt?: Date;
    serviceCompletedAt?: Date;
    paymentInfo?: PaymentInfoDto | null;
    bookingDetails?: BookingDetailsDto | null;
    customerAddress?: CustomerAddressDto;
    deliveryCharge: number;
    deliveryDistance?: number;
}
export declare class BookingRequestResponseDto extends ApiResponseDto<BookingRequestDetailDto> {
    code: number;
    success: boolean;
    message: string;
    data: BookingRequestDetailDto;
}
export declare class BookingRequestListResponseDto extends ApiResponseDto<BookingRequestDetailDto[]> {
    code: number;
    success: boolean;
    message: string;
    data: BookingRequestDetailDto[];
    meta?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
export declare class BusinessOwnerBookingRequestDetailDto {
    id: string;
    requestedDate: string;
    requestedStartTime: string;
    requestedEndTime: string;
    status: BookingRequestStatus;
    serviceLocation?: ServiceLocation;
    totalEstimatedPrice: number;
    totalEstimatedDuration: number;
    rejectionReason?: string;
    businessNotes?: string;
    approvedStartTime?: string;
    approvedEndTime?: string;
    finalPrice?: number;
    createdAt: Date;
    updatedAt: Date;
    customer: CustomerDetailDto;
    business: BusinessDetailDto;
    requestedStaff?: StaffDetailDto;
    assignedStaff?: StaffDetailDto;
    services: BookingRequestServiceDetailDto[];
    confirmedBookingId?: string;
    lifecycleState: BookingRequestStatus;
    isStaffAssigned: boolean;
    isApproved: boolean;
    isPaymentPending: boolean;
    isPaymentCompleted: boolean;
    isConfirmed: boolean;
    canCancel: boolean;
    canPay: boolean;
    requiresAction: boolean;
    bookingStatus?: BookingStatus;
    otpVerifiedAt?: Date;
    serviceStartedAt?: Date;
    serviceCompletedAt?: Date;
    paymentInfo?: PaymentInfoDto | null;
    bookingDetails?: BookingDetailsDto | null;
    customerAddress?: CustomerAddressDto;
    deliveryCharge: number;
    deliveryDistance?: number;
}
export declare class BusinessOwnerBookingRequestResponseDto extends ApiResponseDto<BusinessOwnerBookingRequestDetailDto> {
    code: number;
    success: boolean;
    message: string;
    data: BusinessOwnerBookingRequestDetailDto;
}
export declare class BusinessOwnerBookingRequestListResponseDto extends ApiResponseDto<BusinessOwnerBookingRequestDetailDto[]> {
    code: number;
    success: boolean;
    message: string;
    data: BusinessOwnerBookingRequestDetailDto[];
    meta?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
