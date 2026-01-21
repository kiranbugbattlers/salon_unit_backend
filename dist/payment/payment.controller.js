"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const enums_1 = require("../common/enums");
const payment_service_1 = require("./payment.service");
const dto_1 = require("./dto");
let PaymentController = class PaymentController {
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    async createPaymentOrder(req, createDto) {
        const customerId = req.user.customerId;
        return this.paymentService.createPaymentOrder(customerId, createDto);
    }
    async verifyPayment(req, verifyDto) {
        const customerId = req.user.customerId;
        return this.paymentService.verifyPayment(customerId, verifyDto);
    }
    async confirmCodBooking(req, confirmDto) {
        const customerId = req.user.customerId;
        return this.paymentService.confirmCodBooking(customerId, confirmDto);
    }
    async getPaymentByBookingRequest(bookingRequestId) {
        const paymentDetails = await this.paymentService.getPaymentByBookingRequest(bookingRequestId);
        let message;
        if (paymentDetails.paymentExists) {
            message = 'Payment details retrieved successfully';
        }
        else {
            message = 'Booking request found. Payment order not created yet.';
        }
        return {
            code: 200,
            success: true,
            message,
            data: paymentDetails,
        };
    }
};
exports.PaymentController = PaymentController;
__decorate([
    (0, common_1.Post)('create-order'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.CUSTOMER),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
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
    }),
    (0, swagger_1.ApiBody)({
        type: dto_1.CreatePaymentOrderDto,
        description: 'Booking ID (not booking request ID)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Payment order created successfully',
        type: dto_1.PaymentOrderResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - booking not in correct status or payment already exists',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - can only create payment for own bookings',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Booking request not found',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreatePaymentOrderDto]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "createPaymentOrder", null);
__decorate([
    (0, common_1.Post)('verify'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.CUSTOMER),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
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
    }),
    (0, swagger_1.ApiBody)({
        type: dto_1.VerifyPaymentDto,
        description: 'Payment verification details from Razorpay',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Payment verified successfully. Booking confirmed.',
        type: dto_1.VerifyPaymentResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - signature verification failed or payment already verified',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - can only verify payment for own bookings',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Booking request or payment not found',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.VerifyPaymentDto]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "verifyPayment", null);
__decorate([
    (0, common_1.Post)('confirm-cod'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.CUSTOMER),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
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
    }),
    (0, swagger_1.ApiBody)({
        type: dto_1.ConfirmCodBookingDto,
        description: 'Booking ID (not booking request ID) to confirm with COD payment',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'COD booking confirmed successfully. Customer will pay cash after service.',
        type: dto_1.VerifyPaymentResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - OTP not verified or booking in wrong status',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - can only confirm COD for own bookings',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Booking request not found',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.ConfirmCodBookingDto]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "confirmCodBooking", null);
__decorate([
    (0, common_1.Get)('booking-request/:id'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.CUSTOMER, enums_1.UserRole.BUSINESS_OWNER),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get payment details by booking request ID',
        description: `
      Retrieve payment information for a specific booking request.

      Use Cases:
      - Customer checking payment status
      - Business owner viewing payment confirmation
      - Checking payment method used (online vs COD)
      - Retrieving payment transaction ID
    `,
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Booking Request ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Payment details retrieved successfully',
        type: dto_1.PaymentDetailsResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Booking request not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "getPaymentByBookingRequest", null);
exports.PaymentController = PaymentController = __decorate([
    (0, swagger_1.ApiTags)('Payment Management'),
    (0, common_1.Controller)('payments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [payment_service_1.PaymentService])
], PaymentController);
//# sourceMappingURL=payment.controller.js.map