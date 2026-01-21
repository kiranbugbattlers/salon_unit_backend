import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { AddressType } from '../../common/enums';

export class BusinessOwnerOnboardingStep2Dto {
  @ApiProperty({
    description: 'Business/Shop name',
    example: 'Elite Hair Studio',
  })
  @IsNotEmpty()
  @IsString()
  businessName: string;

  @ApiProperty({
    description: 'Business description',
    example: 'Professional hair styling and grooming services with 10+ years of experience',
  })
  @IsNotEmpty()
  @IsString()
  businessDescription: string;

  @ApiProperty({
    description: 'Business latitude coordinate',
    example: 28.7041,
  })
  @IsNotEmpty()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  latitude: number;

  @ApiProperty({
    description: 'Business longitude coordinate',
    example: 77.1025,
  })
  @IsNotEmpty()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  longitude: number;

  @ApiProperty({
    description: 'Complete street address',
    example: '123, MG Road, Near Metro Station',
  })
  @IsNotEmpty()
  @IsString()
  streetAddress: string;

  @ApiProperty({
    description: 'Address line 1 (Building/Shop number)',
    example: 'Shop No. 15, Ground Floor',
    required: false,
  })
  @IsOptional()
  @IsString()
  addressLine1?: string;

  @ApiProperty({
    description: 'Address line 2 (Area/Locality)',
    example: 'Connaught Place',
    required: false,
  })
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @ApiProperty({
    description: 'Nearby landmark',
    example: 'Opposite City Mall',
    required: false,
  })
  @IsOptional()
  @IsString()
  landmark?: string;

  @ApiProperty({
    description: 'City',
    example: 'New Delhi',
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
    description: 'Country',
    example: 'India',
    default: 'India',
  })
  @IsOptional()
  @IsString()
  country?: string;

}