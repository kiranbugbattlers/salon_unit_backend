import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, Min, Max, IsNotEmpty, IsArray, IsOptional } from 'class-validator';

export class PreviewDeliveryChargeDto {
  @ApiProperty({
    description: 'Business Owner ID to get delivery settings from',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  businessOwnerId: string;

  @ApiProperty({
    description: 'Customer latitude for distance calculation',
    example: 19.0760,
    minimum: -90,
    maximum: 90,
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  @IsNotEmpty()
  customerLatitude: number;

  @ApiProperty({
    description: 'Customer longitude for distance calculation',
    example: 72.8777,
    minimum: -180,
    maximum: 180,
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  @IsNotEmpty()
  customerLongitude: number;

  @ApiProperty({
    description: 'List of business service IDs to calculate order amount',
    type: [String],
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  businessServiceIds?: string[];

  @ApiProperty({
    description: 'List of service package IDs to calculate order amount',
    type: [String],
    example: ['789e0123-e45f-67g8-h901-234567890123'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  servicePackageIds?: string[];
}

export class DeliveryChargePreviewResponseDto {
  @ApiProperty({
    description: 'Distance from business to customer in kilometers',
    example: 8.5,
  })
  distanceKm: number;

  @ApiProperty({
    description: 'Base delivery charge (fixed amount)',
    example: 0,
  })
  baseCharge: number;

  @ApiProperty({
    description: 'Distance-based charge',
    example: 35.0,
  })
  distanceCharge: number;

  @ApiProperty({
    description: 'Total delivery charge',
    example: 35.0,
  })
  totalDeliveryCharge: number;

  @ApiProperty({
    description: 'Whether delivery is free',
    example: false,
  })
  isFreeDelivery: boolean;

  @ApiProperty({
    description: 'Reason for free delivery (if applicable)',
    example: 'Order amount ≥ ₹1000',
    required: false,
  })
  freeDeliveryReason?: string;

  @ApiProperty({
    description: 'Detailed breakdown of charges',
    example: 'Distance: 8.50 km\nChargeable distance: 3.50 km (after 5 km free)\nDistance charge: 3.50 km × ₹10/km = ₹35.00\nTotal delivery charge: ₹35.00',
  })
  breakdown: string;

  @ApiProperty({
    description: 'Estimated order amount (services total)',
    example: 1200.0,
  })
  estimatedOrderAmount: number;

  @ApiProperty({
    description: 'Final total including delivery',
    example: 1235.0,
  })
  finalTotal: number;
}
