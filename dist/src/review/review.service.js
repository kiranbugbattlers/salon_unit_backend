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
exports.ReviewService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const review_entity_1 = require("../database/entities/review.entity");
const booking_entity_1 = require("../database/entities/booking.entity");
const customer_entity_1 = require("../database/entities/customer.entity");
const business_owner_entity_1 = require("../database/entities/business-owner.entity");
const enums_1 = require("../common/enums");
let ReviewService = class ReviewService {
    constructor(reviewRepository, bookingRepository, customerRepository, businessOwnerRepository) {
        this.reviewRepository = reviewRepository;
        this.bookingRepository = bookingRepository;
        this.customerRepository = customerRepository;
        this.businessOwnerRepository = businessOwnerRepository;
    }
    async createReview(customerId, createReviewDto) {
        const booking = await this.bookingRepository.findOne({
            where: { id: createReviewDto.bookingId, customerId },
            relations: ['businessOwner'],
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found or does not belong to this customer');
        }
        const existingReview = await this.reviewRepository.findOne({
            where: { bookingId: createReviewDto.bookingId },
        });
        if (existingReview) {
            throw new common_1.BadRequestException('Review already exists for this booking');
        }
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
    async getReviews(query) {
        const { page = 1, limit = 10, businessOwnerId, customerId, rating, isApproved } = query;
        const skip = (page - 1) * limit;
        const whereConditions = {};
        if (businessOwnerId)
            whereConditions.businessOwnerId = businessOwnerId;
        if (customerId)
            whereConditions.customerId = customerId;
        if (rating)
            whereConditions.rating = rating;
        if (isApproved !== undefined)
            whereConditions.isApproved = isApproved;
        const findOptions = {
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
    async getReviewById(reviewId) {
        return this.findReviewWithRelations(reviewId);
    }
    async updateReview(reviewId, updateReviewDto, userRole, userId) {
        const review = await this.findReviewWithRelations(reviewId);
        if (userRole === enums_1.UserRole.CUSTOMER) {
            const customer = await this.customerRepository.findOne({ where: { userId } });
            if (!customer || review.customerId !== customer.id) {
                throw new common_1.ForbiddenException('You can only edit your own reviews');
            }
            delete updateReviewDto.isApproved;
        }
        else if (userRole === enums_1.UserRole.ADMIN) {
        }
        else if (userRole === enums_1.UserRole.BUSINESS_OWNER) {
            const businessOwner = await this.businessOwnerRepository.findOne({ where: { userId } });
            if (!businessOwner || review.businessOwnerId !== businessOwner.id) {
                throw new common_1.ForbiddenException('You can only edit reviews for your own business');
            }
            const { isApproved } = updateReviewDto;
            if (isApproved === undefined) {
                throw new common_1.BadRequestException('Business owners can only change approval status');
            }
            updateReviewDto = { isApproved };
        }
        await this.reviewRepository.update(reviewId, updateReviewDto);
        return this.findReviewWithRelations(reviewId);
    }
    async deleteReview(reviewId, userRole, userId) {
        const review = await this.findReviewWithRelations(reviewId);
        if (userRole === enums_1.UserRole.CUSTOMER) {
            const customer = await this.customerRepository.findOne({ where: { userId } });
            if (!customer || review.customerId !== customer.id) {
                throw new common_1.ForbiddenException('You can only delete your own reviews');
            }
        }
        else if (userRole === enums_1.UserRole.ADMIN) {
        }
        else if (userRole === enums_1.UserRole.BUSINESS_OWNER) {
            const businessOwner = await this.businessOwnerRepository.findOne({ where: { userId } });
            if (!businessOwner || review.businessOwnerId !== businessOwner.id) {
                throw new common_1.ForbiddenException('You can only delete reviews for your own business');
            }
        }
        await this.reviewRepository.delete(reviewId);
    }
    async getBusinessOwnerReviews(businessOwnerId, query) {
        const businessOwnerReviewsQuery = { ...query, businessOwnerId };
        return this.getReviews(businessOwnerReviewsQuery);
    }
    async getCustomerReviews(customerId, query) {
        const customerReviewsQuery = { ...query, customerId };
        return this.getReviews(customerReviewsQuery);
    }
    async findReviewWithRelations(reviewId) {
        const review = await this.reviewRepository.findOne({
            where: { id: reviewId },
            relations: ['customer', 'customer.user', 'businessOwner'],
        });
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        return this.formatReviewResponse(review);
    }
    formatReviewResponse(review) {
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
};
exports.ReviewService = ReviewService;
exports.ReviewService = ReviewService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(review_entity_1.Review)),
    __param(1, (0, typeorm_1.InjectRepository)(booking_entity_1.Booking)),
    __param(2, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __param(3, (0, typeorm_1.InjectRepository)(business_owner_entity_1.BusinessOwner)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ReviewService);
//# sourceMappingURL=review.service.js.map