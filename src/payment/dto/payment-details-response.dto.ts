import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { Payment } from '../../database/entities/payment.entity';
import { BookingRequest } from '../../database/entities/booking-request.entity';
import { Booking } from '../../database/entities/booking.entity';

export class PaymentDetailsDataDto {
  @ApiProperty({
    description: 'Whether a payment record exists for this booking request',
    example: true,
  })
  paymentExists: boolean;

  @ApiProperty({
    description: 'Current payment status',
    example: 'CREATED',
    enum: ['NOT_CREATED', 'CREATED', 'SUCCESS', 'FAILED'],
  })
  paymentStatus: string;

  @ApiProperty({
    description: 'Booking request details',
  })
  bookingRequest: Partial<BookingRequest>;

  @ApiProperty({
    description: 'Payment details (null if no payment record exists)',
    nullable: true,
    type: () => Payment,
  })
  payment: Payment | null;

  @ApiProperty({
    description: 'Confirmed booking details (null if not confirmed yet)',
    nullable: true,
    type: () => Booking,
  })
  booking: Booking | null;
}

export class PaymentDetailsResponseDto extends ApiResponseDto<PaymentDetailsDataDto> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
    example: 'Payment details retrieved successfully',
    description: 'Response message indicating the result'
  })
  message: string;

  @ApiProperty({ type: PaymentDetailsDataDto })
  data: PaymentDetailsDataDto;
}