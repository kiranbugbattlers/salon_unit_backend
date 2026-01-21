import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsDateString, IsInt, Min, Max, IsUUID, IsOptional } from 'class-validator';

export class AvailableSlotsQueryDto {
  @ApiProperty({
    description: 'Start date for slot availability check',
    example: '2024-01-15',
    type: String,
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'Number of days to check (1-6)',
    example: 3,
    minimum: 1,
    maximum: 6,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(6)
  numberOfDays: number;

  @ApiProperty({
    description: 'Optional staff ID to filter slots for specific staff member',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  staffId?: string;
}

export class TimeSlotDto {
  @ApiProperty({
    description: 'Start time of the slot',
    example: '09:00',
  })
  startTime: string;

  @ApiProperty({
    description: 'End time of the slot',
    example: '10:00',
  })
  endTime: string;

  @ApiProperty({
    description: 'Whether this slot is available for booking',
    example: true,
  })
  isAvailable: boolean;

  @ApiProperty({
    description: 'Staff member details for this slot',
  })
  staff: {
    id: string;
    firstName: string;
    lastName: string;
    specializations: string[];
  };
}

export class DayAvailabilityDto {
  @ApiProperty({
    description: 'Date for this day availability',
    example: '2024-01-15',
  })
  date: string;

  @ApiProperty({
    description: 'Day of the week',
    example: 'Monday',
  })
  dayOfWeek: string;

  @ApiProperty({
    description: 'Whether the business is open on this day',
    example: true,
  })
  isBusinessOpen: boolean;

  @ApiProperty({
    description: 'Business operating hours for this day',
    nullable: true,
  })
  businessHours: {
    openTime: string;
    closeTime: string;
  } | null;

  @ApiProperty({
    description: 'Available time slots for this day',
    type: [TimeSlotDto],
  })
  timeSlots: TimeSlotDto[];
}

export class AvailableSlotsResponseDto {
  @ApiProperty({
    description: 'Business information',
  })
  business: {
    id: string;
    name: string;
    address: string;
  };

  @ApiProperty({
    description: 'Date range for availability check',
  })
  dateRange: {
    startDate: string;
    endDate: string;
    numberOfDays: number;
  };

  @ApiProperty({
    description: 'Availability data for each day',
    type: [DayAvailabilityDto],
  })
  days: DayAvailabilityDto[];

  @ApiProperty({
    description: 'Total number of available slots across all days',
    example: 42,
  })
  totalAvailableSlots: number;
}