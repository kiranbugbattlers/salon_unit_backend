import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums';
import { PaymentService } from './payment.service';
import {
  CreatePaymentOrderDto,
  VerifyPaymentDto,
  PaymentOrderResponseDto,
  VerifyPaymentResponseDto,
  PaymentDetailsResponseDto,
  ConfirmCodBookingDto,
} from './dto';

@ApiTags('Payment Management')
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-order')
  @Roles(UserRole.CUSTOMER)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Create Razorpay payment order (Customer Only)',
    description: `
      Create a Razorpay payment order for a booking that is currently in progress.

      **Authentication Required - Customer Only**

      New Flow (Simplified 8-Step):
      1. Business owner approves booking request → Booking created with service OTP
      2. Customer verifies service OTP → Service starts (status: IN_PROGRESS)
      3. Service in progress, customer can add additional services
      4. Customer calls this endpoint to create payment order during/after service
      5. Backend creates Razorpay order including base + add-ons + delivery
      6. Flutter app opens Razorpay SDK with order details
      7. Customer completes payment via Razorpay
      8. After payment verification, booking can be completed

      Prerequisites:
      - Booking must be in IN_PROGRESS status (service started)
      - Customer must have verified service OTP
      - Customer must own the booking
      - No successful payment should exist for this booking

      Total Amount Includes:
      - Base service price
      - Add-on services added during service
      - Delivery charge (for at-home services)

      Response includes:
      - Razorpay Order ID
      - Amount in paise (₹500 = 50000 paise)
      - Razorpay Key ID (for Flutter SDK)
      - Business name and service description
    `,
  })
  @ApiBody({
    type: CreatePaymentOrderDto,
    description: 'Booking ID (not booking request ID)',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment order created successfully',
    type: PaymentOrderResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - booking not in correct status or payment already exists',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - can only create payment for own bookings',
  })
  @ApiResponse({
    status: 404,
    description: 'Booking request not found',
  })
  async createPaymentOrder(
    @Request() req: any,
    @Body() createDto: CreatePaymentOrderDto,
  ): Promise<PaymentOrderResponseDto> {
    const customerId = req.user.customerId;
    return this.paymentService.createPaymentOrder(customerId, createDto);
  }

  @Post('verify')
  @Roles(UserRole.CUSTOMER)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify payment and mark booking as paid (Customer Only)',
    description: `
      Verify Razorpay payment signature and update booking payment status.

      **Authentication Required - Customer Only**

      Flow:
      1. Customer completes payment in Razorpay SDK (Flutter)
      2. Razorpay SDK returns payment details to Flutter app
      3. Flutter app calls this endpoint with payment details
      4. Backend verifies payment signature (HMAC SHA256)
      5. If valid, marks booking.paymentCompleted = true
      6. Returns existing booking OTP to customer

      Security:
      - Payment signature is verified using HMAC SHA256
      - Signature = HMAC(order_id|payment_id, razorpay_secret)
      - Only valid payments update booking status
      - Idempotent - prevents duplicate payment recording

      After Success:
      - booking.paymentCompleted: true
      - booking.paymentMethod: Updated with payment method used
      - Payment status: SUCCESS
      - Service can be completed after payment

      Note:
      - Booking already exists (created at approval time)
      - This endpoint does NOT create a new booking
      - Only updates payment status of existing booking
    `,
  })
  @ApiBody({
    type: VerifyPaymentDto,
    description: 'Payment verification details from Razorpay',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment verified successfully. Booking confirmed.',
    type: VerifyPaymentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - signature verification failed or payment already verified',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - can only verify payment for own bookings',
  })
  @ApiResponse({
    status: 404,
    description: 'Booking request or payment not found',
  })
  async verifyPayment(
    @Request() req: any,
    @Body() verifyDto: VerifyPaymentDto,
  ): Promise<VerifyPaymentResponseDto> {
    const customerId = req.user.customerId;
    return this.paymentService.verifyPayment(customerId, verifyDto);
  }

  @Post('confirm-cod')
  @Roles(UserRole.CUSTOMER)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirm COD payment for in-progress booking (Customer Only)',
    description: `
      Confirm Cash on Delivery (COD) payment for a booking currently in progress.

      **Authentication Required - Customer Only**

      COD Payment Flow (New 8-Step):
      1. Business owner approves booking request → Booking created with service OTP
      2. Customer verifies service OTP → Service starts (status: IN_PROGRESS)
      3. Service in progress, staff can add additional services
      4. When service nears completion, customer chooses COD payment
      5. Customer calls this endpoint to confirm COD payment
      6. System marks booking.paymentCompleted = true with paymentMethod: 'cod'
      7. Customer pays cash to business owner AFTER service
      8. Service can now be completed (requires payment)

      Prerequisites:
      - Booking must be in IN_PROGRESS status (service started)
      - Customer must have verified service OTP
      - Customer must own the booking
      - No payment should be completed yet

      Total Amount (COD):
      - Base service price
      - Add-on services added during service
      - Delivery charge (for at-home services)

      COD Wallet Impact (on service completion):
      - Business Owner: Wallet debited for commission (can go negative)
      - Customer: Wallet credited with reward points
      - COD Transaction: Created for tracking cash collection
      - Business owner owes commission until settled

      Difference from Online Payment:
      - Online: Customer pays via Razorpay → money collected by platform
      - COD: Customer pays cash to business → tracked for commission calculation
    `,
  })
  @ApiBody({
    type: ConfirmCodBookingDto,
    description: 'Booking ID (not booking request ID) to confirm with COD payment',
  })
  @ApiResponse({
    status: 200,
    description: 'COD booking confirmed successfully. Customer will pay cash after service.',
    type: VerifyPaymentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - OTP not verified or booking in wrong status',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - can only confirm COD for own bookings',
  })
  @ApiResponse({
    status: 404,
    description: 'Booking request not found',
  })
  async confirmCodBooking(
    @Request() req: any,
    @Body() confirmDto: ConfirmCodBookingDto,
  ): Promise<VerifyPaymentResponseDto> {
    const customerId = req.user.customerId;
    return this.paymentService.confirmCodBooking(customerId, confirmDto);
  }

  @Get('booking-request/:id')
  @Roles(UserRole.CUSTOMER, UserRole.BUSINESS_OWNER)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get payment details by booking request ID',
    description: `
      Retrieve payment information for a specific booking request.

      Use Cases:
      - Customer checking payment status
      - Business owner viewing payment confirmation
      - Checking payment method used (online vs COD)
      - Retrieving payment transaction ID
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Booking Request ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment details retrieved successfully',
    type: PaymentDetailsResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Booking request not found',
  })
  async getPaymentByBookingRequest(@Param('id') bookingRequestId: string): Promise<PaymentDetailsResponseDto> {
    const paymentDetails = await this.paymentService.getPaymentByBookingRequest(bookingRequestId);

    let message: string;
    if (paymentDetails.paymentExists) {
      message = 'Payment details retrieved successfully';
    } else {
      message = 'Booking request found. Payment order not created yet.';
    }

    return {
      code: 200,
      success: true,
      message,
      data: paymentDetails,
    };
  }
}
