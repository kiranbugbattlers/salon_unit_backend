import { ApiResponseDto } from '../../common/dto/api-response.dto';
export declare class PaymentOrderDataDto {
    orderId: string;
    amount: number;
    currency: string;
    razorpayKeyId: string;
    bookingRequestId: string;
    businessName: string;
    description: string;
}
export declare class PaymentOrderResponseDto extends ApiResponseDto<PaymentOrderDataDto> {
    code: number;
    success: boolean;
    message: string;
    data: PaymentOrderDataDto;
}
