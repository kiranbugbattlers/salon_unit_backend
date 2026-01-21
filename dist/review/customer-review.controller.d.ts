import { CurrentUserData } from '../common/decorators/current-user.decorator';
import { ReviewService } from './review.service';
import { Customer } from '../database/entities/customer.entity';
import { Repository } from 'typeorm';
import { CreateReviewDto, UpdateReviewDto, ReviewResponseDto, ReviewListResponseDto, ReviewQueryDto } from './dto/review.dto';
export declare class CustomerReviewController {
    private readonly reviewService;
    private readonly customerRepository;
    constructor(reviewService: ReviewService, customerRepository: Repository<Customer>);
    getAllReviews(query: ReviewQueryDto): Promise<ReviewListResponseDto>;
    createReview(user: CurrentUserData, createReviewDto: CreateReviewDto): Promise<ReviewResponseDto>;
    getMyReviews(user: CurrentUserData, query: ReviewQueryDto): Promise<ReviewListResponseDto>;
    getReviewById(user: CurrentUserData, reviewId: string): Promise<ReviewResponseDto>;
    updateReview(user: CurrentUserData, reviewId: string, updateReviewDto: UpdateReviewDto): Promise<ReviewResponseDto>;
    deleteReview(user: CurrentUserData, reviewId: string): Promise<void>;
}
