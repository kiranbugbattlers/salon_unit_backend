import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsNumber, IsArray, Min, MaxLength, IsOptional } from 'class-validator';
import { BillingType } from '../../common/enums';

export class CreateSubscriptionPlanDto {
  @ApiProperty({
    description: 'Plan name - should be descriptive and marketing friendly',
    example: 'Premium Business Plan',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Detailed plan description explaining what businesses get',
    example: 'Complete business management suite with unlimited bookings, advanced analytics, priority customer support, and marketing tools.',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Billing type',
    enum: BillingType,
    example: BillingType.MONTHLY,
  })
  @IsNotEmpty()
  @IsEnum(BillingType)
  billingType: BillingType;

  @ApiProperty({
    description: 'Plan price in the specified currency (supports up to 2 decimal places)',
    example: 29.99,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'USD',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiProperty({
    description: 'List of features included in this plan - will be displayed to businesses',
    example: [
      'Unlimited appointment bookings',
      '24/7 priority customer support', 
      'Advanced analytics and reporting',
      'Custom branding options',
      'Multi-location management',
      'Staff scheduling tools'
    ],
    type: [String],
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  features: string[];
}