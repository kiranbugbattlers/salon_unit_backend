import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { Payment } from '../../database/entities/payment.entity';
import { BookingRequest } from '../../database/entities/booking-request.entity';
import { Booking } from '../../database/entities/booking.entity';
export declare class PaymentDetailsDataDto {
    paymentExists: boolean;
    paymentStatus: string;
    bookingRequest: Partial<BookingRequest>;
    payment: Payment | null;
    booking: Booking | null;
}
export declare class PaymentDetailsResponseDto extends ApiResponseDto<PaymentDetailsDataDto> {
    code: number;
    success: boolean;
    message: string;
    data: PaymentDetailsDataDto;
}
