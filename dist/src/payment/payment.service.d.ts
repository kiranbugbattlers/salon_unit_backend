import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Payment, BookingRequest, Booking } from '../database/entities';
import { CreatePaymentOrderDto, VerifyPaymentDto, PaymentOrderResponseDto, VerifyPaymentResponseDto, PaymentDetailsDataDto, ConfirmCodBookingDto } from './dto';
import { NotificationService } from '../notification/notification.service';
export declare class PaymentService {
    private readonly paymentRepository;
    private readonly bookingRequestRepository;
    private readonly bookingRepository;
    private readonly configService;
    private readonly notificationService;
    private razorpay;
    constructor(paymentRepository: Repository<Payment>, bookingRequestRepository: Repository<BookingRequest>, bookingRepository: Repository<Booking>, configService: ConfigService, notificationService: NotificationService);
    createPaymentOrder(customerId: string, createDto: CreatePaymentOrderDto): Promise<PaymentOrderResponseDto>;
    verifyPayment(customerId: string, verifyDto: VerifyPaymentDto): Promise<VerifyPaymentResponseDto>;
    confirmCodBooking(customerId: string, confirmDto: ConfirmCodBookingDto): Promise<VerifyPaymentResponseDto>;
    getPaymentByBookingRequest(bookingRequestId: string): Promise<PaymentDetailsDataDto>;
    private verifyRazorpaySignature;
    private generateOTP;
}
