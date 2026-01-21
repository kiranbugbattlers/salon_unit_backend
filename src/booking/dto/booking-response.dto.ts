import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus, ServiceLocation } from '../../common/enums';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

export class CustomerDto {
  @ApiProperty({
    description: 'Customer ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Customer first name',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'Customer last name',
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'Customer email',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Customer phone number',
    example: '+1234567890',
  })
  phone: string;
}

export class BusinessDto {
  @ApiProperty({
    description: 'Business ID',
    example: '456e7890-e12b-34c5-d678-901234567890',
  })
  id: string;

  @ApiProperty({
    description: 'Unique shop identifier',
    example: 'SH-123456',
  })
  shopId: string;

  @ApiProperty({
    description: 'Business name',
    example: 'Elite Hair Salon',
  })
  businessName: string;

  @ApiProperty({
    description: 'Business address',
    example: '123 Main St, New York, NY',
  })
  address: string;

  @ApiProperty({
    description: 'Business phone number',
    example: '+1987654321',
  })
  phone: string;
}

export class StaffDto {
  @ApiProperty({
    description: 'Staff ID',
    example: '789e0123-e45f-67g8-h901-234567890123',
  })
  id: string;

  @ApiProperty({
    description: 'Staff first name',
    example: 'Jane',
  })
  firstName: string;

  @ApiProperty({
    description: 'Staff last name',
    example: 'Smith',
  })
  lastName: string;

  @ApiProperty({
    description: 'Staff profile picture URL',
    example: 'uploads/staff/profile-pic.jpg',
    required: false,
  })
  profilePic?: string;

  @ApiProperty({
    description: 'Staff profile picture CDN URL',
    example: 'https://cdn.example.com/staff/profile-pic.jpg',
    required: false,
  })
  profilePicCdnUrl?: string;
}

export class ServiceDto {
  @ApiProperty({
    description: 'Service ID',
    example: '012e3456-e78f-90g1-h234-567890123456',
  })
  id: string;

  @ApiProperty({
    description: 'Service name',
    example: 'Premium Hair Cut',
  })
  name: string;

  @ApiProperty({
    description: 'Service description',
    example: 'Professional hair cutting service with styling',
  })
  description: string;

  @ApiProperty({
    description: 'Service default duration in minutes',
    example: 60,
  })
  defaultDuration: number;

  @ApiProperty({
    description: 'Service base price',
    example: 75.50,
  })
  basePrice: number;
}

export class BookingDto {
  @ApiProperty({
    description: 'Booking ID',
    example: '345e6789-e01f-23g4-h567-890123456789',
  })
  id: string;

  @ApiProperty({
    description: 'Appointment date',
    example: '2024-01-15',
  })
  appointmentDate: string;

  @ApiProperty({
    description: 'Start time',
    example: '10:30',
  })
  startTime: string;

  @ApiProperty({
    description: 'End time',
    example: '11:30',
  })
  endTime: string;

  @ApiProperty({
    description: 'Booking status',
    enum: BookingStatus,
    example: BookingStatus.CONFIRMED,
  })
  status: BookingStatus;

  @ApiProperty({
    description: 'Service location',
    enum: ServiceLocation,
    example: ServiceLocation.IN_SALON,
  })
  serviceLocation: ServiceLocation;

  @ApiProperty({
    description: 'Total amount',
    example: 75.50,
  })
  totalAmount: number;

  @ApiProperty({
    description: 'Special requests',
    example: 'Customer prefers organic products',
    nullable: true,
  })
  specialRequests?: string;

  @ApiProperty({
    description: 'Booking creation date',
    example: '2024-01-10T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-10T10:30:00Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Customer information',
    type: CustomerDto,
  })
  customer: CustomerDto;

  @ApiProperty({
    description: 'Business information',
    type: BusinessDto,
  })
  business: BusinessDto;

  @ApiProperty({
    description: 'Staff information',
    type: StaffDto,
  })
  staff: StaffDto;

  @ApiProperty({
    description: 'Service information',
    type: ServiceDto,
  })
  service: ServiceDto;
}

export class BookingResponseDto extends ApiResponseDto<BookingDto> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Booking operation completed successfully' })
  message: string;

  @ApiProperty({
    description: 'Booking data',
    type: BookingDto,
  })
  data: BookingDto;
}

export class BookingListResponseDto extends ApiResponseDto<BookingDto[]> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Bookings retrieved successfully' })
  message: string;

  @ApiProperty({
    description: 'List of bookings',
    type: [BookingDto],
  })
  data: BookingDto[];

  @ApiProperty({
    description: 'Pagination metadata',
  })
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class BookingQueryDto {
  @ApiProperty({
    description: 'Filter by booking status',
    enum: BookingStatus,
    required: false,
    example: BookingStatus.CONFIRMED,
  })
  status?: BookingStatus;

  @ApiProperty({
    description: 'Filter by appointment date (YYYY-MM-DD)',
    example: '2024-01-15',
    required: false,
  })
  appointmentDate?: string;

  @ApiProperty({
    description: 'Filter from date (YYYY-MM-DD)',
    example: '2024-01-01',
    required: false,
  })
  fromDate?: string;

  @ApiProperty({
    description: 'Filter to date (YYYY-MM-DD)',
    example: '2024-01-31',
    required: false,
  })
  toDate?: string;

  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
    required: false,
  })
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    default: 10,
    required: false,
  })
  limit?: number = 10;
}