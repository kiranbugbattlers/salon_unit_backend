import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { ServicesService } from './services.service';
import { ServicesQueryDto, ServicesResponseDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Public Services')
@Controller('public/services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @Public()
  @ApiBearerAuth('JWT')
  @ApiOperation({
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
  })
  @ApiQuery({
    name: 'lat',
    required: false,
    type: Number,
    description: 'Latitude for location-based filtering',
    example: 12.9716,
  })
  @ApiQuery({
    name: 'lng',
    required: false,
    type: Number,
    description: 'Longitude for location-based filtering',
    example: 77.5946,
  })
  @ApiQuery({
    name: 'radius',
    required: false,
    type: Number,
    description: 'Search radius in kilometers (default: 10)',
    example: 5,
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    type: String,
    description: 'Sort fields (comma-separated). Use - prefix for descending order. Allowed fields: price, rating, name, createdAt, distance (distance requires lat/lng)',
    example: 'price,-rating',
  })
  @ApiQuery({
    name: 'userspecific',
    required: false,
    type: Boolean,
    description: 'Include user-specific data like favorites and booking history. Requires JWT authentication when set to true.',
    example: false,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 20, max: 100)',
    example: 20,
  })
  @ApiQuery({
    name: 'category',
    required: false,
    type: String,
    description: 'Filter by service category',
    example: 'hair-care',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filter by service status (active/inactive)',
    example: 'active',
  })
  @ApiQuery({
    name: 'availableAtHome',
    required: false,
    type: Boolean,
    description: 'Filter services available at home',
    example: true,
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    type: Number,
    description: 'Minimum price filter',
    example: 100,
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    type: Number,
    description: 'Maximum price filter',
    example: 1000,
  })
  @ApiQuery({
    name: 'gender',
    required: false,
    enum: ['male', 'female', 'both'],
    description: 'Filter services by gender availability',
    example: 'both',
  })
  @ApiResponse({
    status: 200,
    description: 'Services retrieved successfully',
    type: ServicesResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid query parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required for user-specific data',
  })
  async getServices(
    @Query() query: ServicesQueryDto,
    @Request() req?: any,
  ): Promise<ServicesResponseDto> {
    // If userspecific is true, we need the user context
    if (query.userspecific && !req?.user?.id) {
      throw new BadRequestException('Authentication required when userspecific=true. Please provide a valid JWT token.');
    }

    const userId = query.userspecific && req?.user?.id ? req.user.id : undefined;

    return this.servicesService.getServices(query, userId);
  }
}