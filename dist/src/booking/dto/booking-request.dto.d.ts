import { BookingRequestStatus } from '../../database/entities/booking-request.entity';
import { ServiceLocation } from '../../common/enums';
export declare class BookingRequestServiceDto {
    businessServiceId: string;
}
export declare class CreateBookingRequestDto {
    businessOwnerId: string;
    requestedDate: string;
    requestedStartTime: string;
    requestedEndTime: string;
    requestedStaffId?: string;
    businessServiceIds?: string[];
    servicePackageIds?: string[];
    serviceLocation?: ServiceLocation;
}
export declare class AssignStaffDto {
    staffId: string;
    adjustedStartTime?: string;
    adjustedEndTime?: string;
}
export declare class ApproveBookingRequestDto {
    finalPrice?: number;
    businessNotes?: string;
}
export declare class RejectBookingRequestDto {
    rejectionReason: string;
}
export declare class BookingRequestQueryDto {
    status?: BookingRequestStatus;
    serviceLocation?: ServiceLocation;
    page?: number;
    limit?: number;
    staffId?: string;
}
