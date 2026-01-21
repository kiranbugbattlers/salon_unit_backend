import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

export class VerifyPaymentDataDto {
  @ApiProperty({
    description: 'Payment verification status',
    example: 'confirmed',
  })
  status: string;

  @ApiProperty({
    description: 'OTP code for booking verification',
    example: '123456',
  })
  otpCode: string;

  @ApiProperty({
    description: 'Confirmed Booking ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  bookingId: string;

  @ApiProperty({
    description: 'Payment ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  paymentId: string;

  @ApiProperty({
    description: 'Razorpay Payment ID',
    example: 'pay_MhIkjJHGfdsert',
  })
  razorpayPaymentId: string;
}

export class VerifyPaymentResponseDto extends ApiResponseDto<VerifyPaymentDataDto> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Payment verified successfully. Booking confirmed.' })
  message: string;

  @ApiProperty({ type: VerifyPaymentDataDto })
  data: VerifyPaymentDataDto;
}
