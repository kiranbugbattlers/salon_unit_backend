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
exports.AdminBookingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const enums_1 = require("../../common/enums");
const entities_1 = require("../../database/entities");
const admin_booking_service_1 = require("../services/admin-booking.service");
const admin_booking_dto_1 = require("../dto/admin-booking.dto");
let AdminBookingController = class AdminBookingController {
    constructor(adminBookingService) {
        this.adminBookingService = adminBookingService;
    }
    async getAllBookings(query) {
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
    async getAllBookingRequests(query) {
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
    async getBookingDetails(bookingId) {
        const booking = await this.adminBookingService.getBookingDetails(bookingId);
        return {
            code: 200,
            success: true,
            message: 'Booking details retrieved successfully',
            data: booking,
        };
    }
    async getBookingRequestDetails(bookingRequestId) {
        const bookingRequest = await this.adminBookingService.getBookingRequestDetails(bookingRequestId);
        return {
            code: 200,
            success: true,
            message: 'Booking request details retrieved successfully',
            data: bookingRequest,
        };
    }
    async forceCancelBooking(req, bookingId, cancelDto) {
        const adminId = req.user.sub;
        const booking = await this.adminBookingService.forceCancelBooking(bookingId, adminId, cancelDto);
        return {
            code: 200,
            success: true,
            message: 'Booking cancelled successfully by admin',
            data: booking,
        };
    }
    async forceCompleteBooking(req, bookingId, completeDto) {
        const adminId = req.user.sub;
        const booking = await this.adminBookingService.forceCompleteBooking(bookingId, adminId, completeDto);
        return {
            code: 200,
            success: true,
            message: 'Booking completed successfully by admin',
            data: booking,
        };
    }
};
exports.AdminBookingController = AdminBookingController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
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
    }),
    (0, swagger_1.ApiQuery)({ name: 'status', enum: enums_1.BookingStatus, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'businessOwnerId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'customerId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'staffId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'serviceLocation', enum: enums_1.ServiceLocation, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'dateFrom', required: false, example: '2025-01-01' }),
    (0, swagger_1.ApiQuery)({ name: 'dateTo', required: false, example: '2025-01-31' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, example: 10 }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Bookings retrieved successfully',
        type: admin_booking_dto_1.AdminBookingListResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - JWT token required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin role required',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_booking_dto_1.AdminBookingQueryDto]),
    __metadata("design:returntype", Promise)
], AdminBookingController.prototype, "getAllBookings", null);
__decorate([
    (0, common_1.Get)('requests'),
    (0, swagger_1.ApiOperation)({
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
    }),
    (0, swagger_1.ApiQuery)({ name: 'status', enum: entities_1.BookingRequestStatus, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'businessOwnerId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'customerId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'dateFrom', required: false, example: '2025-01-01' }),
    (0, swagger_1.ApiQuery)({ name: 'dateTo', required: false, example: '2025-01-31' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, example: 10 }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Booking requests retrieved successfully',
        type: admin_booking_dto_1.AdminBookingRequestListResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - JWT token required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin role required',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_booking_dto_1.AdminBookingRequestQueryDto]),
    __metadata("design:returntype", Promise)
], AdminBookingController.prototype, "getAllBookingRequests", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
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
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Booking ID (UUID)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Booking details retrieved successfully',
        type: admin_booking_dto_1.AdminBookingResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Booking not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - JWT token required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin role required',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminBookingController.prototype, "getBookingDetails", null);
__decorate([
    (0, common_1.Get)('requests/:id'),
    (0, swagger_1.ApiOperation)({
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
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Booking Request ID (UUID)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Booking request details retrieved successfully',
        type: admin_booking_dto_1.AdminBookingRequestResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Booking request not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - JWT token required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin role required',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminBookingController.prototype, "getBookingRequestDetails", null);
__decorate([
    (0, common_1.Post)(':id/force-cancel'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
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
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Booking ID (UUID)' }),
    (0, swagger_1.ApiBody)({ type: admin_booking_dto_1.ForceCancelBookingDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Booking cancelled successfully',
        type: admin_booking_dto_1.AdminBookingResponseDto,
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
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Cannot cancel - invalid state or already cancelled',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Booking not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - JWT token required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin role required',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, admin_booking_dto_1.ForceCancelBookingDto]),
    __metadata("design:returntype", Promise)
], AdminBookingController.prototype, "forceCancelBooking", null);
__decorate([
    (0, common_1.Post)(':id/force-complete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
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
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Booking ID (UUID)' }),
    (0, swagger_1.ApiBody)({ type: admin_booking_dto_1.ForceCompleteBookingDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Booking completed successfully',
        type: admin_booking_dto_1.AdminBookingResponseDto,
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
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Cannot complete - invalid state or already completed',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Booking not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - JWT token required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin role required',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, admin_booking_dto_1.ForceCompleteBookingDto]),
    __metadata("design:returntype", Promise)
], AdminBookingController.prototype, "forceCompleteBooking", null);
exports.AdminBookingController = AdminBookingController = __decorate([
    (0, swagger_1.ApiTags)('Admin - Booking Management'),
    (0, common_1.Controller)('admin/bookings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    __metadata("design:paramtypes", [admin_booking_service_1.AdminBookingService])
], AdminBookingController);
//# sourceMappingURL=admin-booking.controller.js.map