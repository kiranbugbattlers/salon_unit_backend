import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString, IsEnum, IsOptional, Matches } from 'class-validator';
import { ServiceLocation, BookingStatus } from '../../common/enums';

export class UpdateBookingDto {
  @ApiProperty({
    description: 'New appointment date (YYYY-MM-DD)',
    example: '2024-01-16',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  appointmentDate?: string;

  @ApiProperty({
    description: 'New start time in HH:MM format (24-hour)',
    example: '14:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Start time must be in HH:MM format',
  })
  startTime?: string;

  @ApiProperty({
    description: 'New end time in HH:MM format (24-hour)',
    example: '15:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'End time must be in HH:MM format',
  })
  endTime?: string;

  @ApiProperty({
    description: 'Updated service location preference',
    enum: ServiceLocation,
    example: ServiceLocation.AT_HOME,
    required: false,
  })
  @IsOptional()
  @IsEnum(ServiceLocation)
  serviceLocation?: ServiceLocation;

  @ApiProperty({
    description: 'Updated booking status',
    enum: BookingStatus,
    example: BookingStatus.CONFIRMED,
    required: false,
  })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiProperty({
    description: 'Updated notes or special requests',
    example: 'Changed to hypoallergenic products',
    required: false,
  })
  @IsOptional()
  @IsString()
  specialRequests?: string;

  @ApiProperty({
    description: 'Updated total service amount',
    example: 85.00,
    required: false,
  })
  @IsOptional()
  totalAmount?: number;
}