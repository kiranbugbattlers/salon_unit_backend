import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { AddressType } from '../../common/enums';

export class OnboardingStep2Dto {
  @ApiProperty({
    description: 'Latitude',
    example: 28.6139,
  })
  @IsNotEmpty()
  @IsNumber()
  latitude: number;

  @ApiProperty({
    description: 'Longitude', 
    example: 77.2090,
  })
  @IsNotEmpty()
  @IsNumber()
  longitude: number;

  @ApiProperty({
    description: 'Street address',
    example: '123 Main Street',
  })
  @IsNotEmpty()
  @IsString()
  streetAddress: string;

  @ApiProperty({
    description: 'Address line 1 (optional)',
    example: 'Apartment 4B',
    required: false,
  })
  @IsOptional()
  @IsString()
  addressLine1?: string;

  @ApiProperty({
    description: 'Address line 2 (optional)',
    example: 'Near Park',
    required: false,
  })
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @ApiProperty({
    description: 'Landmark (optional)',
    example: 'Next to Coffee Shop',
    required: false,
  })
  @IsOptional()
  @IsString()
  landmark?: string;

  @ApiProperty({
    description: 'City',
    example: 'Delhi',
  })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({
    description: 'State',
    example: 'Delhi',
  })
  @IsNotEmpty()
  @IsString()
  state: string;

  @ApiProperty({
    description: 'Postal code',
    example: '110001',
  })
  @IsNotEmpty()
  @IsString()
  postalCode: string;

  @ApiProperty({
    description: 'Address type',
    enum: AddressType,
    example: AddressType.HOME,
  })
  @IsOptional()
  @IsEnum(AddressType)
  addressType?: AddressType = AddressType.HOME;
}