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
exports.CustomerReviewController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../common/decorators/public.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const enums_1 = require("../common/enums");
const review_service_1 = require("./review.service");
const typeorm_1 = require("@nestjs/typeorm");
const customer_entity_1 = require("../database/entities/customer.entity");
const typeorm_2 = require("typeorm");
const review_dto_1 = require("./dto/review.dto");
let CustomerReviewController = class CustomerReviewController {
    constructor(reviewService, customerRepository) {
        this.reviewService = reviewService;
        this.customerRepository = customerRepository;
    }
    async getAllReviews(query) {
        return this.reviewService.getReviews(query);
    }
    async createReview(user, createReviewDto) {
        const customer = await this.customerRepository.findOne({ where: { userId: user.userId } });
        if (!customer) {
            throw new Error('Customer profile not found');
        }
        return this.reviewService.createReview(customer.id, createReviewDto);
    }
    async getMyReviews(user, query) {
        const customer = await this.customerRepository.findOne({ where: { userId: user.userId } });
        if (!customer) {
            throw new Error('Customer profile not found');
        }
        return this.reviewService.getCustomerReviews(customer.id, query);
    }
    async getReviewById(user, reviewId) {
        const review = await this.reviewService.getReviewById(reviewId);
        const customer = await this.customerRepository.findOne({ where: { userId: user.userId } });
        if (!customer || review.customerId !== customer.id) {
            throw new Error('Review not found or does not belong to this customer');
        }
        return review;
    }
    async updateReview(user, reviewId, updateReviewDto) {
        return this.reviewService.updateReview(reviewId, updateReviewDto, enums_1.UserRole.CUSTOMER, user.userId);
    }
    async deleteReview(user, reviewId) {
        await this.reviewService.deleteReview(reviewId, enums_1.UserRole.CUSTOMER, user.userId);
    }
};
exports.CustomerReviewController = CustomerReviewController;
__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all reviews',
        description: 'Get all approved reviews for a business. Use businessOwnerId to filter by business.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Reviews retrieved successfully',
        type: review_dto_1.ReviewListResponseDto,
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [review_dto_1.ReviewQueryDto]),
    __metadata("design:returntype", Promise)
], CustomerReviewController.prototype, "getAllReviews", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new review',
        description: 'Create a review for a completed booking. Only one review per booking is allowed.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Review created successfully',
        type: review_dto_1.ReviewResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Review already exists for this booking or invalid data',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Booking not found or does not belong to this customer',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, review_dto_1.CreateReviewDto]),
    __metadata("design:returntype", Promise)
], CustomerReviewController.prototype, "createReview", null);
__decorate([
    (0, common_1.Get)('my-reviews'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get my reviews',
        description: 'Get all reviews written by the current customer',
    }),
    (0, swagger_1.ApiQuery)({ name: 'rating', required: false, description: 'Filter by rating (1-5)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number', example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Number of reviews per page', example: 10 }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Reviews retrieved successfully',
        type: review_dto_1.ReviewListResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, review_dto_1.ReviewQueryDto]),
    __metadata("design:returntype", Promise)
], CustomerReviewController.prototype, "getMyReviews", null);
__decorate([
    (0, common_1.Get)(':reviewId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get review by ID',
        description: 'Get a specific review by ID (only if it belongs to the current customer)',
    }),
    (0, swagger_1.ApiParam)({ name: 'reviewId', description: 'Review ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Review retrieved successfully',
        type: review_dto_1.ReviewResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Review not found or does not belong to this customer',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('reviewId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CustomerReviewController.prototype, "getReviewById", null);
__decorate([
    (0, common_1.Put)(':reviewId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Update my review',
        description: 'Update a review written by the current customer. Cannot change approval status.',
    }),
    (0, swagger_1.ApiParam)({ name: 'reviewId', description: 'Review ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Review updated successfully',
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
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('reviewId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, review_dto_1.UpdateReviewDto]),
    __metadata("design:returntype", Promise)
], CustomerReviewController.prototype, "updateReview", null);
__decorate([
    (0, common_1.Delete)(':reviewId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete my review',
        description: 'Delete a review written by the current customer',
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
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('reviewId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CustomerReviewController.prototype, "deleteReview", null);
exports.CustomerReviewController = CustomerReviewController = __decorate([
    (0, swagger_1.ApiTags)('Customer - Reviews'),
    (0, common_1.Controller)('customer/reviews'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.CUSTOMER),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    __param(1, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __metadata("design:paramtypes", [review_service_1.ReviewService,
        typeorm_2.Repository])
], CustomerReviewController);
//# sourceMappingURL=customer-review.controller.js.map