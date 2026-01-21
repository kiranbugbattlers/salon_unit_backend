import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, BookingStatus, ServiceLocation } from '../../common/enums';
import { BookingRequestStatus } from '../../database/entities';
import { AdminBookingService } from '../services/admin-booking.service';
import {
  AdminBookingQueryDto,
  AdminBookingRequestQueryDto,
  AdminBookingListResponseDto,
  AdminBookingRequestListResponseDto,
  AdminBookingResponseDto,
  AdminBookingRequestResponseDto,
  ForceCancelBookingDto,
  ForceCompleteBookingDto,
} from '../dto/admin-booking.dto';

@ApiTags('Admin - Booking Management')
@Controller('admin/bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth('JWT')
export class AdminBookingController {
  constructor(private readonly adminBookingService: AdminBookingService) {}

  // ==================== Endpoint 1: View All Bookings ====================
  @Get()
  @ApiOperation({
    summary: 'Get all bookings (Admin only)',
    description: `
      Global view of all bookings across all businesses with advanced filtering.

      Features:
      - View all confirmed bookings system-wide
      - Filter by status, business, customer, staff, location
      - Filter by date range
      - Paginated results
      - Includes complete booking details
      - Includes payment and commission information
      - Includes sensitive data (OTPs for support)

      Use Cases:
      - System-wide booking monitoring
      - Support and troubleshooting
      - Business intelligence and analytics
      - Dispute resolution
      - Audit and compliance

      Query Parameters:
      - status: Filter by booking status (pending, confirmed, in-progress, completed, cancelled)
      - businessOwnerId: Filter by specific business
      - customerId: Filter by specific customer
      - staffId: Filter by staff member
      - serviceLocation: Filter by location type (in-salon, at-home)
      - dateFrom/dateTo: Date range filter (YYYY-MM-DD)
      - page, limit: Pagination controls
    `,
  })
  @ApiQuery({ name: 'status', enum: BookingStatus, required: false })
  @ApiQuery({ name: 'businessOwnerId', required: false })
  @ApiQuery({ name: 'customerId', required: false })
  @ApiQuery({ name: 'staffId', required: false })
  @ApiQuery({ name: 'serviceLocation', enum: ServiceLocation, required: false })
  @ApiQuery({ name: 'dateFrom', required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'dateTo', required: false, example: '2025-01-31' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Bookings retrieved successfully',
    type: AdminBookingListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  async getAllBookings(@Query() query: AdminBookingQueryDto): Promise<AdminBookingListResponseDto> {
    const { bookings, total } = await this.adminBookingService.getAllBookings(query);

    const page = query.page || 1;
    const limit = query.limit || 10;

    return {
      code: 200,
      success: true,
      message: 'Bookings retrieved successfully',
      data: bookings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ==================== Endpoint 2: View All Booking Requests ====================
  @Get('requests')
  @ApiOperation({
    summary: 'Get all booking requests (Admin only)',
    description: `
      Monitor booking request pipeline across all businesses.

      Features:
      - View all booking requests system-wide
      - Track request workflow from pending to completion
      - Filter by status (pending, approved, rejected, etc.)
      - Filter by business, customer, date range
      - Includes arrival OTPs for verification support
      - Includes payment information
      - Full service details

      Use Cases:
      - Monitor booking request approval workflow
      - Identify bottlenecks in approval process
      - Support OTP verification issues
      - Track payment flow
      - Dispute resolution
      - Business performance analysis

      Status Filter Options:
      - pending: All pending requests
      - staff_assigned: Pending with staff assigned
      - approved_otp_generated: Approved, OTP sent to customer
      - approved_pending_payment: Arrival verified, awaiting payment
      - approved: Payment completed
      - rejected: Rejected by business owner
    `,
  })
  @ApiQuery({ name: 'status', enum: BookingRequestStatus, required: false })
  @ApiQuery({ name: 'businessOwnerId', required: false })
  @ApiQuery({ name: 'customerId', required: false })
  @ApiQuery({ name: 'dateFrom', required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'dateTo', required: false, example: '2025-01-31' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Booking requests retrieved successfully',
    type: AdminBookingRequestListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  async getAllBookingRequests(@Query() query: AdminBookingRequestQueryDto): Promise<AdminBookingRequestListResponseDto> {
    const { requests, total } = await this.adminBookingService.getAllBookingRequests(query);

    const page = query.page || 1;
    const limit = query.limit || 10;

    return {
      code: 200,
      success: true,
      message: 'Booking requests retrieved successfully',
      data: requests,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ==================== Endpoint 3: Get Booking Details ====================
  @Get(':id')
  @ApiOperation({
    summary: 'Get booking details (Admin only)',
    description: `
      Deep dive into specific booking for support and audit.

      Features:
      - Complete booking information
      - Includes service OTP (for support purposes)
      - Payment details (Razorpay IDs, payment method, status)
      - Commission information
      - Customer, business, staff, service details
      - Full timeline (created, started, completed, cancelled)
      - Related booking request ID

      Use Cases:
      - Customer support inquiries
      - OTP verification issues
      - Payment dispute resolution
      - Service quality complaints
      - Audit and compliance checks
      - Troubleshooting system issues

      Security:
      - Admin-only access
      - Contains sensitive data (OTPs, payment IDs)
      - Use responsibly for legitimate support purposes only
    `,
  })
  @ApiParam({ name: 'id', description: 'Booking ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Booking details retrieved successfully',
    type: AdminBookingResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Booking not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  async getBookingDetails(@Param('id') bookingId: string): Promise<AdminBookingResponseDto> {
    const booking = await this.adminBookingService.getBookingDetails(bookingId);

    return {
      code: 200,
      success: true,
      message: 'Booking details retrieved successfully',
      data: booking,
    };
  }

  // ==================== Endpoint 4: Get Booking Request Details ====================
  @Get('requests/:id')
  @ApiOperation({
    summary: 'Get booking request details (Admin only)',
    description: `
      View complete booking request details including lifecycle data.

      Features:
      - Full request information
      - Includes arrival OTP (for verification support)
      - Service OTP (if booking confirmed)
      - Payment information
      - Customer and business details
      - Requested vs assigned staff
      - All requested services with pricing
      - Timeline of status changes
      - Rejection reason if rejected

      Use Cases:
      - Support customer OTP issues
      - Investigate approval delays
      - Resolve payment problems
      - Handle dispute escalations
      - Verify service pricing
      - Track request-to-booking conversion

      Security:
      - Admin-only access
      - Contains arrival and service OTPs
      - Use for legitimate support only
    `,
  })
  @ApiParam({ name: 'id', description: 'Booking Request ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Booking request details retrieved successfully',
    type: AdminBookingRequestResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Booking request not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  async getBookingRequestDetails(@Param('id') bookingRequestId: string): Promise<AdminBookingRequestResponseDto> {
    const bookingRequest = await this.adminBookingService.getBookingRequestDetails(bookingRequestId);

    return {
      code: 200,
      success: true,
      message: 'Booking request details retrieved successfully',
      data: bookingRequest,
    };
  }

  // ==================== Endpoint 5: Force Cancel Booking ====================
  @Post(':id/force-cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Force cancel booking (Admin only - Emergency use)',
    description: `
      Admin override to cancel any booking regardless of status.

      Features:
      - Cancel booking in any status
      - Optional refund processing
      - Notify affected parties
      - Audit logging with admin ID and reason
      - Reverses commission if applicable

      Use Cases:
      - Customer complaints/disputes
      - Service quality issues
      - Business owner disputes
      - System errors or bugs
      - Emergency situations
      - Compliance requirements

      Refund Process (if refundRequired = true):
      1. Checks payment method (online vs COD)
      2. For online payments: Initiates Razorpay refund
      3. Updates wallet balances
      4. Reverses commission transactions
      5. Updates settlement records

      Notifications:
      - Customer: Notified with cancellation reason and refund status
      - Business Owner: Notified of admin cancellation
      - Both parties receive clear explanation

      Audit Trail:
      - Admin ID logged
      - Cancellation reason stored
      - Before/after status recorded
      - Timestamp captured
      - Immutable audit log created

      Security:
      - Admin-only access
      - Reason required (mandatory)
      - All actions logged
      - Cannot be undone

      Warning: This is a powerful operation. Use only when necessary and ensure proper documentation.
    `,
  })
  @ApiParam({ name: 'id', description: 'Booking ID (UUID)' })
  @ApiBody({ type: ForceCancelBookingDto })
  @ApiResponse({
    status: 200,
    description: 'Booking cancelled successfully',
    type: AdminBookingResponseDto,
    schema: {
      example: {
        code: 200,
        success: true,
        message: 'Booking cancelled successfully by admin',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          status: 'cancelled',
          cancellationReason: '[ADMIN OVERRIDE] Customer complaint - service quality issue',
          cancelledAt: '2025-01-15T14:30:00Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot cancel - invalid state or already cancelled',
  })
  @ApiResponse({
    status: 404,
    description: 'Booking not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  async forceCancelBooking(
    @Request() req: any,
    @Param('id') bookingId: string,
    @Body() cancelDto: ForceCancelBookingDto,
  ): Promise<AdminBookingResponseDto> {
    const adminId = req.user.sub;
    const booking = await this.adminBookingService.forceCancelBooking(bookingId, adminId, cancelDto);

    return {
      code: 200,
      success: true,
      message: 'Booking cancelled successfully by admin',
      data: booking,
    };
  }

  // ==================== Endpoint 5b: Force Complete Booking ====================
  @Post(':id/force-complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Force complete booking (Admin only - Override)',
    description: `
      Manually complete a booking when normal flow fails.

      Features:
      - Complete booking in any non-cancelled status
      - Bypass OTP verification requirement
      - Optional commission calculation
      - Audit logging with reason
      - Marks service as started and completed

      Use Cases:
      - OTP system failure
      - Business owner app issues
      - Service completed offline
      - Customer unable to provide OTP
      - System bugs or errors
      - Offline service completion verification

      Actions Performed:
      1. Updates booking status to COMPLETED
      2. Sets service completion timestamp
      3. Marks OTP as verified (if not already)
      4. Marks service as started (if not already)
      5. Optionally calculates commission
      6. Adds admin override note to booking

      Commission Handling:
      - If calculateCommission = true:
        - Triggers commission calculation
        - Updates business owner and customer wallets
        - Creates settlement line items
        - Follows normal commission flow

      Audit Trail:
      - Admin ID logged
      - Completion reason required
      - Optional notes for context
      - Timestamp captured
      - Before/after status recorded

      Security:
      - Admin-only access
      - Reason mandatory
      - All actions logged
      - Cannot be reversed

      Warning: Use only when legitimate service completion cannot be recorded through normal flow.
    `,
  })
  @ApiParam({ name: 'id', description: 'Booking ID (UUID)' })
  @ApiBody({ type: ForceCompleteBookingDto })
  @ApiResponse({
    status: 200,
    description: 'Booking completed successfully',
    type: AdminBookingResponseDto,
    schema: {
      example: {
        code: 200,
        success: true,
        message: 'Booking completed successfully by admin',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          status: 'completed',
          serviceCompletedAt: '2025-01-15T14:30:00Z',
          specialRequests: '[ADMIN OVERRIDE] OTP system failure - verified offline\nNotes: Customer confirmed service completion via phone',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot complete - invalid state or already completed',
  })
  @ApiResponse({
    status: 404,
    description: 'Booking not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  async forceCompleteBooking(
    @Request() req: any,
    @Param('id') bookingId: string,
    @Body() completeDto: ForceCompleteBookingDto,
  ): Promise<AdminBookingResponseDto> {
    const adminId = req.user.sub;
    const booking = await this.adminBookingService.forceCompleteBooking(bookingId, adminId, completeDto);

    return {
      code: 200,
      success: true,
      message: 'Booking completed successfully by admin',
      data: booking,
    };
  }
}
