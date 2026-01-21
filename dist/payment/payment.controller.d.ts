import { PaymentService } from './payment.service';
import { CreatePaymentOrderDto, VerifyPaymentDto, PaymentOrderResponseDto, VerifyPaymentResponseDto, PaymentDetailsResponseDto, ConfirmCodBookingDto } from './dto';
export declare class PaymentController {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    createPaymentOrder(req: any, createDto: CreatePaymentOrderDto): Promise<PaymentOrderResponseDto>;
    verifyPayment(req: any, verifyDto: VerifyPaymentDto): Promise<VerifyPaymentResponseDto>;
    confirmCodBooking(req: any, confirmDto: ConfirmCodBookingDto): Promise<VerifyPaymentResponseDto>;
    getPaymentByBookingRequest(bookingRequestId: string): Promise<PaymentDetailsResponseDto>;
}
