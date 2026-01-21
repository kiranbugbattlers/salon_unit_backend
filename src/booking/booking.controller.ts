import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
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
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { BookingService } from './booking.service';
import {
  CreateBookingDto,
  UpdateBookingDto,
  BookingResponseDto,
  BookingListResponseDto,
  BookingQueryDto,
  AddServicesDto,
  PreviewDeliveryChargeDto,
} from './dto';
import {
  CustomerTransactionHistoryResponseDto,
} from './dto/customer-transaction-history.dto';
import { CustomerAddServicesDto } from './dto/customer-add-services.dto';
import { ApproveAddonResponseDto } from './dto/approve-addon-response.dto';
import { RejectAddonResponseDto } from './dto/reject-addon-response.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('Bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Create a booking request with business services or service package',
    description: `
      Create a booking request for business services or a service package. This creates a REQUEST that requires business owner approval.

      Workflow:
      1. Customer submits booking request with services OR service package
      2. Business owner receives the request in their dashboard
      3. Business owner assigns staff and approves/rejects the request
      4. If approved, actual booking is created with 6-digit OTP
      5. Customer receives confirmation with OTP

      Features:
      - Creates booking REQUEST (not confirmed booking)
      - Supports individual business services OR service packages
      - Service packages apply automatic discounts
      - Optional staff preference (business owner can reassign)
      - Calculates estimated total amount and duration
      - Validates business hours and service availability
      - Requires business owner approval to confirm

      Booking Options:
      1. Individual Services:
         - Provide 'businessServiceIds' array with one or more service IDs
         - Each service is booked once (no quantity needed)
         - Use business service IDs from '/api/v1/business-owner/services' or '/api/v1/public/businesses/{shopId}'

      2. Service Packages:
         - Provide 'servicePackageIds' array with one or more package IDs
         - Each package includes all its services
         - Automatically applies package discount to all services in the package
         - Get package IDs from '/api/v1/public/businesses/{shopId}'

      3. Combination Booking:
         - You can provide BOTH businessServiceIds AND servicePackageIds
         - Example: Book a "Hair & Spa Package" + add extra "Manicure" service
         - Duplicate services are automatically removed (each service booked only once)

      Validation Rules:
      - Must provide at least one service or package
      - Business services/packages must belong to the business and be active
      - Booking time must be within business operating hours
      - Staff preference must belong to the business (if provided)
      - Duplicate services are automatically handled (only booked once)

      Use Cases:
      - Booking multiple individual services
      - Booking one or more service packages with automatic discounts
      - Combining packages with additional individual services
      - Staff preference with business owner final assignment
    `,
  })
  @ApiBody({
    type: CreateBookingDto,
    description: 'Booking request creation data with business services and/or service packages',
    examples: {
      'Individual Services': {
        value: {
          businessOwnerId: '123e4567-e89b-12d3-a456-426614174000',
          requestedDate: '2024-01-15',
          requestedStartTime: '10:30',
          requestedEndTime: '11:30',
          requestedStaffId: '456e7890-e12b-34c5-d678-901234567890',
          serviceLocation: 'in-salon',
          specialRequests: 'Please use gentle products, I have sensitive skin',
          businessServiceIds: [
            '123e4567-e89b-12d3-a456-426614174000',
            '456e7890-e12b-34c5-d678-901234567890'
          ]
        }
      },
      'Service Packages': {
        value: {
          businessOwnerId: '123e4567-e89b-12d3-a456-426614174000',
          requestedDate: '2024-01-15',
          requestedStartTime: '10:30',
          requestedEndTime: '12:30',
          serviceLocation: 'at-home',
          specialRequests: 'Please bring all necessary equipment for home service',
          servicePackageIds: [
            '789e0123-e45f-67g8-h901-234567890123'
          ]
        }
      },
      'Combined (Services + Packages)': {
        value: {
          businessOwnerId: '123e4567-e89b-12d3-a456-426614174000',
          requestedDate: '2024-01-15',
          requestedStartTime: '10:30',
          requestedEndTime: '13:00',
          requestedStaffId: '456e7890-e12b-34c5-d678-901234567890',
          serviceLocation: 'in-salon',
          specialRequests: 'Combining package with additional service, please schedule accordingly',
          businessServiceIds: [
            '123e4567-e89b-12d3-a456-426614174000'
          ],
          servicePackageIds: [
            '789e0123-e45f-67g8-h901-234567890123'
          ]
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Booking request created successfully. Awaiting business owner approval.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Booking request created successfully. Business owner will review and assign staff.' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
            status: { type: 'string', example: 'pending' },
            appointmentDate: { type: 'string', format: 'date', example: '2024-01-15' },
            startTime: { type: 'string', example: '10:30' },
            endTime: { type: 'string', example: '11:30' },
            serviceLocation: { type: 'string', example: 'in-salon' },
            specialRequests: { type: 'string', example: 'Please use gentle products', nullable: true },
            estimatedAmount: { type: 'number', example: 150.00 },
            estimatedDuration: { type: 'number', example: 90 },
            customer: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                email: { type: 'string' },
                phone: { type: 'string' }
              }
            },
            business: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                businessName: { type: 'string' }
              }
            },
            requestedStaff: {
              type: 'object',
              nullable: true,
              properties: {
                id: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' }
              }
            },
            services: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  businessServiceId: { type: 'string' },
                  serviceName: { type: 'string' },
                  estimatedPrice: { type: 'number' },
                  estimatedDuration: { type: 'number' }
                }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data - business services not found or inactive',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 404,
    description: 'Business owner, customer, or staff preference not found',
  })
  async createBooking(
    @CurrentUser() user: CurrentUserData,
    @Body() createBookingDto: CreateBookingDto,
  ): Promise<any> {
    return this.bookingService.createBooking(user.userId, createBookingDto);
  }

  @Post('preview-delivery-charge')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Preview delivery charges before booking',
    description: `
      Calculate delivery charges for at-home services BEFORE creating a booking request.

      **Use Case**: Show delivery charges to customer during service selection/checkout flow.

      **How it works**:
      1. Customer selects services and provides their address (lat/long)
      2. Backend calculates distance from business to customer
      3. Applies business delivery settings (base charge, per-km rate, free delivery rules)
      4. Returns breakdown of charges

      **Free Delivery Rules** (business-specific):
      - Free if order amount ≥ configured threshold (default: ₹1000)
      - Free if distance ≤ configured radius (default: 5 km)
      - Free if business disabled delivery charges

      **Calculation Formula**:
      - Distance calculated using Haversine formula
      - Chargeable distance = Total distance - Free delivery radius
      - Delivery charge = Base charge + (Chargeable distance × Per km rate)

      **Error Cases**:
      - Distance exceeds maximum delivery radius (default: 20 km)
      - Business address not found
      - Invalid coordinates

      **Authentication Required - Customer**
    `,
  })
  @ApiBody({ type: PreviewDeliveryChargeDto })
  @ApiResponse({
    status: 200,
    description: 'Delivery charge calculated successfully',
    schema: {
      example: {
        success: true,
        message: 'Delivery charge preview calculated successfully',
        data: {
          distanceKm: 8.5,
          baseCharge: 0,
          distanceCharge: 35.0,
          totalDeliveryCharge: 35.0,
          isFreeDelivery: false,
          breakdown: 'Distance: 8.50 km\nChargeable distance: 3.50 km (after 5 km free)\nDistance charge: 3.50 km × ₹10/km = ₹35.00\nTotal delivery charge: ₹35.00',
          estimatedOrderAmount: 1200.0,
          finalTotal: 1235.0,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid coordinates or distance exceeds maximum',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 404,
    description: 'Business not found or business address not configured',
  })
  async previewDeliveryCharge(
    @Body() previewDto: PreviewDeliveryChargeDto,
  ): Promise<any> {
    return this.bookingService.previewDeliveryCharge(
      previewDto.businessOwnerId,
      previewDto.customerLatitude,
      previewDto.customerLongitude,
      previewDto.businessServiceIds,
      previewDto.servicePackageIds,
    );
  }

  @Post(':bookingId/add-services')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Add services to an in-progress booking',
    description: `
      Add additional services (add-ons) to a booking that is currently in progress.

      **Authentication Required - Customer or Business Owner**

      Flow:
      1. Service has started (booking status: IN_PROGRESS)
      2. Staff identifies customer needs additional services
      3. Staff or customer calls this endpoint with new service IDs
      4. System adds services to booking and updates total amount
      5. Customer must approve the add-ons (customerApproved: true)
      6. Updated total includes original + add-on services

      Features:
      - Add individual business services OR service packages
      - Automatic duplicate prevention (services added only once)
      - Updates booking.totalAmount and booking.addOnServicesTotal
      - Maintains original service + all add-ons in bookingServices table
      - Customer approval tracking for transparency

      Prerequisites:
      - Booking must be in IN_PROGRESS status (service started)
      - Cannot add services to completed or cancelled bookings
      - Customer must approve add-on services (customerApproved: true)

      Use Cases:
      - Customer requests additional treatment during service
      - Staff recommends complementary service
      - Package upgrade during service
    `,
  })
  @ApiParam({
    name: 'bookingId',
    description: 'Booking ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: AddServicesDto,
    description: 'Add-on services to add to booking',
    examples: {
      'Business Owner Adds (Pending Approval)': {
        value: {
          businessServiceIds: [
            '123e4567-e89b-12d3-a456-426614174000'
          ],
          customerApproved: false,
          notes: 'Recommended during service - requires customer approval'
        },
        summary: 'Business owner adds services (pending customer approval)'
      },
      'Customer Adds (Auto-Approved)': {
        value: {
          businessServiceIds: [
            '456e7890-e12b-34c5-d678-901234567890'
          ],
          customerApproved: true,
          notes: 'Customer requested hair coloring after consultation'
        },
        summary: 'Customer adds services (automatically approved)'
      },
      'Service Package Add-On': {
        value: {
          servicePackageIds: ['789e0123-e45f-67g8-h901-234567890123'],
          customerApproved: true,
          notes: 'Upgraded to premium spa package'
        },
        summary: 'Adding a service package as add-on'
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Add-on services added successfully',
    schema: {
      oneOf: [
        {
          description: 'Business Owner adds services (pending approval)',
          type: 'object',
          example: {
            success: true,
            message: 'Successfully added 1 add-on service(s) pending customer approval',
            data: {
              bookingId: '123e4567-e89b-12d3-a456-426614174000',
              addedServices: [
                {
                  serviceName: 'Hair Coloring',
                  price: 150,
                  duration: 45,
                  packageName: null,
                  customerApproved: false
                }
              ],
              addOnTotal: 0,
              newTotalAmount: 500,
              pendingApproval: true
            }
          }
        },
        {
          description: 'Customer adds services (auto-approved)',
          type: 'object',
          example: {
            success: true,
            message: 'Successfully added 1 add-on service(s) to the booking',
            data: {
              bookingId: '123e4567-e89b-12d3-a456-426614174000',
              addedServices: [
                {
                  serviceName: 'Hair Coloring',
                  price: 150,
                  duration: 45,
                  packageName: null,
                  customerApproved: true
                }
              ],
              addOnTotal: 150,
              newTotalAmount: 650,
              pendingApproval: false
            }
          }
        }
      ]
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - booking not in progress or customer approval missing',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - can only add services to own bookings',
  })
  @ApiResponse({
    status: 404,
    description: 'Booking or services not found',
  })
  async addServices(
    @CurrentUser() user: CurrentUserData,
    @Param('bookingId') bookingId: string,
    @Body() addServicesDto: AddServicesDto,
  ): Promise<BookingResponseDto> {
    return this.bookingService.addServicesToBooking(bookingId, user.businessOwnerId || user.customerId, addServicesDto);
  }

  @Post(':bookingId/customer-add-services')
  @Roles(UserRole.CUSTOMER)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Customer adds services to their in-progress booking',
    description: `
      Allows customers to add additional services or packages to their own booking while service is in progress.

      Features:
      - Customer can add services before payment is completed
      - No approval required (customerApproved automatically set to true)
      - Updates booking totalAmount and addOnServicesTotal
      - Duplicate service prevention
      - Applies package discounts if applicable

      Prerequisites:
      - Booking must be IN_PROGRESS (service has started)
      - Payment must NOT be completed yet
      - Customer must own the booking
      - At least one service or package must be provided

      Workflow:
      1. Customer's service is in progress (status: IN_PROGRESS)
      2. Customer decides to add more services
      3. This endpoint adds services without requiring business approval
      4. Booking total is updated with add-on costs
      5. Customer makes payment for updated total amount

      Note: After payment is completed, customers cannot add more services.
      They must contact the salon for post-payment service additions.
    `,
  })
  @ApiParam({
    name: 'bookingId',
    description: 'Booking ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: CustomerAddServicesDto,
    description: 'Services and/or packages to add to the booking',
  })
  @ApiResponse({
    status: 200,
    description: 'Services successfully added to booking',
    type: BookingResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - booking not in progress, payment completed, or no services provided',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - can only add services to own bookings',
  })
  @ApiResponse({
    status: 404,
    description: 'Booking or services not found',
  })
  async customerAddServices(
    @CurrentUser() user: CurrentUserData,
    @Param('bookingId') bookingId: string,
    @Body() customerAddServicesDto: CustomerAddServicesDto,
  ): Promise<BookingResponseDto> {
    // Service layer automatically sets customerApproved based on who's adding (customer=true, owner=false)
    // Pass customerId to indicate this is a customer request
    return this.bookingService.addServicesToBooking(
      bookingId,
      null, // businessOwnerId not needed for customer flow
      customerAddServicesDto, // DTO is compatible with AddServicesDto (no customerApproved field needed)
      user.customerId, // Pass customerId for ownership verification
    );
  }

  @Get(':customerId')
  @Public()
  @ApiOperation({
    summary: 'Get customer bookings',
    description: `
      Retrieve all bookings for a specific customer with filtering options.

      Features:
      - Paginated results with configurable page size
      - Filter by booking status (pending, confirmed, etc.)
      - Filter by specific appointment date
      - Filter by date range (from/to dates)
      - Ordered by appointment date (newest first)
      - Includes full booking details with related entities

      Security:
      - Public endpoint - no authentication required
      - Direct access via customer ID parameter

      Use Cases:
      - Customer viewing their booking history
      - Filtering upcoming appointments
      - Checking booking status and details
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
  @ApiResponse({
    status: 200,
    description: 'Customer bookings retrieved successfully',
    type: BookingListResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Customer not found',
  })
  async getCustomerBookings(
    @Param('customerId') customerId: string,
    @Query() query: BookingQueryDto,
  ): Promise<BookingListResponseDto> {
    return this.bookingService.getCustomerBookings(customerId, query);
  }

  @Patch(':bookingId')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Update/reschedule a booking',
    description: `
      Update an existing booking with new details or reschedule to a different time.

      Features:
      - Reschedule appointment date and time
      - Update service location (in-salon/at-home)
      - Modify booking status
      - Update notes and pricing
      - Validates new time slot availability if rescheduling
      - Ensures updates comply with business rules

      Validation Rules:
      - Only booking owner can update their bookings
      - Cannot update completed or cancelled bookings
      - New time slots must be available if rescheduling
      - Must comply with business and staff working hours
      - Prevents conflicts with existing bookings

      Use Cases:
      - Customer rescheduling an appointment
      - Business updating booking status
      - Modifying service location preference
      - Adding special notes or requests
    `,
  })
  @ApiParam({
    name: 'bookingId',
    description: 'Booking ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: UpdateBookingDto,
    description: 'Booking update data (all fields optional)',
  })
  @ApiResponse({
    status: 200,
    description: 'Booking updated successfully',
    type: BookingResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid update data or cannot update booking in current status',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - can only update own bookings',
  })
  @ApiResponse({
    status: 404,
    description: 'Booking not found',
  })
  async updateBooking(
    @CurrentUser() user: CurrentUserData,
    @Param('bookingId') bookingId: string,
    @Body() updateBookingDto: UpdateBookingDto,
  ): Promise<BookingResponseDto> {
    return this.bookingService.updateBooking(bookingId, user.userId, updateBookingDto);
  }

  @Delete(':bookingId')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Cancel a booking',
    description: `
      Cancel an existing booking by setting its status to 'cancelled'.

      Features:
      - Sets booking status to cancelled
      - Frees up the time slot for other customers
      - Maintains booking record for history
      - Prevents cancellation of completed bookings
      - Ownership validation for security

      Business Rules:
      - Only booking owner can cancel their bookings
      - Cannot cancel already completed bookings
      - Cannot cancel already cancelled bookings
      - Cancelled bookings remain in the system for records

      Use Cases:
      - Customer cancelling an appointment
      - Freeing up time slots
      - Managing no-shows
      - Handling schedule changes
    `,
  })
  @ApiParam({
    name: 'bookingId',
    description: 'Booking ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Booking cancelled successfully',
    type: BookingResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot cancel booking in current status',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - can only cancel own bookings',
  })
  @ApiResponse({
    status: 404,
    description: 'Booking not found',
  })
  async cancelBooking(
    @CurrentUser() user: CurrentUserData,
    @Param('bookingId') bookingId: string,
  ): Promise<BookingResponseDto> {
    return this.bookingService.cancelBooking(bookingId, user.userId);
  }

  @Patch(':bookingId/services/:serviceId/approve')
  @Roles(UserRole.CUSTOMER)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Customer approves a business owner requested add-on service',
    description: `
      Allows customers to approve add-on services that were added by the business owner.

      **Customer Only Endpoint**

      Workflow:
      1. Business owner adds services to IN_PROGRESS booking (services pending approval)
      2. Customer reviews pending add-on services
      3. Customer calls this endpoint to approve specific service
      4. Service is marked as approved (customerApproved: true)
      5. Booking totalAmount and addOnServicesTotal are updated
      6. Approved service will be included in payment

      Prerequisites:
      - Booking must be IN_PROGRESS (service has started)
      - Payment must NOT be completed yet
      - Customer must own the booking
      - Service must be an add-on (isAddOn: true)
      - Service must be pending approval (customerApproved: false)

      Note: Once approved, the service cannot be rejected.
    `,
  })
  @ApiParam({
    name: 'bookingId',
    description: 'Booking ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'serviceId',
    description: 'Booking Service ID (UUID) - the ID of the specific service in booking_services table',
    example: '456e7890-e12b-34c5-d678-901234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Add-on service approved successfully',
    type: ApproveAddonResponseDto,
    schema: {
      example: {
        code: 200,
        success: true,
        message: 'Add-on service "Hair Coloring" approved successfully',
        data: {
          bookingId: '123e4567-e89b-12d3-a456-426614174000',
          totalAmount: 650,
          addOnServicesTotal: 150,
          approvedService: {
            id: '456e7890-e12b-34c5-d678-901234567890',
            serviceName: 'Hair Coloring',
            servicePrice: 150,
            customerApproved: true,
            approvedAt: '2024-01-15T10:30:00.000Z'
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - booking not in progress, payment completed, service already approved, or not an add-on service',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - can only approve services for own bookings',
  })
  @ApiResponse({
    status: 404,
    description: 'Booking or service not found',
  })
  async approveAddOnService(
    @CurrentUser() user: CurrentUserData,
    @Param('bookingId') bookingId: string,
    @Param('serviceId') serviceId: string,
  ): Promise<ApproveAddonResponseDto> {
    return this.bookingService.approveAddOnService(user.customerId, bookingId, serviceId);
  }

  @Delete(':bookingId/services/:serviceId')
  @Roles(UserRole.CUSTOMER)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Customer rejects a business owner requested add-on service',
    description: `
      Allows customers to reject/remove add-on services that were added by the business owner.

      **Customer Only Endpoint**

      Workflow:
      1. Business owner adds services to IN_PROGRESS booking (services pending approval)
      2. Customer reviews pending add-on services
      3. Customer calls this endpoint to reject specific service
      4. Service is permanently deleted from booking_services table
      5. No amount changes needed (service was never added to totals)

      Prerequisites:
      - Booking must be IN_PROGRESS (service has started)
      - Payment must NOT be completed yet
      - Customer must own the booking
      - Service must be an add-on (isAddOn: true)
      - Service must be pending approval (customerApproved: false)

      Note: Once rejected, the service is permanently removed. Business owner can add it again if needed.
    `,
  })
  @ApiParam({
    name: 'bookingId',
    description: 'Booking ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'serviceId',
    description: 'Booking Service ID (UUID) - the ID of the specific service in booking_services table',
    example: '456e7890-e12b-34c5-d678-901234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Add-on service rejected and removed successfully',
    type: RejectAddonResponseDto,
    schema: {
      example: {
        code: 200,
        success: true,
        message: 'Add-on service "Hair Coloring" rejected and removed successfully',
        data: {
          bookingId: '123e4567-e89b-12d3-a456-426614174000',
          totalAmount: 500,
          addOnServicesTotal: 0,
          removedService: {
            id: '456e7890-e12b-34c5-d678-901234567890',
            serviceName: 'Hair Coloring',
            servicePrice: 150
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - booking not in progress, payment completed, service already approved, or not an add-on service',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - can only reject services for own bookings',
  })
  @ApiResponse({
    status: 404,
    description: 'Booking or service not found',
  })
  async rejectAddOnService(
    @CurrentUser() user: CurrentUserData,
    @Param('bookingId') bookingId: string,
    @Param('serviceId') serviceId: string,
  ): Promise<RejectAddonResponseDto> {
    return this.bookingService.rejectAddOnService(user.customerId, bookingId, serviceId);
  }

  @Get('customer-transaction-history')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get customer transaction history (day-wise)',
    description: `
      Retrieve transaction history for a customer grouped by date.
      
      Features:
      - Day-wise grouping of transactions
      - Includes booking ID, customer name, amount, payment method, and date/time
      - Optional date range filtering
      - Total amount and transaction count per day
      - Overall totals across all periods
      
      Payment Methods:
      - CASH: Cash on delivery (COD)
      - ONLINE: Online payments (card, UPI, wallet, etc.)
      
      Use Cases:
      - Customer viewing their booking history
      - Financial reporting and analysis
      - Tracking spending patterns
    `,
  })
  @ApiQuery({
    name: 'customerId',
    required: false,
    description: 'Customer ID (if not provided, uses current user\'s customer ID)',
    type: String,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date for filtering (YYYY-MM-DD format)',
    type: String,
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date for filtering (YYYY-MM-DD format)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction history retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        customerId: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
        dayWiseHistory: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              date: { type: 'string', format: 'date', example: '2024-01-15' },
              transactions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    bookingId: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
                    customerName: { type: 'string', example: 'John Doe' },
                    bookingAmount: { type: 'number', example: 150.00 },
                    paymentMethod: { type: 'string', enum: ['CASH', 'ONLINE'], example: 'ONLINE' },
                    bookingDateTime: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' }
                  }
                }
              },
              totalAmount: { type: 'number', example: 300.00 },
              transactionCount: { type: 'number', example: 2 }
            }
          }
        },
        totalAmount: { type: 'number', example: 750.00 },
        totalTransactions: { type: 'number', example: 5 }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - can only view own transaction history',
  })
  @ApiResponse({
    status: 404,
    description: 'Customer not found',
  })
  async getCustomerTransactionHistory(
    @CurrentUser() user: CurrentUserData,
    @Query('customerId') customerId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<CustomerTransactionHistoryResponseDto> {
    // Use provided customerId or current user's customer ID
    const targetCustomerId = customerId || user.customerId;
    
    // Only allow users to view their own history unless they are admins
    if (customerId && customerId !== user.customerId && !user.roles.includes(UserRole.ADMIN)) {
      throw new ForbiddenException('You can only view your own transaction history');
    }

    // Parse date strings if provided
    const parsedStartDate = startDate ? new Date(startDate) : undefined;
    const parsedEndDate = endDate ? new Date(endDate) : undefined;

    return this.bookingService.getCustomerTransactionHistory(targetCustomerId, parsedStartDate, parsedEndDate);
  }
}