import { Repository } from 'typeorm';
import { Booking } from '../database/entities/booking.entity';
import { Payment } from '../database/entities/payment.entity';
import { BookingHistoryDto, BookingHistoryListDto, BookingHistoryQueryDto } from './dto/booking-history.dto';
import { Customer } from '../database/entities/customer.entity';
export declare class BookingHistoryService {
    private readonly bookingRepository;
    private readonly paymentRepository;
    private readonly customerRepository;
    constructor(bookingRepository: Repository<Booking>, paymentRepository: Repository<Payment>, customerRepository: Repository<Customer>);
    findAll(customerId: string, query: BookingHistoryQueryDto): Promise<BookingHistoryListDto>;
    findOne(customerId: string, bookingId: string): Promise<BookingHistoryDto>;
    private transformToDto;
}
