import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class VerifySubscriptionPaymentDto {
  @ApiProperty({
    description: 'Business Subscription ID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsNotEmpty()
  @IsUUID()
  subscriptionId: string;

  @ApiProperty({
    description: 'Razorpay Order ID',
    example: 'order_N1xZ2y3W4V5U6T',
  })
  @IsNotEmpty()
  @IsString()
  razorpayOrderId: string;

  @ApiProperty({
    description: 'Razorpay Payment ID',
    example: 'pay_N1xZ2y3W4V5U6T',
  })
  @IsNotEmpty()
  @IsString()
  razorpayPaymentId: string;

  @ApiProperty({
    description: 'Razorpay Signature for verification',
    example: 'a1b2c3d4e5f6789...',
  })
  @IsNotEmpty()
  @IsString()
  razorpaySignature: string;
}
