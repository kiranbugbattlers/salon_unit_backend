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
exports.AdminBookingAnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const enums_1 = require("../../common/enums");
const admin_booking_service_1 = require("../services/admin-booking.service");
const admin_booking_dto_1 = require("../dto/admin-booking.dto");
let AdminBookingAnalyticsController = class AdminBookingAnalyticsController {
    constructor(adminBookingService) {
        this.adminBookingService = adminBookingService;
    }
    async getBookingAnalytics(query) {
        const analytics = await this.adminBookingService.getBookingAnalytics(query);
        return {
            code: 200,
            success: true,
            message: 'Booking analytics retrieved successfully',
            data: analytics,
        };
    }
    async getBusinessPerformanceReport(query) {
        const { data, total } = await this.adminBookingService.getBusinessPerformanceReport(query);
        const page = query.page || 1;
        const limit = query.limit || 50;
        return {
            code: 200,
            success: true,
            message: 'Business performance report generated successfully',
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
};
exports.AdminBookingAnalyticsController = AdminBookingAnalyticsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get booking analytics (Admin only)',
        description: `
      Comprehensive system-wide booking analytics and metrics.

      Features:
      - Total bookings across all businesses
      - Breakdown by booking status
      - Breakdown by payment method (online vs COD)
      - Financial metrics (revenue, commission, average value)
      - Performance metrics (completion rate, cancellation rate)
      - Top performing businesses
      - Top customers by booking count
      - Daily booking trends
      - Daily revenue trends

      Metrics Included:

      1. **Total Bookings**: Count of all bookings in period

      2. **By Status**:
         - Pending: Bookings awaiting confirmation
         - Confirmed: Bookings confirmed, awaiting service
         - In Progress: Currently ongoing services
         - Completed: Successfully completed services
         - Cancelled: Cancelled bookings

      3. **By Payment Method**:
         - Online: Razorpay payments (card, UPI, netbanking, wallet)
         - COD: Cash on delivery payments

      4. **Financial Metrics**:
         - Total Revenue: Sum of all completed booking amounts
         - Average Booking Value: Mean value per booking
         - Total Commission: Platform commission earned

      5. **Performance Metrics**:
         - Completion Rate: Percentage of bookings completed
         - Cancellation Rate: Percentage of bookings cancelled

      6. **Top Performers**:
         - Top 10 Businesses: By booking count and revenue
         - Top 10 Customers: By booking count and total spent

      7. **Trends**:
         - Bookings by Day: Daily booking counts
         - Revenue by Day: Daily revenue totals

      Filters:
      - dateFrom/dateTo: Analyze specific time period
      - businessOwnerId: Focus on specific business

      Use Cases:
      - Executive dashboard
      - Business intelligence
      - Performance monitoring
      - Revenue tracking
      - Trend analysis
      - Strategic planning
      - Identifying growth opportunities
      - Detecting issues (high cancellation rates)
      - Reward top performers
      - Marketing campaign effectiveness

      Example Response:
      {
        "totalBookings": 1250,
        "byStatus": {
          "pending": 45,
          "confirmed": 120,
          "inProgress": 15,
          "completed": 1000,
          "cancelled": 70
        },
        "byPaymentMethod": {
          "online": 900,
          "cod": 350
        },
        "averageBookingValue": 1250.50,
        "totalRevenue": 1250500.00,
        "totalCommission": 25010.00,
        "completionRate": 0.94,
        "cancellationRate": 0.06,
        "topBusinesses": [
          {
            "businessId": "uuid",
            "businessName": "Elite Salon",
            "bookingCount": 150,
            "totalRevenue": 187575.00
          }
        ],
        "topCustomers": [
          {
            "customerId": "uuid",
            "customerName": "John Doe",
            "bookingCount": 25,
            "totalSpent": 31262.50
          }
        ],
        "bookingsByDay": {
          "2025-01-01": 45,
          "2025-01-02": 52,
          ...
        },
        "revenueByDay": {
          "2025-01-01": 56252.50,
          "2025-01-02": 65010.00,
          ...
        }
      }

      Performance:
      - Optimized aggregation queries
      - Caches frequently accessed data
      - Efficient for large datasets
      - Sub-second response times
    `,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'dateFrom',
        required: false,
        example: '2025-01-01',
        description: 'Start date for analytics period (YYYY-MM-DD)'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'dateTo',
        required: false,
        example: '2025-01-31',
        description: 'End date for analytics period (YYYY-MM-DD)'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'businessOwnerId',
        required: false,
        description: 'Filter analytics for specific business (UUID)'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Booking analytics retrieved successfully',
        type: admin_booking_dto_1.BookingAnalyticsResponseDto,
        schema: {
            example: {
                code: 200,
                success: true,
                message: 'Booking analytics retrieved successfully',
                data: {
                    totalBookings: 1250,
                    byStatus: {
                        pending: 45,
                        confirmed: 120,
                        inProgress: 15,
                        completed: 1000,
                        cancelled: 70,
                    },
                    byPaymentMethod: {
                        online: 900,
                        cod: 350,
                    },
                    averageBookingValue: 1250.50,
                    totalRevenue: 1250500.00,
                    totalCommission: 25010.00,
                    completionRate: 0.94,
                    cancellationRate: 0.06,
                    topBusinesses: [
                        {
                            businessId: '123e4567-e89b-12d3-a456-426614174000',
                            businessName: 'Elite Salon',
                            bookingCount: 150,
                            totalRevenue: 187575.00,
                        },
                        {
                            businessId: '456e7890-e12b-34c5-d678-901234567890',
                            businessName: 'Premium Spa',
                            bookingCount: 135,
                            totalRevenue: 168750.00,
                        },
                    ],
                    topCustomers: [
                        {
                            customerId: '789e0123-e45f-67g8-h901-234567890123',
                            customerName: 'John Doe',
                            bookingCount: 25,
                            totalSpent: 31262.50,
                        },
                        {
                            customerId: '012e3456-e78f-90g1-h234-567890123456',
                            customerName: 'Jane Smith',
                            bookingCount: 22,
                            totalSpent: 27500.00,
                        },
                    ],
                    bookingsByDay: {
                        '2025-01-01': 45,
                        '2025-01-02': 52,
                        '2025-01-03': 48,
                        '2025-01-04': 41,
                        '2025-01-05': 55,
                    },
                    revenueByDay: {
                        '2025-01-01': 56252.50,
                        '2025-01-02': 65010.00,
                        '2025-01-03': 60120.50,
                        '2025-01-04': 51262.00,
                        '2025-01-05': 68755.00,
                    },
                },
            },
        },
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
    __metadata("design:paramtypes", [admin_booking_dto_1.AdminAnalyticsQueryDto]),
    __metadata("design:returntype", Promise)
], AdminBookingAnalyticsController.prototype, "getBookingAnalytics", null);
__decorate([
    (0, common_1.Get)('business-performance'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get business performance reports (Admin only)',
        description: `
      Generate comprehensive daily or monthly performance reports for all businesses.

      Features:
      - Generate daily or monthly reports by business
      - Detailed metrics per business including revenue, bookings, commission
      - Aggregated summary across all businesses
      - Flexible sorting and filtering
      - Paginated results for large datasets

      Report Types:
      1. **Daily Report**: Performance metrics per business per day
         - Each row represents one business on one specific day
         - Only includes days with bookings
         - Best for short-term analysis (1-30 days)

      2. **Monthly Report**: Aggregated performance per business per month
         - Each row represents one business for one entire month
         - Aggregates all bookings within that month
         - Best for long-term trends and comparisons

      Metrics Per Business:
      - **Total Bookings**: All bookings (any status)
      - **Completed Bookings**: Successfully completed services
      - **Cancelled Bookings**: Cancelled appointments
      - **Total Revenue**: Revenue from completed bookings only
      - **Total Commission**: Platform commission earned
      - **Average Booking Value**: Revenue per completed booking
      - **Completion Rate**: Percentage of bookings completed (0-1)
      - **Cancellation Rate**: Percentage of bookings cancelled (0-1)

      Summary Metrics:
      - Total unique businesses in report
      - Total bookings across all businesses
      - Total revenue across all businesses
      - Total commission across all businesses
      - Average revenue per business

      Sorting Options:
      - revenue: Sort by total revenue (default)
      - bookings: Sort by total booking count
      - commission: Sort by total commission earned
      - businessName: Sort alphabetically by business name

      Use Cases:
      - Monthly performance review meetings
      - Identifying top-performing businesses for rewards
      - Detecting underperforming businesses for support
      - Financial reporting and commission tracking
      - Business comparison and benchmarking
      - Trend analysis over time
      - Export data for Excel/spreadsheet analysis

      Query Parameters:
      - reportType: "daily" or "monthly" (required)
      - dateFrom: Start date YYYY-MM-DD (required)
      - dateTo: End date YYYY-MM-DD (required)
      - shopId: Filter by specific business (optional)
      - sortBy: revenue/bookings/commission/businessName (default: revenue)
      - sortOrder: asc/desc (default: desc)
      - page, limit: Pagination (default: 1, 50)

      Validation:
      - dateFrom must be <= dateTo
      - Max date range: 366 days
      - Valid report type required

      Example: Monthly Report for January 2025
      GET /admin/bookings/analytics/business-performance?reportType=monthly&dateFrom=2025-01-01&dateTo=2025-01-31

      Example: Daily Report for Last Week (Specific Business)
      GET /admin/bookings/analytics/business-performance?reportType=daily&dateFrom=2025-01-15&dateTo=2025-01-21&shopId=SH-001

      Performance:
      - Efficient database aggregation
      - Pagination for large result sets
      - Optimized for date range queries
      - Sub-second response times for typical queries
    `,
    }),
    (0, swagger_1.ApiQuery)({ name: 'reportType', enum: ['daily', 'monthly'], required: true }),
    (0, swagger_1.ApiQuery)({ name: 'dateFrom', required: true, example: '2025-01-01' }),
    (0, swagger_1.ApiQuery)({ name: 'dateTo', required: true, example: '2025-01-31' }),
    (0, swagger_1.ApiQuery)({ name: 'shopId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', enum: ['revenue', 'bookings', 'commission', 'businessName'], required: false }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', enum: ['asc', 'desc'], required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, example: 50 }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Business performance report generated successfully',
        type: admin_booking_dto_1.BusinessPerformanceReportResponseDto,
        schema: {
            example: {
                code: 200,
                success: true,
                message: 'Business performance report generated successfully',
                data: {
                    reportType: 'monthly',
                    period: {
                        dateFrom: '2025-01-01',
                        dateTo: '2025-01-31',
                    },
                    summary: {
                        totalBusinesses: 25,
                        totalBookings: 1250,
                        totalRevenue: 1562500.00,
                        totalCommission: 31250.00,
                        averageRevenuePerBusiness: 62500.00,
                    },
                    businesses: [
                        {
                            businessId: '123e4567-e89b-12d3-a456-426614174000',
                            shopId: 'SH-001',
                            businessName: 'Elite Salon',
                            period: '2025-01',
                            metrics: {
                                totalBookings: 150,
                                completedBookings: 142,
                                cancelledBookings: 8,
                                totalRevenue: 187575.00,
                                totalCommission: 3751.50,
                                averageBookingValue: 1320.95,
                                completionRate: 0.947,
                                cancellationRate: 0.053,
                            },
                            contact: {
                                email: 'owner@elitesalon.com',
                                phone: '+1234567890',
                            },
                        },
                        {
                            businessId: '456e7890-e12b-34c5-d678-901234567890',
                            shopId: 'SH-002',
                            businessName: 'Premium Spa',
                            period: '2025-01',
                            metrics: {
                                totalBookings: 135,
                                completedBookings: 128,
                                cancelledBookings: 7,
                                totalRevenue: 168750.00,
                                totalCommission: 3375.00,
                                averageBookingValue: 1318.36,
                                completionRate: 0.948,
                                cancellationRate: 0.052,
                            },
                            contact: {
                                email: 'owner@premiumspa.com',
                                phone: '+1234567891',
                            },
                        },
                    ],
                },
                meta: {
                    total: 25,
                    page: 1,
                    limit: 50,
                    totalPages: 1,
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid query parameters - date range too large or invalid report type',
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
    __metadata("design:paramtypes", [admin_booking_dto_1.BusinessPerformanceReportQueryDto]),
    __metadata("design:returntype", Promise)
], AdminBookingAnalyticsController.prototype, "getBusinessPerformanceReport", null);
exports.AdminBookingAnalyticsController = AdminBookingAnalyticsController = __decorate([
    (0, swagger_1.ApiTags)('Admin - Booking Analytics'),
    (0, common_1.Controller)('admin/bookings/analytics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    __metadata("design:paramtypes", [admin_booking_service_1.AdminBookingService])
], AdminBookingAnalyticsController);
//# sourceMappingURL=admin-booking-analytics.controller.js.map