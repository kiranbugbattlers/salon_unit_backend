import { CurrentUserData } from '../common/decorators/current-user.decorator';
import { BookingService } from './booking.service';
import { CreateBookingDto, UpdateBookingDto, BookingResponseDto, BookingListResponseDto, BookingQueryDto, AddServicesDto, PreviewDeliveryChargeDto } from './dto';
import { CustomerTransactionHistoryResponseDto } from './dto/customer-transaction-history.dto';
import { CustomerAddServicesDto } from './dto/customer-add-services.dto';
import { ApproveAddonResponseDto } from './dto/approve-addon-response.dto';
import { RejectAddonResponseDto } from './dto/reject-addon-response.dto';
export declare class BookingController {
    private readonly bookingService;
    constructor(bookingService: BookingService);
    createBooking(user: CurrentUserData, createBookingDto: CreateBookingDto): Promise<any>;
    previewDeliveryCharge(previewDto: PreviewDeliveryChargeDto): Promise<any>;
    addServices(user: CurrentUserData, bookingId: string, addServicesDto: AddServicesDto): Promise<BookingResponseDto>;
    customerAddServices(user: CurrentUserData, bookingId: string, customerAddServicesDto: CustomerAddServicesDto): Promise<BookingResponseDto>;
    getCustomerBookings(customerId: string, query: BookingQueryDto): Promise<BookingListResponseDto>;
    updateBooking(user: CurrentUserData, bookingId: string, updateBookingDto: UpdateBookingDto): Promise<BookingResponseDto>;
    cancelBooking(user: CurrentUserData, bookingId: string): Promise<BookingResponseDto>;
    approveAddOnService(user: CurrentUserData, bookingId: string, serviceId: string): Promise<ApproveAddonResponseDto>;
    rejectAddOnService(user: CurrentUserData, bookingId: string, serviceId: string): Promise<RejectAddonResponseDto>;
    getCustomerTransactionHistory(user: CurrentUserData, customerId?: string, startDate?: string, endDate?: string): Promise<CustomerTransactionHistoryResponseDto>;
}
