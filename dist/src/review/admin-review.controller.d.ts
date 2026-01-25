import { ReviewService } from './review.service';
import { UpdateReviewDto, ReviewResponseDto, ReviewListResponseDto, ReviewQueryDto } from './dto/review.dto';
export declare class AdminReviewController {
    private readonly reviewService;
    constructor(reviewService: ReviewService);
    getAllReviews(query: ReviewQueryDto): Promise<ReviewListResponseDto>;
    getReviewById(reviewId: string): Promise<ReviewResponseDto>;
    updateReview(reviewId: string, updateReviewDto: UpdateReviewDto): Promise<ReviewResponseDto>;
    deleteReview(reviewId: string): Promise<void>;
    getReviewsByBusinessOwner(businessOwnerId: string, query: ReviewQueryDto): Promise<ReviewListResponseDto>;
    getReviewsByCustomer(customerId: string, query: ReviewQueryDto): Promise<ReviewListResponseDto>;
}
