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
exports.ServicesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../common/decorators/public.decorator");
const services_service_1 = require("./services.service");
const dto_1 = require("./dto");
let ServicesController = class ServicesController {
    constructor(servicesService) {
        this.servicesService = servicesService;
    }
    async getServices(query, req) {
        if (query.userspecific && !req?.user?.id) {
            throw new common_1.BadRequestException('Authentication required when userspecific=true. Please provide a valid JWT token.');
        }
        const userId = query.userspecific && req?.user?.id ? req.user.id : undefined;
        return this.servicesService.getServices(query, userId);
    }
};
exports.ServicesController = ServicesController;
__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
        summary: 'Browse services with flexible filtering',
        description: `
      Flexible endpoint to browse all active services with support for:
      - Location-based filtering (lat, lng, radius)
      - User-specific data (when userspecific=true - requires JWT authentication)
      - Sorting by multiple fields (price, rating, name, createdAt, distance)
      - Pagination (page, limit)
      - Category, availability, and gender filtering
      - Price range filtering

      **Sorting Examples**:
      - sort=price (price ascending)
      - sort=-price (price descending)
      - sort=price,-rating (price ascending, then rating descending)
      - sort=distance (requires lat/lng parameters)

      **Authentication**:
      - Public access: No authentication required for basic service browsing
      - User-specific data: JWT token required when userspecific=true
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
        description: 'Sort fields (comma-separated). Use - prefix for descending order. Allowed fields: price, rating, name, createdAt, distance (distance requires lat/lng)',
        example: 'price,-rating',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'userspecific',
        required: false,
        type: Boolean,
        description: 'Include user-specific data like favorites and booking history. Requires JWT authentication when set to true.',
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
        description: 'Filter by service category',
        example: 'hair-care',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'status',
        required: false,
        type: String,
        description: 'Filter by service status (active/inactive)',
        example: 'active',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'availableAtHome',
        required: false,
        type: Boolean,
        description: 'Filter services available at home',
        example: true,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'minPrice',
        required: false,
        type: Number,
        description: 'Minimum price filter',
        example: 100,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'maxPrice',
        required: false,
        type: Number,
        description: 'Maximum price filter',
        example: 1000,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'gender',
        required: false,
        enum: ['male', 'female', 'both'],
        description: 'Filter services by gender availability',
        example: 'both',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Services retrieved successfully',
        type: dto_1.ServicesResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid query parameters',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Authentication required for user-specific data',
    }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ServicesQueryDto, Object]),
    __metadata("design:returntype", Promise)
], ServicesController.prototype, "getServices", null);
exports.ServicesController = ServicesController = __decorate([
    (0, swagger_1.ApiTags)('Public Services'),
    (0, common_1.Controller)('public/services'),
    __metadata("design:paramtypes", [services_service_1.ServicesService])
], ServicesController);
//# sourceMappingURL=services.controller.js.map