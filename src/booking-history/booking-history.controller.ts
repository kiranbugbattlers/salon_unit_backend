import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { BookingHistoryService } from './booking-history.service';
import { BookingHistoryDto, BookingHistoryListDto, BookingHistoryQueryDto } from './dto/booking-history.dto';

@ApiTags('Booking History')
@Controller('booking-history')
@UseGuards(JwtAuthGuard)
export class BookingHistoryController {
  constructor(
    private readonly bookingHistoryService: BookingHistoryService,
  ) {}

  @Get()
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get all booking history for authenticated user',
    description: `
      Retrieve all booking history for the authenticated customer with filtering options.

      Features:
      - Paginated results with configurable page size
      - Filter by booking status (pending, confirmed, in-progress, completed, cancelled)
      - Filter by specific appointment date
      - Filter by date range (from/to dates)
      - Sort by appointment date, creation date, or amount
      - Includes full booking details with related entities

      Security:
      - Customers can only view their own bookings
      - JWT authentication required

      Use Cases:
      - Customer viewing their booking history
      - Filtering upcoming appointments
      - Checking booking status and details
      - Reviewing past services
    `,
  })
  @ApiQuery({
    name: 'status',
    description: 'Filter by booking status',
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    required: false,
  })
  @ApiQuery({
    name: 'date',
    description: 'Filter by specific appointment date (YYYY-MM-DD)',
    example: '2024-01-15',
    required: false,
  })
  @ApiQuery({
    name: 'appointmentDate',
    description: 'Filter by specific appointment date (YYYY-MM-DD)',
    example: '2024-01-15',
    required: false,
  })
  @ApiQuery({
    name: 'fromDate',
    description: 'Filter bookings from this date onwards (YYYY-MM-DD)',
    example: '2024-01-01',
    required: false,
  })
  @ApiQuery({
    name: 'toDate',
    description: 'Filter bookings up to this date (YYYY-MM-DD)',
    example: '2024-01-31',
    required: false,
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number for pagination',
    example: 1,
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of items per page',
    example: 10,
    required: false,
  })
  @ApiQuery({
    name: 'sortBy',
    description: 'Sort field',
    enum: ['appointmentDate', 'createdAt', 'totalAmount'],
    example: 'appointmentDate',
    required: false,
  })
  @ApiQuery({
    name: 'sortOrder',
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    example: 'DESC',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Booking history retrieved successfully',
    type: BookingHistoryListDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  async getAllBookings(
    @CurrentUser() user: CurrentUserData,
    @Query() query: any,
  ): Promise<BookingHistoryListDto> {
    const bookingQuery: BookingHistoryQueryDto = {
      date: query.date,
      appointmentDate: query.appointmentDate,
      paymentMethod: query.paymentMethod,
      fromDate: query.fromDate,
      toDate: query.toDate,
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 10,
      sortBy: query.sortBy || 'bookingDateTime',
      sortOrder: query.sortOrder || 'DESC',
    };
    
    return this.bookingHistoryService.findAll(user.customerId, bookingQuery);
  }

  @Get(':bookingId')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get specific booking by ID',
    description: `
      Retrieve a specific booking by its ID with full details.

      Features:
      - Complete booking details with all fields
      - Related customer, business, staff, and service information
      - Ownership validation for security

      Security:
      - Customers can only view their own bookings
      - JWT authentication required
    `,
  })
  @ApiParam({
    name: 'bookingId',
    description: 'Booking ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Booking retrieved successfully',
    type: BookingHistoryDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only view own bookings',
  })
  @ApiResponse({
    status: 404,
    description: 'Booking not found',
  })
  async getBookingById(
    @CurrentUser() user: CurrentUserData,
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
  ): Promise<BookingHistoryDto> {
    return this.bookingHistoryService.findOne(user.customerId, bookingId);
  }

  // Admin endpoints
  @Get('admin/all')
  @ApiBearerAuth('JWT')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Admin: Get all booking history for all users',
    description: `
      Retrieve all booking history for all customers with filtering options.
      
      Features:
      - Paginated results with configurable page size
      - Filter by booking status (pending, confirmed, in-progress, completed, cancelled)
      - Filter by specific appointment date
      - Filter by date range (from/to dates)
      - Filter by customer ID
      - Filter by business owner ID
      - Sort by appointment date, creation date, or amount
      - Includes full booking details with related entities
      
      Security:
      - Admin access required
      - Can view all customer bookings
      
      Use Cases:
      - Admin viewing all system bookings
      - Filtering bookings by specific customers or businesses
      - System-wide booking analytics
      - Customer support operations
    `,
  })
  @ApiQuery({
    name: 'customerId',
    description: 'Filter by customer ID (UUID)',
    required: false,
  })
  @ApiQuery({
    name: 'businessOwnerId',
    description: 'Filter by business owner ID (UUID)',
    required: false,
  })
  @ApiQuery({
    name: 'status',
    description: 'Filter by booking status',
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    required: false,
  })
  @ApiQuery({
    name: 'date',
    description: 'Filter by specific appointment date (YYYY-MM-DD)',
    example: '2024-01-15',
    required: false,
  })
  @ApiQuery({
    name: 'appointmentDate',
    description: 'Filter by specific appointment date (YYYY-MM-DD)',
    example: '2024-01-15',
    required: false,
  })
  @ApiQuery({
    name: 'fromDate',
    description: 'Filter bookings from this date onwards (YYYY-MM-DD)',
    example: '2024-01-01',
    required: false,
  })
  @ApiQuery({
    name: 'toDate',
    description: 'Filter bookings up to this date (YYYY-MM-DD)',
    example: '2024-01-31',
    required: false,
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number for pagination',
    example: 1,
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of items per page',
    example: 10,
    required: false,
  })
  @ApiQuery({
    name: 'sortBy',
    description: 'Sort field',
    enum: ['appointmentDate', 'createdAt', 'totalAmount'],
    example: 'appointmentDate',
    required: false,
  })
  @ApiQuery({
    name: 'sortOrder',
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    example: 'DESC',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'All booking history retrieved successfully',
    type: BookingHistoryListDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async adminGetAllBookings(
    @Query() query: any,
  ): Promise<BookingHistoryListDto> {
    const bookingQuery: BookingHistoryQueryDto = {
      customerId: query.customerId,
      businessOwnerId: query.businessOwnerId,
      date: query.date,
      appointmentDate: query.appointmentDate,
      paymentMethod: query.paymentMethod,
      fromDate: query.fromDate,
      toDate: query.toDate,
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 10,
      sortBy: query.sortBy || 'bookingDateTime',
      sortOrder: query.sortOrder || 'DESC',
    };
    
    return this.bookingHistoryService.findAll(null, bookingQuery); // null customerId means get all
  }

  @Get('admin/:bookingId')
  @ApiBearerAuth('JWT')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Admin: Get any booking by ID',
    description: `
      Retrieve any booking by its ID with full details.
      
      Features:
      - Complete booking details with all fields
      - Related customer, business, staff, and service information
      - No ownership restrictions (admin can view any booking)
      
      Security:
      - Admin access required
      - Can view any booking in the system
      
      Use Cases:
      - Admin investigating specific bookings
      - Customer support ticket resolution
      - System debugging and monitoring
    `,
  })
  @ApiParam({
    name: 'bookingId',
    description: 'Booking ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Booking retrieved successfully',
    type: BookingHistoryDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({
    status: 404,
    description: 'Booking not found',
  })
  async adminGetBookingById(
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
  ): Promise<BookingHistoryDto> {
    return this.bookingHistoryService.findOne(null, bookingId); // null customerId means no ownership check
  }

  @Get('admin/customer/:customerId')
  @ApiBearerAuth('JWT')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Admin: Get booking history for specific customer',
    description: `
      Retrieve booking history for a specific customer with filtering options.
      
      Features:
      - Paginated results with configurable page size
      - Filter by booking status
      - Filter by date ranges
      - Sort options
      - All bookings for the specified customer
      
      Security:
      - Admin access required
      - Can view any customer's bookings
      
      Use Cases:
      - Admin viewing specific customer history
      - Customer support investigations
      - Customer behavior analysis
    `,
  })
  @ApiParam({
    name: 'customerId',
    description: 'Customer ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'status',
    description: 'Filter by booking status',
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    required: false,
  })
  @ApiQuery({
    name: 'fromDate',
    description: 'Filter bookings from this date onwards (YYYY-MM-DD)',
    example: '2024-01-01',
    required: false,
  })
  @ApiQuery({
    name: 'toDate',
    description: 'Filter bookings up to this date (YYYY-MM-DD)',
    example: '2024-01-31',
    required: false,
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number for pagination',
    example: 1,
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of items per page',
    example: 10,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Customer booking history retrieved successfully',
    type: BookingHistoryListDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async adminGetCustomerBookings(
    @Param('customerId', ParseUUIDPipe) customerId: string,
    @Query() query: any,
  ): Promise<BookingHistoryListDto> {
    const bookingQuery: BookingHistoryQueryDto = {
      date: query.date,
      appointmentDate: query.appointmentDate,
      paymentMethod: query.paymentMethod,
      fromDate: query.fromDate,
      toDate: query.toDate,
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 10,
      sortBy: query.sortBy || 'bookingDateTime',
      sortOrder: query.sortOrder || 'DESC',
    };
    
    return this.bookingHistoryService.findAll(customerId, bookingQuery);
  }
}
