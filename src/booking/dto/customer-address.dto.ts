import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CustomerAddressDto {
  @ApiProperty({ description: 'Street address', example: '123 Main Street, Apt 4B' })
  @IsString()
  streetAddress: string;

  @ApiProperty({ description: 'City', example: 'Mumbai' })
  @IsString()
  city: string;

  @ApiProperty({ description: 'State', example: 'Maharashtra' })
  @IsString()
  state: string;

  @ApiProperty({ description: 'Postal code', example: '400001' })
  @IsString()
  postalCode: string;

  @ApiProperty({
    description: 'Latitude for delivery charge calculation',
    example: 19.0760,
    minimum: -90,
    maximum: 90
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({
    description: 'Longitude for delivery charge calculation',
    example: 72.8777,
    minimum: -180,
    maximum: 180
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiProperty({ description: 'Nearby landmark', example: 'Near City Mall', required: false })
  @IsOptional()
  @IsString()
  landmark?: string;
}
