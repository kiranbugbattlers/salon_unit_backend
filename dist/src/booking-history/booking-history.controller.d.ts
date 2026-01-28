import { CurrentUserData } from '../common/decorators/current-user.decorator';
import { BookingHistoryService } from './booking-history.service';
import { BookingHistoryDto, BookingHistoryListDto } from './dto/booking-history.dto';
export declare class BookingHistoryController {
    private readonly bookingHistoryService;
    constructor(bookingHistoryService: BookingHistoryService);
    getAllBookings(user: CurrentUserData, query: any): Promise<BookingHistoryListDto>;
    getBookingById(user: CurrentUserData, bookingId: string): Promise<BookingHistoryDto>;
    adminGetAllBookings(query: any): Promise<BookingHistoryListDto>;
    adminGetBookingById(bookingId: string): Promise<BookingHistoryDto>;
    adminGetCustomerBookings(customerId: string, query: any): Promise<BookingHistoryListDto>;
}
