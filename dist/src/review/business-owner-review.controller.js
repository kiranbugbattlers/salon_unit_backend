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
exports.BusinessOwnerReviewController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const enums_1 = require("../common/enums");
const review_service_1 = require("./review.service");
const typeorm_1 = require("@nestjs/typeorm");
const business_owner_entity_1 = require("../database/entities/business-owner.entity");
const typeorm_2 = require("typeorm");
const review_dto_1 = require("./dto/review.dto");
let BusinessOwnerReviewController = class BusinessOwnerReviewController {
    constructor(reviewService, businessOwnerRepository) {
        this.reviewService = reviewService;
        this.businessOwnerRepository = businessOwnerRepository;
    }
    async getMyBusinessReviews(req, query) {
        let businessOwnerId = req.user.businessOwnerId;
        if (!businessOwnerId && req.user.userId) {
            const businessOwner = await this.businessOwnerRepository.findOne({
                where: { userId: req.user.userId }
            });
            if (businessOwner) {
                businessOwnerId = businessOwner.id;
            }
        }
        if (businessOwnerId) {
            return this.reviewService.getBusinessOwnerReviews(businessOwnerId, query);
        }
        return this.reviewService.getReviews(query);
    }
    async getReviewById(req, reviewId) {
        const review = await this.reviewService.getReviewById(reviewId);
        let businessOwnerId = req.user.businessOwnerId;
        if (!businessOwnerId && req.user.userId) {
            const businessOwner = await this.businessOwnerRepository.findOne({
                where: { userId: req.user.userId }
            });
            if (businessOwner) {
                businessOwnerId = businessOwner.id;
            }
        }
        if (businessOwnerId && review.businessOwnerId !== businessOwnerId) {
            throw new Error('Review not found or does not belong to this business');
        }
        return review;
    }
    async updateReviewApproval(req, reviewId, updateReviewDto) {
        return this.reviewService.updateReview(reviewId, updateReviewDto, enums_1.UserRole.BUSINESS_OWNER, req.user.userId);
    }
    async deleteReview(req, reviewId) {
        await this.reviewService.deleteReview(reviewId, enums_1.UserRole.BUSINESS_OWNER, req.user.userId);
    }
};
exports.BusinessOwnerReviewController = BusinessOwnerReviewController;
__decorate([
    (0, common_1.Get)('my-reviews'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get reviews for my business',
        description: 'Get all reviews for the current business owner\'s business. If no business owner profile exists, returns all reviews in the system.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'rating', required: false, description: 'Filter by rating (1-5)' }),
    (0, swagger_1.ApiQuery)({ name: 'isApproved', required: false, description: 'Filter by approval status' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number', example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Number of reviews per page', example: 10 }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Reviews retrieved successfully - returns business-specific reviews if profile exists, otherwise returns all reviews',
        type: review_dto_1.ReviewListResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, review_dto_1.ReviewQueryDto]),
    __metadata("design:returntype", Promise)
], BusinessOwnerReviewController.prototype, "getMyBusinessReviews", null);
__decorate([
    (0, common_1.Get)(':reviewId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get review by ID',
        description: 'Get a specific review by ID. If business owner profile exists, only returns reviews belonging to that business. Otherwise, returns any review.',
    }),
    (0, swagger_1.ApiParam)({ name: 'reviewId', description: 'Review ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Review retrieved successfully',
        type: review_dto_1.ReviewResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Review not found (for business owners with profiles, also verifies ownership)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('reviewId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BusinessOwnerReviewController.prototype, "getReviewById", null);
__decorate([
    (0, common_1.Put)(':reviewId/approve'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Approve or disapprove review',
        description: 'Approve or disapprove a review for your business. Only business owners can change approval status.',
    }),
    (0, swagger_1.ApiParam)({ name: 'reviewId', description: 'Review ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Review approval status updated successfully',
        type: review_dto_1.ReviewResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Cannot edit this review',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Review not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('reviewId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, review_dto_1.UpdateReviewDto]),
    __metadata("design:returntype", Promise)
], BusinessOwnerReviewController.prototype, "updateReviewApproval", null);
__decorate([
    (0, common_1.Delete)(':reviewId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete review from my business',
        description: 'Delete a review for the current business owner\'s business',
    }),
    (0, swagger_1.ApiParam)({ name: 'reviewId', description: 'Review ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Review deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Cannot delete this review',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Review not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('reviewId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BusinessOwnerReviewController.prototype, "deleteReview", null);
exports.BusinessOwnerReviewController = BusinessOwnerReviewController = __decorate([
    (0, swagger_1.ApiTags)('Business Owner - Reviews'),
    (0, common_1.Controller)('business-owner/reviews'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.BUSINESS_OWNER),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    __param(1, (0, typeorm_1.InjectRepository)(business_owner_entity_1.BusinessOwner)),
    __metadata("design:paramtypes", [review_service_1.ReviewService,
        typeorm_2.Repository])
], BusinessOwnerReviewController);
//# sourceMappingURL=business-owner-review.controller.js.map