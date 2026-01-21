import { AdminBookingService } from '../services/admin-booking.service';
import { AdminBookingQueryDto, AdminBookingRequestQueryDto, AdminBookingListResponseDto, AdminBookingRequestListResponseDto, AdminBookingResponseDto, AdminBookingRequestResponseDto, ForceCancelBookingDto, ForceCompleteBookingDto } from '../dto/admin-booking.dto';
export declare class AdminBookingController {
    private readonly adminBookingService;
    constructor(adminBookingService: AdminBookingService);
    getAllBookings(query: AdminBookingQueryDto): Promise<AdminBookingListResponseDto>;
    getAllBookingRequests(query: AdminBookingRequestQueryDto): Promise<AdminBookingRequestListResponseDto>;
    getBookingDetails(bookingId: string): Promise<AdminBookingResponseDto>;
    getBookingRequestDetails(bookingRequestId: string): Promise<AdminBookingRequestResponseDto>;
    forceCancelBooking(req: any, bookingId: string, cancelDto: ForceCancelBookingDto): Promise<AdminBookingResponseDto>;
    forceCompleteBooking(req: any, bookingId: string, completeDto: ForceCompleteBookingDto): Promise<AdminBookingResponseDto>;
}
