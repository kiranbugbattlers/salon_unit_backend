import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateDeliverySettingsDto {
  @ApiProperty({
    description: 'Enable/disable delivery charges for at-home services',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  deliveryChargesEnabled?: boolean;

  @ApiProperty({
    description: 'Base delivery charge (fixed amount)',
    example: 50,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  baseDeliveryCharge?: number;

  @ApiProperty({
    description: 'Charge per kilometer for distance-based pricing',
    example: 10,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  perKmCharge?: number;

  @ApiProperty({
    description: 'Free delivery up to this distance (in km)',
    example: 5,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  freeDeliveryUptoKm?: number;

  @ApiProperty({
    description: 'Maximum delivery distance allowed (in km)',
    example: 20,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDeliveryDistanceKm?: number;

  @ApiProperty({
    description: 'Minimum order amount for free delivery',
    example: 1000,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  freeDeliveryAboveAmount?: number;
}
