import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString, IsOptional, Min } from 'class-validator';

export class CreateCommissionPaymentDto {
  @ApiProperty({
    description: 'Amount to pay towards commission debt',
    example: 500.00,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  @Min(1)
  amount: number;

  @ApiProperty({
    description: 'Optional notes for the payment',
    example: 'Payment for October commission',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CommissionPaymentResponseDto {
  @ApiProperty({
    description: 'Razorpay order ID',
    example: 'order_MHbKuWMR7f8CZo',
  })
  orderId: string;

  @ApiProperty({
    description: 'Amount in paise (INR)',
    example: 50000,
  })
  amount: number;

  @ApiProperty({
    description: 'Currency',
    example: 'INR',
  })
  currency: string;

  @ApiProperty({
    description: 'Razorpay key for frontend',
    example: 'rzp_test_xxxxx',
  })
  razorpayKey: string;

  @ApiProperty({
    description: 'Payment description',
    example: 'Commission payment for Test Salon',
  })
  description: string;

  @ApiProperty({
    description: 'Business owner name',
    example: 'John Doe',
  })
  businessOwnerName: string;

  @ApiProperty({
    description: 'Business owner phone',
    example: '9876543210',
  })
  businessOwnerPhone: string;
}

export class VerifyCommissionPaymentDto {
  @ApiProperty({
    description: 'Razorpay order ID',
    example: 'order_MHbKuWMR7f8CZo',
  })
  @IsString()
  razorpayOrderId: string;

  @ApiProperty({
    description: 'Razorpay payment ID',
    example: 'pay_MHbKuWMR7f8CZo',
  })
  @IsString()
  razorpayPaymentId: string;

  @ApiProperty({
    description: 'Razorpay signature for verification',
    example: 'signature_here',
  })
  @IsString()
  razorpaySignature: string;
}

export class CommissionPaymentVerificationResponseDto {
  @ApiProperty({
    description: 'Payment verification status',
    example: true,
  })
  verified: boolean;

  @ApiProperty({
    description: 'Payment amount',
    example: 500.00,
  })
  amount: number;

  @ApiProperty({
    description: 'New wallet balance after payment',
    example: 0.00,
  })
  newBalance: number;

  @ApiProperty({
    description: 'Is defaulter status removed',
    example: true,
  })
  defaulterStatusRemoved: boolean;

  @ApiProperty({
    description: 'Payment ID for reference',
    example: 'uuid-here',
  })
  paymentId: string;
}
