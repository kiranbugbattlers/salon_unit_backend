import { ApiProperty } from '@nestjs/swagger';

export class BookingHistoryDto {
  @ApiProperty({
    description: 'Unique booking ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  bookingId: string;

  @ApiProperty({ description: 'Customer name' })
  customerName: string;

  @ApiProperty({
    description: 'Total booking amount',
    example: 150.00
  })
  bookingAmount: number;

  @ApiProperty({ 
    description: 'Payment Method: Cash / Online' 
  })
  paymentMethod: string;

  @ApiProperty({
    description: 'Booking date & time',
    example: '2024-01-15T10:30:00.000Z'
  })
  bookingDateTime: Date;

  @ApiProperty({
    description: 'Booking creation date',
    example: '2024-01-15T10:30:00.000Z'
  })
  createdAt: Date;
}

export class BookingHistoryListDto {
  @ApiProperty({
    description: 'Array of booking history',
    type: [BookingHistoryDto]
  })
  bookings: BookingHistoryDto[];

  @ApiProperty({
    description: 'Total number of bookings',
    example: 25
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 3
  })
  totalPages: number;

  @ApiProperty({
    description: 'Whether there are more pages',
    example: true
  })
  hasNext: boolean;
}

export class BookingHistoryQueryDto {
  @ApiProperty({
    description: 'Filter by specific appointment date (YYYY-MM-DD)',
    example: '2024-01-15',
    required: false
  })
  date?: string;

  @ApiProperty({
    description: 'Filter by specific appointment date (YYYY-MM-DD)',
    example: '2024-01-15',
    required: false
  })
  appointmentDate?: string;

  @ApiProperty({
    description: 'Filter by payment method',
    enum: ['cash', 'online'],
    required: false
  })
  paymentMethod?: string;

  @ApiProperty({
    description: 'Filter bookings from this date onwards (YYYY-MM-DD)',
    example: '2024-01-01',
    required: false
  })
  fromDate?: string;

  @ApiProperty({
    description: 'Filter bookings up to this date (YYYY-MM-DD)',
    example: '2024-01-31',
    required: false
  })
  toDate?: string;

  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    required: false
  })
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    required: false
  })
  limit?: number = 10;

  @ApiProperty({
    description: 'Sort field',
    enum: ['bookingDateTime', 'bookingAmount'],
    example: 'bookingDateTime',
    required: false
  })
  sortBy?: string = 'bookingDateTime';

  @ApiProperty({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    example: 'DESC',
    required: false
  })
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
