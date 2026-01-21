import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
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
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums';
import { BookingRequestService } from './booking-request.service';
import { BookingService } from './booking.service';
import {
  AssignStaffDto,
  ApproveBookingRequestDto,
  RejectBookingRequestDto,
  BookingRequestQueryDto,
  BookingRequestResponseDto,
  BookingRequestListResponseDto,
  BusinessOwnerBookingRequestListResponseDto,
  BusinessOwnerBookingRequestResponseDto,
  VerifyBookingOtpDto,
  VerifyArrivalOtpDto,
  CompleteServiceDto,
  BookingResponseDto,
} from './dto';

@ApiTags('Booking Request Management')
@Controller('booking-requests')
@UseGuards(JwtAuthGuard)
export class BookingRequestController {
  constructor(
    private readonly bookingRequestService: BookingRequestService,
    private readonly bookingService: BookingService,
  ) {}

  // Note: To create booking requests, use POST /api/v1/bookings
  // This controller only handles booking request management (view, approve, reject, assign staff)


  @Get('customer')
  @Roles(UserRole.CUSTOMER)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get customer booking requests (Authenticated)',
    description: `
      Retrieve all booking requests for the authenticated customer with lifecycle state flags and arrival OTP.

      Features:
      - Authenticated endpoint - JWT token required
      - Uses authenticated user's customer ID automatically
      - Paginated results with configurable page size
      - Filter by status with support for database and virtual states
      - Returns computed lifecycle flags for easy UI rendering (isStaffAssigned, canPay, canCancel, etc.)
      - Includes arrival OTP for customer to show at shop
      - Ordered by requested date (newest first)
      - Includes full details of requested services
      - Shows assigned staff and approval status

      Status Filter Values:
      - pending: All pending requests (with or without staff assigned)
      - staff_assigned: Pending requests with staff assigned (virtual state)
      - approved_otp_generated: Approved by business, arrival OTP sent to customer
      - approved_pending_payment: Arrival OTP verified, awaiting customer payment
      - approved: All approved requests (with or without confirmed booking)
      - confirmed: Payment completed, booking created, awaiting customer arrival (virtual state)
      - in-progress: Customer arrived, OTP verified, service started (virtual state)
      - completed: Service finished (virtual state)
      - rejected: Rejected by business owner
      - cancelled: Cancelled by customer (virtual state)

      Response Fields:
      - arrivalOtp: 6-digit OTP customer shows to barber before payment (visible when status = approved_otp_generated)
      - otpCode: 6-digit OTP for service start verification (visible after payment)
      - canPay: true when arrival OTP verified (status = approved_pending_payment)
      - requiresAction: true when customer needs to show arrival OTP or make payment

      Use Cases:
      - Customer viewing their own booking request history
      - Customer viewing arrival OTP to show at shop
      - Filtering requests by UI state (e.g., status=approved_otp_generated for OTP viewing)
      - Checking request status and business owner responses
      - Viewing confirmed booking details with OTP codes
    `,
  })
  @ApiQuery({
    name: 'status',
    description: 'Filter by booking request status (supports database and virtual states: pending, staff_assigned, approved_otp_generated, approved_pending_payment, approved, confirmed, in-progress, completed, rejected, cancelled)',
    enum: ['pending', 'staff_assigned', 'approved_otp_generated', 'approved_pending_payment', 'approved', 'confirmed', 'in-progress', 'completed', 'rejected', 'cancelled'],
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
    description: 'Customer booking requests retrieved successfully',
    type: BookingRequestListResponseDto,
    schema: {
      example: {
        code: 200,
        success: true,
        message: 'Customer booking requests retrieved successfully',
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            status: 'approved_otp_generated',
            lifecycleState: 'approved_otp_generated',
            requestedDate: '2024-01-15',
            requestedStartTime: '10:00',
            requestedEndTime: '11:30',
            totalEstimatedPrice: 150.00,
            arrivalOtp: '654321',
            otpCode: null,
            confirmedBookingId: null,
            isStaffAssigned: true,
            isApproved: true,
            canPay: false,
            canCancel: true,
            requiresAction: true,
            customer: {
              id: 'cust-123',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
              phone: '+1234567890'
            },
            business: {
              id: 'biz-456',
              shopId: 'SH-001',
              businessName: 'Elite Salon',
              address: '123 Main St, New York'
            },
            assignedStaff: {
              id: 'staff-789',
              firstName: 'Jane',
              lastName: 'Smith'
            }
          }
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 404,
    description: 'Customer not found',
  })
  async getAuthenticatedCustomerBookingRequests(
    @Request() req: any,
    @Query() query: BookingRequestQueryDto,
  ): Promise<BookingRequestListResponseDto> {
    const customerId = req.user.customerId;
    return this.bookingRequestService.getCustomerBookingRequests(customerId, query);
  }

  @Get('customer/:id')
  @Roles(UserRole.CUSTOMER)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get single booking request by ID for customer (Detailed)',
    description: `
      Retrieve detailed information for a single booking request by ID.

      **Key Differences from List Endpoint**:
      - Returns single booking request (not array)
      - Includes \`bookingDetails\` object with add-on services breakdown
      - Loads full booking services if confirmed booking exists
      - Detailed financial breakdown and service summary

      **bookingDetails Structure** (only in detail endpoint):
      - \`totalAmount\`: Final total including add-ons and delivery
      - \`originalAmount\`: Original booking request amount
      - \`addOnServicesTotal\`: Sum of add-on services added during service
      - \`deliveryCharge\`: Delivery fee for at-home services
      - \`allServices[]\`: All services (original + add-ons)
      - \`originalServices[]\`: Services from booking request (isAddOn: false)
      - \`addOnServices[]\`: Services added during IN_PROGRESS (isAddOn: true)
      - \`serviceSummary\`: Counts and total duration

      **Add-on Services Tracking**:
      - Each add-on shows: \`customerApproved\`, \`addedAt\`, \`addedByStaffId\`
      - Allows customer to see what was added and when
      - Transparent pricing breakdown for final payment

      **Security**:
      - Customer can only access their own booking requests
      - Returns 403 Forbidden if accessing another customer's request

      **When bookingDetails is null**:
      - If booking request hasn't been approved yet (no confirmed booking)
      - If payment hasn't been completed yet
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Booking Request UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Booking request details retrieved successfully with add-on services breakdown',
    type: BookingRequestResponseDto,
    schema: {
      example: {
        code: 200,
        success: true,
        message: 'Booking request retrieved successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          status: 'approved',
          lifecycleState: 'in_progress',
          requestedDate: '2024-03-15',
          requestedStartTime: '14:00',
          requestedEndTime: '16:00',
          totalEstimatedPrice: 800.00,
          finalPrice: 800.00,
          services: [
            {
              id: 'service-req-001',
              quantity: 1,
              estimatedPrice: 500.00,
              estimatedDuration: 60,
              businessService: {
                id: 'bs-001',
                customPrice: 500.00,
                customDurationMinutes: 60,
                service: {
                  id: 'svc-001',
                  name: "Women's Haircut",
                  description: 'Professional haircut with styling'
                }
              }
            }
          ],
          confirmedBookingId: 'booking-001',
          bookingStatus: 'in-progress',
          bookingDetails: {
            totalAmount: 4300.00,
            originalAmount: 800.00,
            addOnServicesTotal: 3500.00,
            deliveryCharge: 0,
            paymentCompleted: false,
            allServices: [
              {
                id: 'bs-001',
                serviceName: "Women's Haircut",
                price: 500.00,
                durationMinutes: 60,
                isAddOn: false
              },
              {
                id: 'bs-002',
                serviceName: 'Hair Coloring (Full)',
                price: 2500.00,
                durationMinutes: 120,
                isAddOn: true,
                addedAt: '2024-03-15T14:30:00Z',
                customerApproved: true
              }
            ],
            originalServices: [
              {
                id: 'bs-001',
                serviceName: "Women's Haircut",
                price: 500.00,
                isAddOn: false
              }
            ],
            addOnServices: [
              {
                id: 'bs-002',
                serviceName: 'Hair Coloring (Full)',
                price: 2500.00,
                isAddOn: true,
                addedAt: '2024-03-15T14:30:00Z',
                customerApproved: true
              }
            ],
            serviceSummary: {
              originalServicesCount: 2,
              addOnServicesCount: 2,
              totalServicesCount: 4,
              totalDuration: 255,
              estimatedEndTime: '18:15'
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Cannot access another customer\'s booking request',
  })
  @ApiResponse({
    status: 404,
    description: 'Booking request not found',
  })
  async getCustomerBookingRequestById(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<BookingRequestResponseDto> {
    const customerId = req.user.customerId;
    return this.bookingRequestService.getCustomerBookingRequestById(customerId, id);
  }

  @Get('business-owner')
  @Roles(UserRole.BUSINESS_OWNER)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get business owner booking requests',
    description: `
      Retrieve all booking requests for the authenticated business owner with lifecycle state flags.

      Features:
      - View all customer booking requests for your business
      - Filter by status with support for database and virtual states
      - Filter by assigned staff ID
      - Returns computed lifecycle flags for easy UI rendering (isStaffAssigned, canPay, canCancel, etc.)
      - Paginated results for better performance
      - Complete customer and service details
      - Staff assignment status

      Status Filter Values:
      - pending: All pending requests (with or without staff assigned)
      - staff_assigned: Pending requests with staff assigned (virtual state)
      - approved_otp_generated: Approved by you, awaiting customer arrival with OTP
      - approved_pending_payment: Customer arrival verified, awaiting payment
      - approved: All approved requests (with or without confirmed booking)
      - confirmed: Payment completed, booking created, awaiting customer arrival (virtual state)
      - in-progress: Customer arrived, OTP verified, service started (virtual state)
      - completed: Service finished (virtual state)
      - rejected: Rejected by business owner
      - cancelled: Cancelled by customer (virtual state)

      Important Notes:
      - arrivalOtp field is NOT included in business owner response for security
      - Customer has the arrival OTP in their app
      - Use POST /booking-requests/:id/verify-arrival-otp to verify when customer arrives

      Use Cases:
      - Business owner reviewing pending booking requests
      - Managing booking request approval workflow
      - Filtering approved_otp_generated to see customers expected to arrive
      - Verifying customer arrival with OTP before allowing payment
      - Tracking approved and rejected requests
      - Staff scheduling and assignment
    `,
  })
  @ApiQuery({
    name: 'status',
    description: 'Filter by booking request status (supports database and virtual states: pending, staff_assigned, approved_otp_generated, approved_pending_payment, approved, confirmed, in-progress, completed, rejected, cancelled)',
    enum: ['pending', 'staff_assigned', 'approved_otp_generated', 'approved_pending_payment', 'approved', 'confirmed', 'in-progress', 'completed', 'rejected', 'cancelled'],
    required: false,
  })
  @ApiQuery({
    name: 'staffId',
    description: 'Filter by assigned staff ID - shows only bookings assigned to this staff member',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
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
    description: 'Business owner booking requests retrieved successfully',
    type: BusinessOwnerBookingRequestListResponseDto,
    schema: {
      example: {
        code: 200,
        success: true,
        message: 'Business owner booking requests retrieved successfully',
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            status: 'approved_otp_generated',
            lifecycleState: 'approved_otp_generated',
            requestedDate: '2024-01-15',
            requestedStartTime: '10:00',
            requestedEndTime: '11:30',
            totalEstimatedPrice: 150.00,
            finalPrice: 150.00,
            confirmedBookingId: null,
            isStaffAssigned: true,
            isApproved: true,
            canCancel: true,
            requiresAction: true,
            customer: {
              id: 'cust-123',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
              phone: '+1234567890'
            },
            business: {
              id: 'biz-456',
              shopId: 'SH-001',
              businessName: 'Elite Salon',
              address: '123 Main St, New York'
            },
            assignedStaff: {
              id: 'staff-789',
              firstName: 'Jane',
              lastName: 'Smith'
            },
            services: [
              {
                id: 'svc-req-001',
                quantity: 1,
                estimatedPrice: 75.00,
                estimatedDuration: 45,
                businessService: {
                  id: 'bs-001',
                  customPrice: 75.00,
                  customDurationMinutes: 45,
                  service: {
                    id: 'svc-001',
                    name: 'Premium Haircut',
                    description: 'Professional haircut'
                  }
                }
              }
            ],
            paymentInfo: null
          }
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  async getBusinessOwnerBookingRequests(
    @Request() req: any,
    @Query() query: BookingRequestQueryDto,
  ): Promise<BusinessOwnerBookingRequestListResponseDto> {
    const businessOwnerId = req.user.businessOwnerId;
    return this.bookingRequestService.getBusinessOwnerBookingRequests(businessOwnerId, query);
  }

  @Get('business-owner/:id')
  @Roles(UserRole.BUSINESS_OWNER)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get single booking request by ID for business owner (Detailed)',
    description: `
      Retrieve detailed information for a single booking request by ID.

      **Key Differences from List Endpoint**:
      - Returns single booking request (not array)
      - Includes \`bookingDetails\` object with add-on services breakdown
      - Loads full booking services if confirmed booking exists
      - Detailed financial breakdown and service summary

      **bookingDetails Structure** (only in detail endpoint):
      - \`totalAmount\`: Final total including add-ons and delivery
      - \`originalAmount\`: Original booking request amount
      - \`addOnServicesTotal\`: Sum of add-on services added during service
      - \`deliveryCharge\`: Delivery fee for at-home services
      - \`allServices[]\`: All services (original + add-ons)
      - \`originalServices[]\`: Services from booking request (isAddOn: false)
      - \`addOnServices[]\`: Services added during IN_PROGRESS (isAddOn: true)
      - \`serviceSummary\`: Counts and total duration

      **Add-on Services Tracking**:
      - Each add-on shows: \`customerApproved\`, \`addedAt\`, \`addedByStaffId\`
      - Allows business owner to track what services were added and when
      - Transparent pricing breakdown for commission calculation

      **Security**:
      - Business owner can only access their own booking requests
      - Returns 403 Forbidden if accessing another business's request
      - **OTP fields excluded**: \`otpCode\` and \`arrivalOtp\` not included for security

      **When bookingDetails is null**:
      - If booking request hasn't been approved yet (no confirmed booking)
      - If payment hasn't been completed yet
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Booking Request UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Booking request details retrieved successfully with add-on services breakdown',
    type: BusinessOwnerBookingRequestResponseDto,
    schema: {
      example: {
        code: 200,
        success: true,
        message: 'Booking request retrieved successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          status: 'approved',
          lifecycleState: 'in_progress',
          requestedDate: '2024-03-15',
          requestedStartTime: '14:00',
          requestedEndTime: '16:00',
          totalEstimatedPrice: 800.00,
          finalPrice: 800.00,
          customer: {
            id: 'cust-001',
            firstName: 'Priya',
            lastName: 'Sharma',
            email: 'priya@example.com',
            phone: '+919876543210'
          },
          services: [
            {
              id: 'service-req-001',
              quantity: 1,
              estimatedPrice: 500.00,
              estimatedDuration: 60
            }
          ],
          confirmedBookingId: 'booking-001',
          bookingStatus: 'in-progress',
          bookingDetails: {
            totalAmount: 4300.00,
            originalAmount: 800.00,
            addOnServicesTotal: 3500.00,
            deliveryCharge: 0,
            paymentCompleted: false,
            allServices: [
              {
                id: 'bs-001',
                serviceName: "Women's Haircut",
                price: 500.00,
                durationMinutes: 60,
                isAddOn: false
              },
              {
                id: 'bs-002',
                serviceName: 'Hair Coloring (Full)',
                price: 2500.00,
                durationMinutes: 120,
                isAddOn: true,
                addedAt: '2024-03-15T14:30:00Z',
                addedByStaffId: 'staff-002',
                customerApproved: true
              }
            ],
            originalServices: [
              {
                id: 'bs-001',
                serviceName: "Women's Haircut",
                price: 500.00,
                isAddOn: false
              }
            ],
            addOnServices: [
              {
                id: 'bs-002',
                serviceName: 'Hair Coloring (Full)',
                price: 2500.00,
                isAddOn: true,
                addedAt: '2024-03-15T14:30:00Z',
                addedByStaffId: 'staff-002',
                customerApproved: true
              }
            ],
            serviceSummary: {
              originalServicesCount: 2,
              addOnServicesCount: 2,
              totalServicesCount: 4,
              totalDuration: 255,
              estimatedEndTime: '18:15'
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Cannot access another business owner\'s booking request',
  })
  @ApiResponse({
    status: 404,
    description: 'Booking request not found',
  })
  async getBusinessOwnerBookingRequestById(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<BusinessOwnerBookingRequestResponseDto> {
    const businessOwnerId = req.user.businessOwnerId;
    return this.bookingRequestService.getBusinessOwnerBookingRequestById(businessOwnerId, id);
  }

  @Patch(':id/assign-staff')
  @Roles(UserRole.BUSINESS_OWNER)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Assign staff to booking request',
    description: `
      Assign a staff member to a pending booking request with optional time adjustments.

      Features:
      - Assign specific staff member to the booking request
      - Optionally adjust start and end times
      - Validates staff belongs to your business
      - Checks staff availability for the requested time
      - Validates against staff working hours

      Business Rules:
      - Only pending booking requests can be assigned staff
      - Staff must belong to the business owner
      - Staff must be available on the requested day
      - Adjusted times must fit within staff working hours

      Workflow:
      1. Business owner reviews booking request
      2. Selects appropriate staff member
      3. Optionally adjusts timing based on availability
      4. System validates assignment
      5. Request is ready for final approval
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Booking Request ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: AssignStaffDto,
    description: 'Staff assignment data with optional time adjustments',
  })
  @ApiResponse({
    status: 200,
    description: 'Staff assigned successfully',
    type: BookingRequestResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid assignment or staff not available',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - can only manage own business requests',
  })
  @ApiResponse({
    status: 404,
    description: 'Booking request or staff not found',
  })
  async assignStaff(
    @Request() req: any,
    @Param('id') bookingRequestId: string,
    @Body() assignStaffDto: AssignStaffDto,
  ): Promise<BookingRequestResponseDto> {
    const businessOwnerId = req.user.businessOwnerId;
    return this.bookingRequestService.assignStaff(bookingRequestId, businessOwnerId, assignStaffDto);
  }

  @Patch(':id/approve')
  @Roles(UserRole.BUSINESS_OWNER)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Approve booking request and generate arrival OTP',
    description: `
      Approve a booking request and generate arrival OTP sent to customer.

      Features:
      - Approve pending booking request with assigned staff
      - Optionally adjust final pricing
      - Add business owner notes
      - Generates 6-digit arrival OTP sent to customer
      - OTP is NOT returned in response (sent to customer directly)

      Business Rules:
      - Only pending requests can be approved
      - Staff must be assigned before approval
      - Generates arrival OTP sent to customer via SMS/notification
      - Business owner verifies OTP when customer arrives
      - Status changes to APPROVED_OTP_GENERATED

      Workflow:
      1. Business owner reviews assigned booking request
      2. Optionally adjusts final price
      3. Adds any special notes
      4. System generates arrival OTP and sends to customer
      5. Customer arrives and shows OTP to business owner
      6. Business owner verifies OTP before customer can pay
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Booking Request ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: ApproveBookingRequestDto,
    description: 'Approval data with optional price adjustment and notes',
  })
  @ApiResponse({
    status: 200,
    description: 'Booking request approved successfully. Arrival OTP generated for customer verification.',
    type: BookingRequestResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot approve request or staff not assigned',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - can only manage own business requests',
  })
  @ApiResponse({
    status: 404,
    description: 'Booking request not found',
  })
  async approveBookingRequest(
    @Request() req: any,
    @Param('id') bookingRequestId: string,
    @Body() approveBookingRequestDto: ApproveBookingRequestDto,
  ): Promise<BookingRequestResponseDto> {
    const businessOwnerId = req.user.businessOwnerId;
    return this.bookingRequestService.approveBookingRequest(bookingRequestId, businessOwnerId, approveBookingRequestDto);
  }

  @Patch(':id/reject')
  @Roles(UserRole.BUSINESS_OWNER)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Reject booking request',
    description: `
      Reject a booking request with a reason.

      Features:
      - Reject pending booking request
      - Provide clear rejection reason for customer
      - Updates request status to rejected
      - Customer can view rejection reason

      Business Rules:
      - Only pending requests can be rejected
      - Rejection reason is required
      - No confirmed booking is created

      Use Cases:
      - Staff not available at requested time
      - Business closed on requested date
      - Special requirements cannot be met
      - Customer booking conflicts
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Booking Request ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: RejectBookingRequestDto,
    description: 'Rejection data with reason',
  })
  @ApiResponse({
    status: 200,
    description: 'Booking request rejected successfully',
    type: BookingRequestResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot reject request or invalid status',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - can only manage own business requests',
  })
  @ApiResponse({
    status: 404,
    description: 'Booking request not found',
  })
  async rejectBookingRequest(
    @Request() req: any,
    @Param('id') bookingRequestId: string,
    @Body() rejectBookingRequestDto: RejectBookingRequestDto,
  ): Promise<BookingRequestResponseDto> {
    const businessOwnerId = req.user.businessOwnerId;
    return this.bookingRequestService.rejectBookingRequest(bookingRequestId, businessOwnerId, rejectBookingRequestDto);
  }

  @Post(':id/verify-arrival-otp')
  @Roles(UserRole.BUSINESS_OWNER)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify customer arrival OTP (Business Owner Only)',
    description: `
      Verify the customer's arrival OTP when they arrive at the shop, unlocking payment capability.

      **Authentication Required - Business Owner Only**

      Flow:
      1. Business owner approves booking request → arrival OTP sent to customer
      2. Customer receives OTP (via SMS/notification)
      3. Customer arrives at the shop and shows/tells OTP to barber
      4. Business owner enters the OTP in their app (calls this endpoint)
      5. System validates OTP and changes status to APPROVED_PENDING_PAYMENT
      6. Customer can now proceed with payment (online or COD)

      Validations:
      - OTP must match exactly (6 digits)
      - Booking request must be in APPROVED_OTP_GENERATED status
      - Business owner must own the booking request
      - OTP can only be verified once

      Use Cases:
      - Confirm customer physically arrived at shop
      - Verify customer identity before allowing payment
      - Prevents payment for bookings customer won't attend
      - Reduces no-shows and fraudulent bookings
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Booking Request ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: VerifyArrivalOtpDto,
    description: '6-digit arrival OTP code provided by customer',
    examples: {
      valid: {
        summary: 'Valid OTP from customer',
        value: {
          otpCode: '123456',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Customer arrival verified successfully. Customer can now proceed with payment.',
    type: BookingRequestResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid OTP code or booking in wrong status',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - can only verify OTP for own business booking requests',
  })
  @ApiResponse({
    status: 404,
    description: 'Booking request not found',
  })
  async verifyArrivalOtp(
    @Request() req: any,
    @Param('id') bookingRequestId: string,
    @Body() verifyOtpDto: VerifyArrivalOtpDto,
  ): Promise<BookingRequestResponseDto> {
    const businessOwnerId = req.user.businessOwnerId;
    return this.bookingRequestService.verifyArrivalOtp(
      bookingRequestId,
      businessOwnerId,
      verifyOtpDto.otpCode,
    );
  }

  @Delete(':id')
  @Roles(UserRole.CUSTOMER)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Cancel booking request (Customer)',
    description: `
      Cancel or withdraw a booking request before payment is completed.

      Features:
      - Customer can cancel their own pending or approved booking requests
      - Cannot cancel after payment is processed and booking is confirmed
      - Cannot cancel if already rejected by business owner
      - Frees up business owner's time slot
      - Optional cancellation reason for business owner reference

      Business Rules:
      - Only booking request owner can cancel
      - Can cancel if status is pending or approved_pending_payment
      - Cannot cancel after confirmedBooking is created (payment completed)
      - Cannot cancel already rejected requests
      - Cancellation is permanent (no undo)

      Use Cases:
      - Customer changed their mind
      - Found another salon
      - Scheduling conflict
      - No longer need the service
      - Want to book different services

      After Payment:
      If payment has been completed, you must cancel the confirmed booking
      instead using DELETE /api/v1/bookings/{bookingId}
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Booking Request ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: 'object',
    description: 'Optional cancellation data',
    required: false,
    schema: {
      type: 'object',
      properties: {
        cancellationReason: {
          type: 'string',
          description: 'Optional reason for cancellation',
          example: 'Schedule conflict - need to reschedule',
          maxLength: 500,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Booking request cancelled successfully',
    type: BookingRequestResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot cancel - already rejected or payment completed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - can only cancel own booking requests',
  })
  @ApiResponse({
    status: 404,
    description: 'Booking request not found',
  })
  async cancelBookingRequest(
    @Request() req: any,
    @Param('id') bookingRequestId: string,
    @Body() cancelDto: { cancellationReason?: string } = {},
  ): Promise<BookingRequestResponseDto> {
    const customerId = req.user.customerId;
    return this.bookingRequestService.cancelBookingRequest(
      bookingRequestId,
      customerId,
      cancelDto.cancellationReason
    );
  }

  @Post('bookings/:bookingId/verify-otp')
  @Roles(UserRole.BUSINESS_OWNER)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify OTP and start service (Business Owner Only)',
    description: `
      Verify customer's OTP code and automatically start the service.

      **Authentication Required - Business Owner Only**
      Only the business owner can verify OTP when customer arrives.

      Flow:
      1. Customer arrives at salon/spa with booking confirmation
      2. Customer provides 6-digit OTP to business owner/receptionist
      3. Business owner enters OTP in their app (requires login)
      4. System validates OTP and booking belongs to this business
      5. Service starts automatically
      6. Booking status changes: CONFIRMED → IN_PROGRESS

      Validations:
      - OTP must match exactly (6 digits)
      - Booking must be in CONFIRMED status
      - Booking must belong to authenticated business owner
      - OTP can only be verified once
      - Service starts immediately upon successful verification

      Use Cases:
      - Customer check-in at salon/spa
      - Service initiation with business owner authentication
      - Secure booking verification
      - Track who verified the booking
    `,
  })
  @ApiParam({
    name: 'bookingId',
    description: 'Booking ID (UUID) from booking confirmation',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: VerifyBookingOtpDto,
    description: '6-digit OTP code provided by customer',
    examples: {
      valid: {
        summary: 'Valid OTP',
        value: {
          otpCode: '123456',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'OTP verified successfully. Service started.',
    type: BookingResponseDto,
    schema: {
      example: {
        code: 200,
        success: true,
        message: 'OTP verified successfully. Service started.',
        data: {
          id: '345e6789-e01f-23g4-h567-890123456789',
          appointmentDate: '2024-01-15',
          startTime: '10:30',
          endTime: '11:30',
          status: 'in-progress',
          serviceLocation: 'in-salon',
          totalAmount: 75.5,
          specialRequests: 'Customer prefers organic products',
          createdAt: '2024-01-10T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          customer: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '+1234567890',
          },
          business: {
            id: '456e7890-e12b-34c5-d678-901234567890',
            businessName: 'Elite Hair Salon',
            address: '123 Main St, New York, NY',
            phone: '+1987654321',
          },
          staff: {
            id: '789e0123-e45f-67g8-h901-234567890123',
            firstName: 'Jane',
            lastName: 'Smith',
            profilePic: 'uploads/staff/jane-smith.jpg',
            profilePicCdnUrl: 'https://cdn.example.com/jane-smith.jpg',
          },
          service: {
            id: '012e3456-e78f-90g1-h234-567890123456',
            name: 'Premium Hair Cut',
            description: 'Professional hair cutting service with styling',
            defaultDuration: 60,
            basePrice: 75.5,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid OTP code or booking in wrong status',
    schema: {
      examples: {
        invalidOtp: {
          summary: 'Invalid OTP',
          value: {
            statusCode: 400,
            message: 'Invalid OTP code',
            error: 'Bad Request',
          },
        },
        alreadyStarted: {
          summary: 'Already started',
          value: {
            statusCode: 400,
            message: 'Service has already been started',
            error: 'Bad Request',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - booking does not belong to this business',
  })
  @ApiResponse({
    status: 404,
    description: 'Booking not found',
  })
  async verifyOtpAndStartService(
    @Request() req: any,
    @Param('bookingId') bookingId: string,
    @Body() verifyOtpDto: VerifyBookingOtpDto,
  ): Promise<BookingResponseDto> {
    const businessOwnerId = req.user.businessOwnerId;
    return this.bookingService.verifyOtpAndStartService(
      bookingId,
      verifyOtpDto.otpCode,
      businessOwnerId,
    );
  }

  @Post('bookings/:bookingId/complete-service')
  @Roles(UserRole.BUSINESS_OWNER)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Complete service (Business Owner Only)',
    description: `
      Mark a service as completed after finishing the work.

      **Authentication Required - Business Owner Only**

      Flow:
      1. Service is completed (haircut, spa treatment, etc.)
      2. Business owner clicks "Complete Service" in their app
      3. System validates booking belongs to business owner
      4. System changes booking status to COMPLETED
      5. Service completion timestamp recorded

      Validations:
      - Booking must be in IN_PROGRESS status
      - Booking must belong to authenticated business owner
      - Must verify OTP before completing (service must be started)

      Use Cases:
      - Service completion tracking
      - Time management and metrics
      - Performance analytics
      - Customer billing trigger
    `,
  })
  @ApiParam({
    name: 'bookingId',
    description: 'Booking ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: CompleteServiceDto,
    description: 'Optional completion notes',
    required: false,
    examples: {
      withNotes: {
        summary: 'With completion notes',
        value: {
          notes: 'Customer satisfied with the service. Applied special hair treatment.',
        },
      },
      withoutNotes: {
        summary: 'Without notes',
        value: {},
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Service completed successfully',
    type: BookingResponseDto,
    schema: {
      example: {
        code: 200,
        success: true,
        message: 'Service completed successfully',
        data: {
          id: '345e6789-e01f-23g4-h567-890123456789',
          appointmentDate: '2024-01-15',
          startTime: '10:30',
          endTime: '11:30',
          status: 'completed',
          serviceLocation: 'in-salon',
          totalAmount: 75.5,
          specialRequests: 'Customer prefers organic products\n\nCompletion Notes: Customer satisfied with the service',
          createdAt: '2024-01-10T10:30:00Z',
          updatedAt: '2024-01-15T11:30:00Z',
          customer: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '+1234567890',
          },
          business: {
            id: '456e7890-e12b-34c5-d678-901234567890',
            businessName: 'Elite Hair Salon',
            address: '123 Main St, New York, NY',
            phone: '+1987654321',
          },
          staff: {
            id: '789e0123-e45f-67g8-h901-234567890123',
            firstName: 'Jane',
            lastName: 'Smith',
            profilePic: 'uploads/staff/jane-smith.jpg',
            profilePicCdnUrl: 'https://cdn.example.com/jane-smith.jpg',
          },
          service: {
            id: '012e3456-e78f-90g1-h234-567890123456',
            name: 'Premium Hair Cut',
            description: 'Professional hair cutting service with styling',
            defaultDuration: 60,
            basePrice: 75.5,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Service not started yet or already completed',
    schema: {
      example: {
        statusCode: 400,
        message: 'Service has not been started yet. Please verify OTP first.',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - booking does not belong to this business',
  })
  @ApiResponse({
    status: 404,
    description: 'Booking not found',
  })
  async completeService(
    @Request() req: any,
    @Param('bookingId') bookingId: string,
    @Body() completeServiceDto: CompleteServiceDto,
  ): Promise<BookingResponseDto> {
    const businessOwnerId = req.user.businessOwnerId;
    return this.bookingService.completeService(
      bookingId,
      businessOwnerId,
      completeServiceDto.notes,
    );
  }
}