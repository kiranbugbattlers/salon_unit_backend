import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsUUID,
  IsDateString,
  IsString,
  IsNotEmpty,
  Matches,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsInt,
  Min,
  IsOptional,
  IsEnum,
  IsNumber
} from 'class-validator';
import { BookingRequestStatus } from '../../database/entities/booking-request.entity';
import { ServiceLocation } from '../../common/enums';

export class BookingRequestServiceDto {
  @ApiProperty({
    description: 'Business Service ID (from business-owner/services endpoint)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  businessServiceId: string;
}

export class CreateBookingRequestDto {
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
    example: '10:00',
  })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Start time must be in HH:MM format',
  })
  @IsNotEmpty()
  requestedStartTime: string;

  @ApiProperty({
    description: 'Requested end time in HH:MM format (24-hour)',
    example: '12:00',
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
    example: ['123e4567-e89b-12d3-a456-426614174000', '456e7890-e12b-34c5-d678-901234567890'],
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
    description: 'Service location preference - where the service will be provided',
    enum: ServiceLocation,
    example: ServiceLocation.IN_SALON,
    required: false,
    default: ServiceLocation.IN_SALON,
  })
  @IsOptional()
  @IsEnum(ServiceLocation)
  serviceLocation?: ServiceLocation;
}

export class AssignStaffDto {
  @ApiProperty({
    description: 'Staff member ID to assign to this booking request',
    example: '789e0123-e45f-67g8-h901-234567890123',
  })
  @IsUUID()
  @IsNotEmpty()
  staffId: string;

  @ApiProperty({
    description: 'Adjusted start time (optional)',
    example: '10:30',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Start time must be in HH:MM format',
  })
  adjustedStartTime?: string;

  @ApiProperty({
    description: 'Adjusted end time (optional)',
    example: '12:30',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'End time must be in HH:MM format',
  })
  adjustedEndTime?: string;
}

export class ApproveBookingRequestDto {
  @ApiProperty({
    description: 'Final price adjustment (optional)',
    example: 150.00,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  finalPrice?: number;

  @ApiProperty({
    description: 'Business owner notes for the booking',
    example: 'Confirmed with premium products',
    required: false,
  })
  @IsOptional()
  @IsString()
  businessNotes?: string;
}

export class RejectBookingRequestDto {
  @ApiProperty({
    description: 'Reason for rejecting the booking request',
    example: 'Staff not available at requested time',
  })
  @IsString()
  @IsNotEmpty()
  rejectionReason: string;
}

export class BookingRequestQueryDto {
  @ApiProperty({
    description: 'Filter by booking request status',
    enum: BookingRequestStatus,
    required: false,
    example: BookingRequestStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(BookingRequestStatus)
  status?: BookingRequestStatus;

  @ApiProperty({
    description: 'Filter by service location (at-home or in-salon)',
    enum: ServiceLocation,
    required: false,
    example: ServiceLocation.IN_SALON,
  })
  @IsOptional()
  @IsEnum(ServiceLocation)
  serviceLocation?: ServiceLocation;

  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    default: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({
    description: 'Filter by assigned staff ID (optional) - shows only bookings assigned to this staff member',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  staffId?: string;
}