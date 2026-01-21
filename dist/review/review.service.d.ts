import { Repository } from 'typeorm';
import { Review } from '../database/entities/review.entity';
import { Booking } from '../database/entities/booking.entity';
import { Customer } from '../database/entities/customer.entity';
import { BusinessOwner } from '../database/entities/business-owner.entity';
import { CreateReviewDto, UpdateReviewDto, ReviewResponseDto, ReviewListResponseDto, ReviewQueryDto } from './dto/review.dto';
import { UserRole } from '../common/enums';
export declare class ReviewService {
    private reviewRepository;
    private bookingRepository;
    private customerRepository;
    private businessOwnerRepository;
    constructor(reviewRepository: Repository<Review>, bookingRepository: Repository<Booking>, customerRepository: Repository<Customer>, businessOwnerRepository: Repository<BusinessOwner>);
    createReview(customerId: string, createReviewDto: CreateReviewDto): Promise<ReviewResponseDto>;
    getReviews(query: ReviewQueryDto): Promise<ReviewListResponseDto>;
    getReviewById(reviewId: string): Promise<ReviewResponseDto>;
    updateReview(reviewId: string, updateReviewDto: UpdateReviewDto, userRole: UserRole, userId?: string): Promise<ReviewResponseDto>;
    deleteReview(reviewId: string, userRole: UserRole, userId?: string): Promise<void>;
    getBusinessOwnerReviews(businessOwnerId: string, query: ReviewQueryDto): Promise<ReviewListResponseDto>;
    getCustomerReviews(customerId: string, query: ReviewQueryDto): Promise<ReviewListResponseDto>;
    private findReviewWithRelations;
    private formatReviewResponse;
}
