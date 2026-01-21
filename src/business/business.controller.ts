import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { BusinessService } from './business.service';
import { BusinessQueryDto, BusinessResponseDto, BusinessDetailResponseDto, BookedSlotsQueryDto, BookedSlotsResponseDto, AvailableSlotsQueryDto, AvailableSlotsResponseDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Public Businesses')
@Controller('public/businesses')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Get()
  @Public()
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Browse businesses with flexible filtering',
    description: `
      Flexible endpoint to browse all approved businesses with support for:
      - Location-based filtering (lat, lng, radius)
      - User-specific data (when userspecific=true - requires JWT authentication)
      - Sorting by multiple fields (rating, name, createdAt, distance, operatingYears)
      - Pagination (page, limit)
      - Category, availability, and gender filtering
      - Price range filtering (based on business services)
      - Operating years filtering
      - Search by business name, description, city, area, or landmark

      **Sorting Examples**:
      - sort=name (name ascending)
      - sort=-rating (rating descending)
      - sort=operatingYears,-name (operating years ascending, then name descending)
      - sort=distance (requires lat/lng parameters)

      **Authentication**:
      - Public access: No authentication required for basic business browsing
      - User-specific data: JWT token optional - if provided with userspecific=true, includes favorites/history
      - 🔓 Click the lock icon to add JWT token for user-specific features (favorites, history)
    `,
  })
  @ApiQuery({
    name: 'lat',
    required: false,
    type: Number,
    description: 'Latitude for location-based filtering',
    example: 12.9716,
  })
  @ApiQuery({
    name: 'lng',
    required: false,
    type: Number,
    description: 'Longitude for location-based filtering',
    example: 77.5946,
  })
  @ApiQuery({
    name: 'radius',
    required: false,
    type: Number,
    description: 'Search radius in kilometers (default: 10)',
    example: 5,
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    type: String,
    description: 'Sort fields (comma-separated). Use - prefix for descending order. Allowed fields: rating, name, createdAt, distance (distance requires lat/lng), operatingYears',
    example: 'rating,-operatingYears',
  })
  @ApiQuery({
    name: 'userspecific',
    required: false,
    type: Boolean,
    description: 'Include user-specific data like favorites and visit history. JWT authentication is optional - if not provided, returns business data without user-specific info.',
    example: false,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 20, max: 100)',
    example: 20,
  })
  @ApiQuery({
    name: 'category',
    required: false,
    type: String,
    description: 'Filter by category UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiQuery({
    name: 'availableAtHome',
    required: false,
    type: Boolean,
    description: 'Filter businesses offering services at home',
    example: true,
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    type: Number,
    description: 'Minimum price filter (based on business services)',
    example: 100,
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    type: Number,
    description: 'Maximum price filter (based on business services)',
    example: 1000,
  })
  @ApiQuery({
    name: 'gender',
    required: false,
    enum: ['male', 'female', 'both'],
    description: 'Filter businesses by service gender availability',
    example: 'both',
  })
  @ApiQuery({
    name: 'minOperatingYears',
    required: false,
    type: Number,
    description: 'Minimum operating years filter',
    example: 1,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term for business name, description, city, area, or landmark',
    example: 'Mumbai',
  })
  @ApiResponse({
    status: 200,
    description: 'Businesses retrieved successfully',
    type: BusinessResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid query parameters',
  })
  async getBusinesses(
    @Query() query: BusinessQueryDto,
    @Request() req?: any,
  ): Promise<BusinessResponseDto> {
    // userspecific is optional - if true and user is authenticated, include user-specific data
    // if true but user is not authenticated, just return business data without user-specific info
    const userId = query.userspecific && req?.user?.userId ? req.user.userId : undefined;
    const customerId = query.userspecific && req?.user?.customerId ? req.user.customerId : undefined;

    return this.businessService.getBusinesses(query, userId, customerId);
  }

  @Get(':shopId')
  @Public()
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get detailed business information by shop ID',
    description: `
      Get complete business information including:
      - Basic business details (name, description, address, media)
      - All services offered with pricing and categories
      - All staff members with their service specializations
      - Price range based on available services

      **Authentication**:
      - Public access: No authentication required
      - User-specific data: JWT token optional - if provided with userspecific=true, includes favorites/history
      - 🔓 Click the lock icon to add JWT token for user-specific features (favorites, history)
    `,
  })
  @ApiParam({
    name: 'shopId',
    description: 'Unique shop identifier (format: SH-XXXXXX)',
    example: 'SH-123456',
    type: String,
  })
  @ApiQuery({
    name: 'userspecific',
    required: false,
    type: Boolean,
    description: 'Include user-specific data like favorites. JWT authentication is optional - if not provided, returns business data without user-specific info.',
    example: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Business details retrieved successfully',
    type: BusinessDetailResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid shop ID or business not found',
  })
  async getBusinessDetail(
    @Param('shopId') shopId: string,
    @Query('userspecific') userspecific?: boolean,
    @Request() req?: any,
  ): Promise<BusinessDetailResponseDto> {
    // userspecific is optional - if true and user is authenticated, include user-specific data
    // if true but user is not authenticated, just return business data without user-specific info
    const userId = userspecific && req?.user?.userId ? req.user.userId : undefined;
    const customerId = userspecific && req?.user?.customerId ? req.user.customerId : undefined;

    return this.businessService.getBusinessDetail(shopId, userId, customerId);
  }

  @Get(':shopId/booked-slots')
  @Public()
  @ApiOperation({
    summary: 'Get booked time slots for a business on a specific date',
    description: `
      Get all booked time slots for a business on a given date. Can be filtered by specific staff member.
      This endpoint shows occupied time slots to help with appointment scheduling.

      **Use Cases**:
      - Check business availability for a specific date
      - Check specific staff availability when staffId is provided
      - Display occupied time slots in booking interface
      - Validate appointment times before booking

      **Behavior**:
      - With staffId: Returns booked slots for the specific staff member
      - Without staffId: Returns booked slots for all staff members of the business

      **Returns**:
      - List of booked time slots with start/end times
      - Service names and booking status
      - Customer first name (for privacy)
      - Staff information for each booking
    `,
  })
  @ApiParam({
    name: 'shopId',
    description: 'Unique shop identifier (format: SH-XXXXXX)',
    example: 'SH-123456',
    type: String,
  })
  @ApiQuery({
    name: 'date',
    description: 'Date to check for booked slots (YYYY-MM-DD format)',
    example: '2024-01-15',
    type: String,
  })
  @ApiQuery({
    name: 'staffId',
    description: 'Staff member UUID to check availability for. If not provided, returns booked slots for all staff members.',
    example: 'staff-uuid-here',
    type: String,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Booked slots retrieved successfully',
    type: BookedSlotsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid parameters (date format, UUID format, etc.)',
  })
  @ApiResponse({
    status: 404,
    description: 'Business or staff member not found',
  })
  async getBookedSlots(
    @Param('shopId') shopId: string,
    @Query() query: BookedSlotsQueryDto,
  ): Promise<BookedSlotsResponseDto> {
    return this.businessService.getBookedSlots(shopId, query.date, query.staffId);
  }

  @Get(':shopId/available-slots')
  @Public()
  @ApiOperation({
    summary: 'Get available time slots for a business',
    description: `
      Get available booking slots for a business across multiple days (1-6 days).

      Features:
      - Checks business operating hours and staff working hours
      - Excludes already booked time slots
      - Supports filtering by specific staff member
      - Returns detailed availability information for each day
      - Shows staff specializations for each slot

      Use Cases:
      - Display available slots for customer booking selection
      - Check staff availability for specific date ranges
      - Schedule planning and conflict detection
    `,
  })
  @ApiParam({
    name: 'shopId',
    description: 'Unique shop identifier (format: SH-XXXXXX)',
    example: 'SH-XXXXXX',
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Start date for availability check (YYYY-MM-DD format)',
    example: '2024-01-15',
    type: String,
  })
  @ApiQuery({
    name: 'numberOfDays',
    description: 'Number of consecutive days to check (1-6)',
    example: 3,
    type: Number,
  })
  @ApiQuery({
    name: 'staffId',
    description: 'Optional staff ID to filter slots for specific staff member',
    example: '456e7890-e12b-34c5-d678-901234567890',
    required: false,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Available slots retrieved successfully',
    type: AvailableSlotsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid parameters (date format, numberOfDays out of range, etc.)',
  })
  @ApiResponse({
    status: 404,
    description: 'Business not found or no staff found for the specified criteria',
  })
  async getAvailableSlots(
    @Param('shopId') shopId: string,
    @Query() query: AvailableSlotsQueryDto,
  ): Promise<AvailableSlotsResponseDto> {
    return this.businessService.getAvailableSlots(shopId, query);
  }
}