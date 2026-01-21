import { ApiProperty } from '@nestjs/swagger';
import { BusinessSubscriptionResponseDto } from './subscription-response.dto';

export class SubscriptionPaymentOrderDataDto {
  @ApiProperty({ description: 'Razorpay Order ID' })
  orderId: string;

  @ApiProperty({ description: 'Amount in paise (smallest currency unit)' })
  amount: number;

  @ApiProperty({ description: 'Currency code' })
  currency: string;

  @ApiProperty({ description: 'Razorpay Key ID for Flutter SDK' })
  razorpayKeyId: string;

  @ApiProperty({ description: 'Business Subscription ID' })
  subscriptionId: string;

  @ApiProperty({ description: 'Subscription Plan Name' })
  planName: string;

  @ApiProperty({ description: 'Description of subscription features' })
  description: string;
}

export class SubscriptionPaymentOrderResponseDto {
  @ApiProperty()
  code: number;

  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: SubscriptionPaymentOrderDataDto })
  data: SubscriptionPaymentOrderDataDto;
}

export class VerifySubscriptionPaymentDataDto {
  @ApiProperty({ description: 'Payment verification status' })
  status: string;

  @ApiProperty({ description: 'Business Subscription ID' })
  subscriptionId: string;

  @ApiProperty({ description: 'Razorpay Payment ID' })
  razorpayPaymentId: string;

  @ApiProperty({ description: 'Subscription details', type: BusinessSubscriptionResponseDto })
  subscription: BusinessSubscriptionResponseDto;
}

export class VerifySubscriptionPaymentResponseDto {
  @ApiProperty()
  code: number;

  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: VerifySubscriptionPaymentDataDto })
  data: VerifySubscriptionPaymentDataDto;
}

export class SubscriptionPaymentStatusDataDto {
  @ApiProperty({ description: 'Business Subscription ID' })
  subscriptionId: string;

  @ApiProperty({ description: 'Current payment status' })
  status: string;

  @ApiProperty({ description: 'Razorpay Order ID if exists' })
  razorpayOrderId?: string;

  @ApiProperty({ description: 'Can retry payment' })
  canRetry: boolean;

  @ApiProperty({ description: 'Subscription plan name' })
  planName: string;

  @ApiProperty({ description: 'Amount to pay' })
  amount: number;

  @ApiProperty({ description: 'Currency' })
  currency: string;
}

export class SubscriptionPaymentStatusResponseDto {
  @ApiProperty()
  code: number;

  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: SubscriptionPaymentStatusDataDto })
  data: SubscriptionPaymentStatusDataDto;
}
