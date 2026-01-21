import {
  Controller,
  Get,
  Post,
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
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums';
import { ReviewService } from './review.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from '../database/entities/customer.entity';
import { Repository } from 'typeorm';
import { CreateReviewDto, UpdateReviewDto, ReviewResponseDto, ReviewListResponseDto, ReviewQueryDto } from './dto/review.dto';

@ApiTags('Customer - Reviews')
@Controller('customer/reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
@ApiBearerAuth('JWT')
export class CustomerReviewController {
  constructor(
    private readonly reviewService: ReviewService,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get all reviews',
    description: 'Get all approved reviews for a business. Use businessOwnerId to filter by business.',
  })
  @ApiResponse({
    status: 200,
    description: 'Reviews retrieved successfully',
    type: ReviewListResponseDto,
  })
  async getAllReviews(
    @Query() query: ReviewQueryDto,
  ): Promise<ReviewListResponseDto> {
    return this.reviewService.getReviews(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new review',
    description: 'Create a review for a completed booking. Only one review per booking is allowed.',
  })
  @ApiResponse({
    status: 201,
    description: 'Review created successfully',
    type: ReviewResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Review already exists for this booking or invalid data',
  })
  @ApiResponse({
    status: 404,
    description: 'Booking not found or does not belong to this customer',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async createReview(
    @CurrentUser() user: CurrentUserData,
    @Body() createReviewDto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    // Get customer ID from user
    const customer = await this.customerRepository.findOne({ where: { userId: user.userId } });
    if (!customer) {
      throw new Error('Customer profile not found');
    }
    
    return this.reviewService.createReview(customer.id, createReviewDto);
  }

  @Get('my-reviews')
  @ApiOperation({
    summary: 'Get my reviews',
    description: 'Get all reviews written by the current customer',
  })
  @ApiQuery({ name: 'rating', required: false, description: 'Filter by rating (1-5)' })
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
  async getMyReviews(
    @CurrentUser() user: CurrentUserData,
    @Query() query: ReviewQueryDto,
  ): Promise<ReviewListResponseDto> {
    // Get customer ID from user
    const customer = await this.customerRepository.findOne({ where: { userId: user.userId } });
    if (!customer) {
      throw new Error('Customer profile not found');
    }
    
    return this.reviewService.getCustomerReviews(customer.id, query);
  }

  @Get(':reviewId')
  @ApiOperation({
    summary: 'Get review by ID',
    description: 'Get a specific review by ID (only if it belongs to the current customer)',
  })
  @ApiParam({ name: 'reviewId', description: 'Review ID' })
  @ApiResponse({
    status: 200,
    description: 'Review retrieved successfully',
    type: ReviewResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found or does not belong to this customer',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getReviewById(
    @CurrentUser() user: CurrentUserData,
    @Param('reviewId') reviewId: string,
  ): Promise<ReviewResponseDto> {
    const review = await this.reviewService.getReviewById(reviewId);
    
    // Verify this review belongs to the current customer
    const customer = await this.customerRepository.findOne({ where: { userId: user.userId } });
    if (!customer || review.customerId !== customer.id) {
      throw new Error('Review not found or does not belong to this customer');
    }
    
    return review;
  }

  @Put(':reviewId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update my review',
    description: 'Update a review written by the current customer. Cannot change approval status.',
  })
  @ApiParam({ name: 'reviewId', description: 'Review ID' })
  @ApiResponse({
    status: 200,
    description: 'Review updated successfully',
    type: ReviewResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Cannot edit this review',
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async updateReview(
    @CurrentUser() user: CurrentUserData,
    @Param('reviewId') reviewId: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    return this.reviewService.updateReview(reviewId, updateReviewDto, UserRole.CUSTOMER, user.userId);
  }

  @Delete(':reviewId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete my review',
    description: 'Delete a review written by the current customer',
  })
  @ApiParam({ name: 'reviewId', description: 'Review ID' })
  @ApiResponse({
    status: 200,
    description: 'Review deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Cannot delete this review',
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async deleteReview(
    @CurrentUser() user: CurrentUserData,
    @Param('reviewId') reviewId: string,
  ): Promise<void> {
    await this.reviewService.deleteReview(reviewId, UserRole.CUSTOMER, user.userId);
  }
}
