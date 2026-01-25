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
exports.BookingHistoryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const booking_history_service_1 = require("./booking-history.service");
const booking_history_dto_1 = require("./dto/booking-history.dto");
let BookingHistoryController = class BookingHistoryController {
    constructor(bookingHistoryService) {
        this.bookingHistoryService = bookingHistoryService;
    }
    async getAllBookings(user, query) {
        const bookingQuery = {
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
    async getBookingById(user, bookingId) {
        return this.bookingHistoryService.findOne(user.customerId, bookingId);
    }
};
exports.BookingHistoryController = BookingHistoryController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
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
    }),
    (0, swagger_1.ApiQuery)({
        name: 'status',
        description: 'Filter by booking status',
        enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
        required: false,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'date',
        description: 'Filter by specific appointment date (YYYY-MM-DD)',
        example: '2024-01-15',
        required: false,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'appointmentDate',
        description: 'Filter by specific appointment date (YYYY-MM-DD)',
        example: '2024-01-15',
        required: false,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'fromDate',
        description: 'Filter bookings from this date onwards (YYYY-MM-DD)',
        example: '2024-01-01',
        required: false,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'toDate',
        description: 'Filter bookings up to this date (YYYY-MM-DD)',
        example: '2024-01-31',
        required: false,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        description: 'Page number for pagination',
        example: 1,
        required: false,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        description: 'Number of items per page',
        example: 10,
        required: false,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'sortBy',
        description: 'Sort field',
        enum: ['appointmentDate', 'createdAt', 'totalAmount'],
        example: 'appointmentDate',
        required: false,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'sortOrder',
        description: 'Sort order',
        enum: ['ASC', 'DESC'],
        example: 'DESC',
        required: false,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Booking history retrieved successfully',
        type: booking_history_dto_1.BookingHistoryListDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - JWT token required',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BookingHistoryController.prototype, "getAllBookings", null);
__decorate([
    (0, common_1.Get)(':bookingId'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
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
    }),
    (0, swagger_1.ApiParam)({
        name: 'bookingId',
        description: 'Booking ID (UUID)',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Booking retrieved successfully',
        type: booking_history_dto_1.BookingHistoryDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - JWT token required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Can only view own bookings',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Booking not found',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('bookingId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BookingHistoryController.prototype, "getBookingById", null);
exports.BookingHistoryController = BookingHistoryController = __decorate([
    (0, swagger_1.ApiTags)('Booking History'),
    (0, common_1.Controller)('booking-history'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [booking_history_service_1.BookingHistoryService])
], BookingHistoryController);
//# sourceMappingURL=booking-history.controller.js.map