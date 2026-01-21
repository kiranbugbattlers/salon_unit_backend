import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

export class PaymentOrderDataDto {
  @ApiProperty({
    description: 'Razorpay Order ID',
    example: 'order_MhIkjJHGfdsert',
  })
  orderId: string;

  @ApiProperty({
    description: 'Payment amount in smallest currency unit (paise for INR)',
    example: 50000,
  })
  amount: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'INR',
  })
  currency: string;

  @ApiProperty({
    description: 'Razorpay Key ID for frontend integration',
    example: 'rzp_test_xxxxxxxxxxxxx',
  })
  razorpayKeyId: string;

  @ApiProperty({
    description: 'Booking Request ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  bookingRequestId: string;

  @ApiProperty({
    description: 'Business name',
    example: 'Elite Hair Studio',
  })
  businessName: string;

  @ApiProperty({
    description: 'Service description',
    example: 'Hair Cut - Professional hair cutting service',
  })
  description: string;
}

export class PaymentOrderResponseDto extends ApiResponseDto<PaymentOrderDataDto> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Payment order created successfully' })
  message: string;

  @ApiProperty({ type: PaymentOrderDataDto })
  data: PaymentOrderDataDto;
}
