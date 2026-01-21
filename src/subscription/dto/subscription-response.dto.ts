import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionStatus, BillingType } from '../../common/enums';

export class SubscriptionPlanResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: BillingType })
  billingType: BillingType;

  @ApiProperty()
  price: number;

  @ApiProperty()
  currency: string;

  @ApiProperty({ type: [String] })
  features: string[];

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  formattedPrice: string;

  @ApiProperty()
  isRecurring: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class BusinessSubscriptionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  businessOwnerId: string;

  @ApiProperty({ enum: SubscriptionStatus })
  status: SubscriptionStatus;

  @ApiProperty()
  startedAt: Date;

  @ApiProperty({ required: false })
  expiresAt?: Date;

  @ApiProperty()
  autoRenew: boolean;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  isExpired: boolean;

  @ApiProperty({ required: false })
  daysUntilExpiry?: number;

  @ApiProperty()
  isNearExpiry: boolean;

  @ApiProperty({ type: SubscriptionPlanResponseDto })
  subscriptionPlan: SubscriptionPlanResponseDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class SubscriptionListResponseDto {
  @ApiProperty({ type: [SubscriptionPlanResponseDto] })
  plans: SubscriptionPlanResponseDto[];

  @ApiProperty()
  total: number;
}

export class BusinessSubscriptionListResponseDto {
  @ApiProperty({ type: [BusinessSubscriptionResponseDto] })
  subscriptions: BusinessSubscriptionResponseDto[];

  @ApiProperty()
  total: number;
}