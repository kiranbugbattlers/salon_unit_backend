import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums';
import { ReviewService } from './review.service';
import { UpdateReviewDto, ReviewResponseDto, ReviewListResponseDto, ReviewQueryDto } from './dto/review.dto';

@ApiTags('Admin - Reviews')
@Controller('admin/reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth('JWT')
export class AdminReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all reviews (Admin only)',
    description: 'Get all reviews in the system with advanced filtering options',
  })
  @ApiQuery({ name: 'businessOwnerId', required: false, description: 'Filter by business owner ID' })
  @ApiQuery({ name: 'customerId', required: false, description: 'Filter by customer ID' })
  @ApiQuery({ name: 'rating', required: false, description: 'Filter by rating (1-5)' })
  @ApiQuery({ name: 'isApproved', required: false, description: 'Filter by approval status' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of reviews per page', example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Reviews retrieved successfully',
    type: ReviewListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  async getAllReviews(@Query() query: ReviewQueryDto): Promise<ReviewListResponseDto> {
    return this.reviewService.getReviews(query);
  }

  @Get(':reviewId')
  @ApiOperation({
    summary: 'Get review by ID (Admin only)',
    description: 'Get any review by ID',
  })
  @ApiParam({ name: 'reviewId', description: 'Review ID' })
  @ApiResponse({
    status: 200,
    description: 'Review retrieved successfully',
    type: ReviewResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  async getReviewById(@Param('reviewId') reviewId: string): Promise<ReviewResponseDto> {
    return this.reviewService.getReviewById(reviewId);
  }

  @Put(':reviewId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update any review (Admin only)',
    description: 'Update any review in the system. Admins can modify all fields including approval status.',
  })
  @ApiParam({ name: 'reviewId', description: 'Review ID' })
  @ApiResponse({
    status: 200,
    description: 'Review updated successfully',
    type: ReviewResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  async updateReview(
    @Param('reviewId') reviewId: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    return this.reviewService.updateReview(reviewId, updateReviewDto, UserRole.ADMIN);
  }

  @Delete(':reviewId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete any review (Admin only)',
    description: 'Delete any review from the system',
  })
  @ApiParam({ name: 'reviewId', description: 'Review ID' })
  @ApiResponse({
    status: 200,
    description: 'Review deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  async deleteReview(@Param('reviewId') reviewId: string): Promise<void> {
    await this.reviewService.deleteReview(reviewId, UserRole.ADMIN);
  }

  @Get('business/:businessOwnerId')
  @ApiOperation({
    summary: 'Get reviews by business owner (Admin only)',
    description: 'Get all reviews for a specific business owner',
  })
  @ApiParam({ name: 'businessOwnerId', description: 'Business owner ID' })
  @ApiQuery({ name: 'rating', required: false, description: 'Filter by rating (1-5)' })
  @ApiQuery({ name: 'isApproved', required: false, description: 'Filter by approval status' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of reviews per page', example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Reviews retrieved successfully',
    type: ReviewListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  async getReviewsByBusinessOwner(
    @Param('businessOwnerId') businessOwnerId: string,
    @Query() query: ReviewQueryDto,
  ): Promise<ReviewListResponseDto> {
    const businessReviewsQuery = { ...query, businessOwnerId };
    return this.reviewService.getReviews(businessReviewsQuery);
  }

  @Get('customer/:customerId')
  @ApiOperation({
    summary: 'Get reviews by customer (Admin only)',
    description: 'Get all reviews written by a specific customer',
  })
  @ApiParam({ name: 'customerId', description: 'Customer ID' })
  @ApiQuery({ name: 'rating', required: false, description: 'Filter by rating (1-5)' })
  @ApiQuery({ name: 'isApproved', required: false, description: 'Filter by approval status' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of reviews per page', example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Reviews retrieved successfully',
    type: ReviewListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  async getReviewsByCustomer(
    @Param('customerId') customerId: string,
    @Query() query: ReviewQueryDto,
  ): Promise<ReviewListResponseDto> {
    const customerReviewsQuery = { ...query, customerId };
    return this.reviewService.getReviews(customerReviewsQuery);
  }
}
