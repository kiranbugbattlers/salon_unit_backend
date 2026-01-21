import { Repository } from 'typeorm';
import { Booking, BookingRequest, Customer, BusinessOwner, Staff, Service, Payment, CommissionTransaction } from '../../database/entities';
import { AdminBookingQueryDto, AdminBookingRequestQueryDto, AdminBookingDetailDto, AdminBookingRequestDetailDto, ForceCancelBookingDto, ForceCompleteBookingDto, BookingAnalyticsDto, AdminAnalyticsQueryDto, BusinessPerformanceReportQueryDto, BusinessPerformanceReportDataDto } from '../dto/admin-booking.dto';
export declare class AdminBookingService {
    private readonly bookingRepository;
    private readonly bookingRequestRepository;
    private readonly customerRepository;
    private readonly businessOwnerRepository;
    private readonly staffRepository;
    private readonly serviceRepository;
    private readonly paymentRepository;
    private readonly commissionTransactionRepository;
    constructor(bookingRepository: Repository<Booking>, bookingRequestRepository: Repository<BookingRequest>, customerRepository: Repository<Customer>, businessOwnerRepository: Repository<BusinessOwner>, staffRepository: Repository<Staff>, serviceRepository: Repository<Service>, paymentRepository: Repository<Payment>, commissionTransactionRepository: Repository<CommissionTransaction>);
    getAllBookings(query: AdminBookingQueryDto): Promise<{
        bookings: AdminBookingDetailDto[];
        total: number;
    }>;
    getAllBookingRequests(query: AdminBookingRequestQueryDto): Promise<{
        requests: AdminBookingRequestDetailDto[];
        total: number;
    }>;
    getBookingDetails(bookingId: string): Promise<AdminBookingDetailDto>;
    getBookingRequestDetails(bookingRequestId: string): Promise<AdminBookingRequestDetailDto>;
    forceCancelBooking(bookingId: string, adminId: string, cancelDto: ForceCancelBookingDto): Promise<AdminBookingDetailDto>;
    forceCompleteBooking(bookingId: string, adminId: string, completeDto: ForceCompleteBookingDto): Promise<AdminBookingDetailDto>;
    getBookingAnalytics(query: AdminAnalyticsQueryDto): Promise<BookingAnalyticsDto>;
    private transformToAdminBookingDetail;
    private transformToAdminBookingRequestDetail;
    getBusinessPerformanceReport(query: BusinessPerformanceReportQueryDto): Promise<{
        data: BusinessPerformanceReportDataDto;
        total: number;
    }>;
}
