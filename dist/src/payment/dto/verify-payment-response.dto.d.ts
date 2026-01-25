import { ApiResponseDto } from '../../common/dto/api-response.dto';
export declare class VerifyPaymentDataDto {
    status: string;
    otpCode: string;
    bookingId: string;
    paymentId: string;
    razorpayPaymentId: string;
}
export declare class VerifyPaymentResponseDto extends ApiResponseDto<VerifyPaymentDataDto> {
    code: number;
    success: boolean;
    message: string;
    data: VerifyPaymentDataDto;
}
