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
  Req,
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
import { InjectRepository } from '@nestjs/typeorm';
import { BusinessOwner } from '../database/entities/business-owner.entity';
import { Repository } from 'typeorm';
import { UpdateReviewDto, ReviewResponseDto, ReviewListResponseDto, ReviewQueryDto } from './dto/review.dto';

@ApiTags('Business Owner - Reviews')
@Controller('business-owner/reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.BUSINESS_OWNER)
@ApiBearerAuth('JWT')
export class BusinessOwnerReviewController {
  constructor(
    private readonly reviewService: ReviewService,
    @InjectRepository(BusinessOwner)
    private readonly businessOwnerRepository: Repository<BusinessOwner>,
  ) {}

  @Get('my-reviews')
  @ApiOperation({
    summary: 'Get reviews for my business',
    description: 'Get all reviews for the current business owner\'s business. If no business owner profile exists, returns all reviews in the system.',
  })
  @ApiQuery({ name: 'rating', required: false, description: 'Filter by rating (1-5)' })
  @ApiQuery({ name: 'isApproved', required: false, description: 'Filter by approval status' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of reviews per page', example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Reviews retrieved successfully - returns business-specific reviews if profile exists, otherwise returns all reviews',
    type: ReviewListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getMyBusinessReviews(
    @Req() req: any,
    @Query() query: ReviewQueryDto,
  ): Promise<ReviewListResponseDto> {
    // Get business owner ID from JWT payload
    let businessOwnerId = req.user.businessOwnerId;
    
    // If no businessOwnerId in JWT, try to find it in database
    if (!businessOwnerId && req.user.userId) {
      const businessOwner = await this.businessOwnerRepository.findOne({ 
        where: { userId: req.user.userId } 
      });
      
      if (businessOwner) {
        businessOwnerId = businessOwner.id;
      }
    }
    
    // If business owner profile exists, get their specific reviews
    if (businessOwnerId) {
      return this.reviewService.getBusinessOwnerReviews(businessOwnerId, query);
    }
    
    // If no business owner profile, return all reviews (filtered by other query params if provided)
    // This allows users without business profiles to still see reviews
    return this.reviewService.getReviews(query);
  }

  @Get(':reviewId')
  @ApiOperation({
    summary: 'Get review by ID',
    description: 'Get a specific review by ID. If business owner profile exists, only returns reviews belonging to that business. Otherwise, returns any review.',
  })
  @ApiParam({ name: 'reviewId', description: 'Review ID' })
  @ApiResponse({
    status: 200,
    description: 'Review retrieved successfully',
    type: ReviewResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found (for business owners with profiles, also verifies ownership)',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getReviewById(
    @Req() req: any,
    @Param('reviewId') reviewId: string,
  ): Promise<ReviewResponseDto> {
    const review = await this.reviewService.getReviewById(reviewId);
    
    // Get business owner ID from JWT payload
    let businessOwnerId = req.user.businessOwnerId;
    
    // If no businessOwnerId in JWT, try to find it in database
    if (!businessOwnerId && req.user.userId) {
      const businessOwner = await this.businessOwnerRepository.findOne({ 
        where: { userId: req.user.userId } 
      });
      
      if (businessOwner) {
        businessOwnerId = businessOwner.id;
      }
    }
    
    // If business owner profile exists, verify this review belongs to them
    if (businessOwnerId && review.businessOwnerId !== businessOwnerId) {
      throw new Error('Review not found or does not belong to this business');
    }
    
    // If no business owner profile, allow access to any review (similar to getMyBusinessReviews)
    return review;
  }

  @Put(':reviewId/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Approve or disapprove review',
    description: 'Approve or disapprove a review for your business. Only business owners can change approval status.',
  })
  @ApiParam({ name: 'reviewId', description: 'Review ID' })
  @ApiResponse({
    status: 200,
    description: 'Review approval status updated successfully',
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
  async updateReviewApproval(
    @Req() req: any,
    @Param('reviewId') reviewId: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    return this.reviewService.updateReview(reviewId, updateReviewDto, UserRole.BUSINESS_OWNER, req.user.userId);
  }

  @Delete(':reviewId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete review from my business',
    description: 'Delete a review for the current business owner\'s business',
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
    @Req() req: any,
    @Param('reviewId') reviewId: string,
  ): Promise<void> {
    await this.reviewService.deleteReview(reviewId, UserRole.BUSINESS_OWNER, req.user.userId);
  }
}
