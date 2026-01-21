import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { Review } from '../database/entities/review.entity';
import { Booking } from '../database/entities/booking.entity';
import { Customer } from '../database/entities/customer.entity';
import { BusinessOwner } from '../database/entities/business-owner.entity';
import { CreateReviewDto, UpdateReviewDto, ReviewResponseDto, ReviewListResponseDto, ReviewQueryDto } from './dto/review.dto';
import { UserRole } from '../common/enums';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(BusinessOwner)
    private businessOwnerRepository: Repository<BusinessOwner>,
  ) {}

  async createReview(customerId: string, createReviewDto: CreateReviewDto): Promise<ReviewResponseDto> {
    // Verify booking exists and belongs to the customer
    const booking = await this.bookingRepository.findOne({
      where: { id: createReviewDto.bookingId, customerId },
      relations: ['businessOwner'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found or does not belong to this customer');
    }

    // Check if review already exists for this booking
    const existingReview = await this.reviewRepository.findOne({
      where: { bookingId: createReviewDto.bookingId },
    });

    if (existingReview) {
      throw new BadRequestException('Review already exists for this booking');
    }

    // Create review
    const review = this.reviewRepository.create({
      bookingId: createReviewDto.bookingId,
      customerId,
      businessOwnerId: booking.businessOwnerId,
      rating: createReviewDto.rating,
      comment: createReviewDto.comment,
    });

    const savedReview = await this.reviewRepository.save(review);
    return this.findReviewWithRelations(savedReview.id);
  }

  async getReviews(query: ReviewQueryDto): Promise<ReviewListResponseDto> {
    const { page = 1, limit = 10, businessOwnerId, customerId, rating, isApproved } = query;
    const skip = (page - 1) * limit;

    const whereConditions: any = {};
    if (businessOwnerId) whereConditions.businessOwnerId = businessOwnerId;
    if (customerId) whereConditions.customerId = customerId;
    if (rating) whereConditions.rating = rating;
    if (isApproved !== undefined) whereConditions.isApproved = isApproved;

    const findOptions: FindManyOptions<Review> = {
      where: whereConditions,
      relations: ['customer', 'customer.user', 'businessOwner'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    };

    const [reviews, total] = await this.reviewRepository.findAndCount(findOptions);

    const totalPages = Math.ceil(total / limit);

    return {
      reviews: reviews.map(this.formatReviewResponse),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getReviewById(reviewId: string): Promise<ReviewResponseDto> {
    return this.findReviewWithRelations(reviewId);
  }

  async updateReview(reviewId: string, updateReviewDto: UpdateReviewDto, userRole: UserRole, userId?: string): Promise<ReviewResponseDto> {
    const review = await this.findReviewWithRelations(reviewId);

    // Check permissions
    if (userRole === UserRole.CUSTOMER) {
      // Customers can only edit their own reviews
      const customer = await this.customerRepository.findOne({ where: { userId } });
      if (!customer || review.customerId !== customer.id) {
        throw new ForbiddenException('You can only edit your own reviews');
      }
      // Customers cannot change isApproved status
      delete updateReviewDto.isApproved;
    } else if (userRole === UserRole.ADMIN) {
      // Admins can edit everything
    } else if (userRole === UserRole.BUSINESS_OWNER) {
      // Business owners can only edit isApproved status for their own reviews
      const businessOwner = await this.businessOwnerRepository.findOne({ where: { userId } });
      if (!businessOwner || review.businessOwnerId !== businessOwner.id) {
        throw new ForbiddenException('You can only edit reviews for your own business');
      }
      // Business owners can only change isApproved status
      const { isApproved } = updateReviewDto;
      if (isApproved === undefined) {
        throw new BadRequestException('Business owners can only change approval status');
      }
      updateReviewDto = { isApproved };
    }

    await this.reviewRepository.update(reviewId, updateReviewDto);
    return this.findReviewWithRelations(reviewId);
  }

  async deleteReview(reviewId: string, userRole: UserRole, userId?: string): Promise<void> {
    const review = await this.findReviewWithRelations(reviewId);

    // Check permissions
    if (userRole === UserRole.CUSTOMER) {
      // Customers can only delete their own reviews
      const customer = await this.customerRepository.findOne({ where: { userId } });
      if (!customer || review.customerId !== customer.id) {
        throw new ForbiddenException('You can only delete your own reviews');
      }
    } else if (userRole === UserRole.ADMIN) {
      // Admins can delete any review
    } else if (userRole === UserRole.BUSINESS_OWNER) {
      // Business owners can only delete reviews for their own business
      const businessOwner = await this.businessOwnerRepository.findOne({ where: { userId } });
      if (!businessOwner || review.businessOwnerId !== businessOwner.id) {
        throw new ForbiddenException('You can only delete reviews for your own business');
      }
    }

    await this.reviewRepository.delete(reviewId);
  }

  async getBusinessOwnerReviews(businessOwnerId: string, query: ReviewQueryDto): Promise<ReviewListResponseDto> {
    const businessOwnerReviewsQuery = { ...query, businessOwnerId };
    return this.getReviews(businessOwnerReviewsQuery);
  }

  async getCustomerReviews(customerId: string, query: ReviewQueryDto): Promise<ReviewListResponseDto> {
    const customerReviewsQuery = { ...query, customerId };
    return this.getReviews(customerReviewsQuery);
  }

  private async findReviewWithRelations(reviewId: string): Promise<ReviewResponseDto> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
      relations: ['customer', 'customer.user', 'businessOwner'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return this.formatReviewResponse(review);
  }

  private formatReviewResponse(review: Review): ReviewResponseDto {
    return {
      id: review.id,
      bookingId: review.bookingId,
      customerId: review.customerId,
      businessOwnerId: review.businessOwnerId,
      rating: review.rating,
      comment: review.comment,
      isApproved: review.isApproved,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      customer: review.customer ? {
        id: review.customer.id,
        firstName: review.customer.firstName,
        lastName: review.customer.lastName,
        profilePic: review.customer.user?.profilePic,
        profilePicCdnUrl: review.customer.user?.profilePicCdnUrl,
      } : undefined,
      businessOwner: review.businessOwner ? {
        id: review.businessOwner.id,
        businessName: review.businessOwner.businessName,
        shopId: review.businessOwner.shopId,
      } : undefined,
    };
  }
}
