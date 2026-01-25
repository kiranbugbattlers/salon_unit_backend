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
exports.BusinessController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../common/decorators/public.decorator");
const business_service_1 = require("./business.service");
const dto_1 = require("./dto");
let BusinessController = class BusinessController {
    constructor(businessService) {
        this.businessService = businessService;
    }
    async getBusinesses(query, req) {
        const userId = query.userspecific && req?.user?.userId ? req.user.userId : undefined;
        const customerId = query.userspecific && req?.user?.customerId ? req.user.customerId : undefined;
        return this.businessService.getBusinesses(query, userId, customerId);
    }
    async getBusinessDetail(shopId, userspecific, req) {
        const userId = userspecific && req?.user?.userId ? req.user.userId : undefined;
        const customerId = userspecific && req?.user?.customerId ? req.user.customerId : undefined;
        return this.businessService.getBusinessDetail(shopId, userId, customerId);
    }
    async getBookedSlots(shopId, query) {
        return this.businessService.getBookedSlots(shopId, query.date, query.staffId);
    }
    async getAvailableSlots(shopId, query) {
        return this.businessService.getAvailableSlots(shopId, query);
    }
};
exports.BusinessController = BusinessController;
__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
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
    }),
    (0, swagger_1.ApiQuery)({
        name: 'lat',
        required: false,
        type: Number,
        description: 'Latitude for location-based filtering',
        example: 12.9716,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'lng',
        required: false,
        type: Number,
        description: 'Longitude for location-based filtering',
        example: 77.5946,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'radius',
        required: false,
        type: Number,
        description: 'Search radius in kilometers (default: 10)',
        example: 5,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'sort',
        required: false,
        type: String,
        description: 'Sort fields (comma-separated). Use - prefix for descending order. Allowed fields: rating, name, createdAt, distance (distance requires lat/lng), operatingYears',
        example: 'rating,-operatingYears',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'userspecific',
        required: false,
        type: Boolean,
        description: 'Include user-specific data like favorites and visit history. JWT authentication is optional - if not provided, returns business data without user-specific info.',
        example: false,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number (default: 1)',
        example: 1,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Items per page (default: 20, max: 100)',
        example: 20,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'category',
        required: false,
        type: String,
        description: 'Filter by category UUID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'availableAtHome',
        required: false,
        type: Boolean,
        description: 'Filter businesses offering services at home',
        example: true,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'minPrice',
        required: false,
        type: Number,
        description: 'Minimum price filter (based on business services)',
        example: 100,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'maxPrice',
        required: false,
        type: Number,
        description: 'Maximum price filter (based on business services)',
        example: 1000,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'gender',
        required: false,
        enum: ['male', 'female', 'both'],
        description: 'Filter businesses by service gender availability',
        example: 'both',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'minOperatingYears',
        required: false,
        type: Number,
        description: 'Minimum operating years filter',
        example: 1,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'search',
        required: false,
        type: String,
        description: 'Search term for business name, description, city, area, or landmark',
        example: 'Mumbai',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Businesses retrieved successfully',
        type: dto_1.BusinessResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid query parameters',
    }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.BusinessQueryDto, Object]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "getBusinesses", null);
__decorate([
    (0, common_1.Get)(':shopId'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
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
    }),
    (0, swagger_1.ApiParam)({
        name: 'shopId',
        description: 'Unique shop identifier (format: SH-XXXXXX)',
        example: 'SH-123456',
        type: String,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'userspecific',
        required: false,
        type: Boolean,
        description: 'Include user-specific data like favorites. JWT authentication is optional - if not provided, returns business data without user-specific info.',
        example: false,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Business details retrieved successfully',
        type: dto_1.BusinessDetailResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid shop ID or business not found',
    }),
    __param(0, (0, common_1.Param)('shopId')),
    __param(1, (0, common_1.Query)('userspecific')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean, Object]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "getBusinessDetail", null);
__decorate([
    (0, common_1.Get)(':shopId/booked-slots'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({
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
    }),
    (0, swagger_1.ApiParam)({
        name: 'shopId',
        description: 'Unique shop identifier (format: SH-XXXXXX)',
        example: 'SH-123456',
        type: String,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'date',
        description: 'Date to check for booked slots (YYYY-MM-DD format)',
        example: '2024-01-15',
        type: String,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'staffId',
        description: 'Staff member UUID to check availability for. If not provided, returns booked slots for all staff members.',
        example: 'staff-uuid-here',
        type: String,
        required: false,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Booked slots retrieved successfully',
        type: dto_1.BookedSlotsResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid parameters (date format, UUID format, etc.)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Business or staff member not found',
    }),
    __param(0, (0, common_1.Param)('shopId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.BookedSlotsQueryDto]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "getBookedSlots", null);
__decorate([
    (0, common_1.Get)(':shopId/available-slots'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({
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
    }),
    (0, swagger_1.ApiParam)({
        name: 'shopId',
        description: 'Unique shop identifier (format: SH-XXXXXX)',
        example: 'SH-XXXXXX',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'startDate',
        description: 'Start date for availability check (YYYY-MM-DD format)',
        example: '2024-01-15',
        type: String,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'numberOfDays',
        description: 'Number of consecutive days to check (1-6)',
        example: 3,
        type: Number,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'staffId',
        description: 'Optional staff ID to filter slots for specific staff member',
        example: '456e7890-e12b-34c5-d678-901234567890',
        required: false,
        type: String,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Available slots retrieved successfully',
        type: dto_1.AvailableSlotsResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid parameters (date format, numberOfDays out of range, etc.)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Business not found or no staff found for the specified criteria',
    }),
    __param(0, (0, common_1.Param)('shopId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.AvailableSlotsQueryDto]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "getAvailableSlots", null);
exports.BusinessController = BusinessController = __decorate([
    (0, swagger_1.ApiTags)('Public Businesses'),
    (0, common_1.Controller)('public/businesses'),
    __metadata("design:paramtypes", [business_service_1.BusinessService])
], BusinessController);
//# sourceMappingURL=business.controller.js.map