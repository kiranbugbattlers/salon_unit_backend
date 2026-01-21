import { ReviewService } from './review.service';
import { BusinessOwner } from '../database/entities/business-owner.entity';
import { Repository } from 'typeorm';
import { UpdateReviewDto, ReviewResponseDto, ReviewListResponseDto, ReviewQueryDto } from './dto/review.dto';
export declare class BusinessOwnerReviewController {
    private readonly reviewService;
    private readonly businessOwnerRepository;
    constructor(reviewService: ReviewService, businessOwnerRepository: Repository<BusinessOwner>);
    getMyBusinessReviews(req: any, query: ReviewQueryDto): Promise<ReviewListResponseDto>;
    getReviewById(req: any, reviewId: string): Promise<ReviewResponseDto>;
    updateReviewApproval(req: any, reviewId: string, updateReviewDto: UpdateReviewDto): Promise<ReviewResponseDto>;
    deleteReview(req: any, reviewId: string): Promise<void>;
}
