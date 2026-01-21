import { ApiProperty } from '@nestjs/swagger';

export class PaymentInfoDto {
  @ApiProperty({
    description: 'Payment method used',
    enum: ['online', 'cod'],
    example: 'upi',
    nullable: true,
  })
  paymentMethod: string | null;

  @ApiProperty({
    description: 'Payment status',
    enum: ['pending', 'completed', 'not_required'],
    example: 'completed',
  })
  paymentStatus: string;

  @ApiProperty({
    description: 'Payment amount',
    example: 500.00,
  })
  amount: number;

  @ApiProperty({
    description: 'Razorpay payment ID (only for online payments)',
    example: 'pay_xyz123',
    nullable: true,
  })
  razorpayPaymentId?: string | null;

  @ApiProperty({
    description: 'Timestamp when payment was completed (only for online payments)',
    example: '2024-01-15T10:30:00Z',
    nullable: true,
  })
  paymentCompletedAt?: Date | null;
}
