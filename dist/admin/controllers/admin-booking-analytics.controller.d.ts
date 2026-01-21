import { AdminBookingService } from '../services/admin-booking.service';
import { AdminAnalyticsQueryDto, BookingAnalyticsResponseDto, BusinessPerformanceReportQueryDto, BusinessPerformanceReportResponseDto } from '../dto/admin-booking.dto';
export declare class AdminBookingAnalyticsController {
    private readonly adminBookingService;
    constructor(adminBookingService: AdminBookingService);
    getBookingAnalytics(query: AdminAnalyticsQueryDto): Promise<BookingAnalyticsResponseDto>;
    getBusinessPerformanceReport(query: BusinessPerformanceReportQueryDto): Promise<BusinessPerformanceReportResponseDto>;
}
