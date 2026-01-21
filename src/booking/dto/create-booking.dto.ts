import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsDateString,
  IsString,
  IsOptional,
  Matches,
  IsNotEmpty,
  IsArray,
  IsEnum,
  MaxLength,
  ValidateNested,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ServiceLocation } from '../../common/enums';
import { CustomerAddressDto } from './customer-address.dto';

export class CreateBookingDto {
  @ApiProperty({
    description: 'Business Owner ID where services will be provided',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  businessOwnerId: string;

  @ApiProperty({
    description: 'Requested appointment date (YYYY-MM-DD)',
    example: '2024-01-15',
  })
  @IsDateString()
  @IsNotEmpty()
  requestedDate: string;

  @ApiProperty({
    description: 'Requested start time in HH:MM format (24-hour)',
    example: '10:30',
  })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Start time must be in HH:MM format',
  })
  @IsNotEmpty()
  requestedStartTime: string;

  @ApiProperty({
    description: 'Requested end time in HH:MM format (24-hour)',
    example: '13:00',
  })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'End time must be in HH:MM format',
  })
  @IsNotEmpty()
  requestedEndTime: string;

  @ApiProperty({
    description: 'Optional preferred staff member ID',
    example: '456e7890-e12b-34c5-d678-901234567890',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  requestedStaffId?: string;

  @ApiProperty({
    description: 'List of business service IDs to book (can combine with service packages)',
    type: [String],
    required: false,
    example: ['123e4567-e89b-12d3-a456-426614174000'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  businessServiceIds?: string[];

  @ApiProperty({
    description: 'List of service package IDs to book (can combine with individual services)',
    type: [String],
    required: false,
    example: ['789e0123-e45f-67g8-h901-234567890123'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  servicePackageIds?: string[];

  @ApiProperty({
    description: 'Service location preference - where the service will be performed',
    enum: ServiceLocation,
    required: false,
    example: ServiceLocation.IN_SALON,
  })
  @IsOptional()
  @IsEnum(ServiceLocation, {
    message: 'Service location must be either "in-salon" or "at-home"',
  })
  serviceLocation?: ServiceLocation;

  @ApiProperty({
    description: 'Special requests or notes from customer',
    required: false,
    example: 'Please be gentle, I have sensitive skin',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, {
    message: 'Special requests cannot exceed 500 characters',
  })
  specialRequests?: string;

  @ApiProperty({
    description: 'Customer address (required if serviceLocation is at-home). Includes lat/long for delivery charge calculation.',
    required: false,
    type: CustomerAddressDto,
  })
  @IsOptional()
  @ValidateIf((o) => o.serviceLocation === ServiceLocation.AT_HOME)
  @ValidateNested()
  @Type(() => CustomerAddressDto)
  customerAddress?: CustomerAddressDto;
}
