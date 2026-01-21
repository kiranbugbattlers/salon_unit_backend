import { IsDateString, IsUUID, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

export class BookedSlotsQueryDto {
  @ApiProperty({
    description: 'Date to check for booked slots (YYYY-MM-DD format)',
    example: '2024-01-15',
  })
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiProperty({
    description: 'Staff member UUID to check availability for. If not provided, returns booked slots for all staff members.',
    example: 'staff-uuid-here',
    required: false,
  })
  @IsOptional()
  @IsUUID(4)
  staffId?: string;
}

export class BookedSlotItemDto {
  @ApiProperty({ description: 'Unique booking ID' })
  bookingId: string;

  @ApiProperty({ description: 'Start time of the booking in HH:MM format' })
  startTime: string;

  @ApiProperty({ description: 'End time of the booking in HH:MM format' })
  endTime: string;

  @ApiProperty({ description: 'Name of the service being provided' })
  serviceName: string;

  @ApiProperty({ description: 'Status of the booking' })
  status: string;

  @ApiProperty({ description: 'Service location', required: false })
  serviceLocation?: string;

  @ApiProperty({ description: 'Customer name (first name only for privacy)', required: false })
  customerFirstName?: string;

  @ApiProperty({ description: 'Staff member ID assigned to this booking' })
  staffId: string;

  @ApiProperty({ description: 'Staff member name assigned to this booking' })
  staffName: string;
}

export class BookedSlotsDataDto {
  @ApiProperty({ description: 'Date being queried' })
  date: string;

  @ApiProperty({ description: 'Staff ID being queried (if filtering by specific staff)', required: false })
  staffId?: string;

  @ApiProperty({ description: 'Business shop ID' })
  shopId: string;

  @ApiProperty({ description: 'Staff member name (if filtering by specific staff)', required: false })
  staffName?: string;

  @ApiProperty({ description: 'List of booked time slots for the date', type: [BookedSlotItemDto] })
  bookedSlots: BookedSlotItemDto[];

  @ApiProperty({ description: 'Total number of bookings for the day' })
  totalBookings: number;
}

export class BookedSlotsResponseDto extends ApiResponseDto<BookedSlotsDataDto> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Booked slots retrieved successfully' })
  message: string;

  @ApiProperty()
  data: BookedSlotsDataDto;

  constructor(code: number, success: boolean, message: string, data: BookedSlotsDataDto) {
    super(code, success, message, data);
  }
}