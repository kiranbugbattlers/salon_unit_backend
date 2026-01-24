import { BookingRequestService } from './booking-request.service';
import { BookingService } from './booking.service';
import { AssignStaffDto, ApproveBookingRequestDto, RejectBookingRequestDto, BookingRequestQueryDto, BookingRequestResponseDto, BookingRequestListResponseDto, BusinessOwnerBookingRequestListResponseDto, BusinessOwnerBookingRequestResponseDto, VerifyBookingOtpDto, VerifyArrivalOtpDto, CompleteServiceDto, BookingResponseDto } from './dto';
export declare class BookingRequestController {
    private readonly bookingRequestService;
    private readonly bookingService;
    constructor(bookingRequestService: BookingRequestService, bookingService: BookingService);
    getAuthenticatedCustomerBookingRequests(req: any, query: BookingRequestQueryDto): Promise<BookingRequestListResponseDto>;
    getCustomerBookingRequestById(req: any, id: string): Promise<BookingRequestResponseDto>;
    getBusinessOwnerBookingRequests(req: any, query: BookingRequestQueryDto): Promise<BusinessOwnerBookingRequestListResponseDto>;
    getBusinessOwnerBookingRequestById(req: any, id: string): Promise<BusinessOwnerBookingRequestResponseDto>;
    assignStaff(req: any, bookingRequestId: string, assignStaffDto: AssignStaffDto): Promise<BookingRequestResponseDto>;
    approveBookingRequest(req: any, bookingRequestId: string, approveBookingRequestDto: ApproveBookingRequestDto): Promise<BookingRequestResponseDto>;
    rejectBookingRequest(req: any, bookingRequestId: string, rejectBookingRequestDto: RejectBookingRequestDto): Promise<BookingRequestResponseDto>;
    verifyArrivalOtp(req: any, bookingRequestId: string, verifyOtpDto: VerifyArrivalOtpDto): Promise<BookingRequestResponseDto>;
    cancelBookingRequest(req: any, bookingRequestId: string, cancelDto?: {
        cancellationReason?: string;
    }): Promise<BookingRequestResponseDto>;
    verifyOtpAndStartService(req: any, bookingId: string, verifyOtpDto: VerifyBookingOtpDto): Promise<BookingResponseDto>;
    completeService(req: any, bookingId: string, completeServiceDto: CompleteServiceDto): Promise<BookingResponseDto>;
}
