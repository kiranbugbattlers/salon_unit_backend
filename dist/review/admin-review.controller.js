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
exports.AdminReviewController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const enums_1 = require("../common/enums");
const review_service_1 = require("./review.service");
const review_dto_1 = require("./dto/review.dto");
let AdminReviewController = class AdminReviewController {
    constructor(reviewService) {
        this.reviewService = reviewService;
    }
    async getAllReviews(query) {
        return this.reviewService.getReviews(query);
    }
    async getReviewById(reviewId) {
        return this.reviewService.getReviewById(reviewId);
    }
    async updateReview(reviewId, updateReviewDto) {
        return this.reviewService.updateReview(reviewId, updateReviewDto, enums_1.UserRole.ADMIN);
    }
    async deleteReview(reviewId) {
        await this.reviewService.deleteReview(reviewId, enums_1.UserRole.ADMIN);
    }
    async getReviewsByBusinessOwner(businessOwnerId, query) {
        const businessReviewsQuery = { ...query, businessOwnerId };
        return this.reviewService.getReviews(businessReviewsQuery);
    }
    async getReviewsByCustomer(customerId, query) {
        const customerReviewsQuery = { ...query, customerId };
        return this.reviewService.getReviews(customerReviewsQuery);
    }
};
exports.AdminReviewController = AdminReviewController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all reviews (Admin only)',
        description: 'Get all reviews in the system with advanced filtering options',
    }),
    (0, swagger_1.ApiQuery)({ name: 'businessOwnerId', required: false, description: 'Filter by business owner ID' }),
    (0, swagger_1.ApiQuery)({ name: 'customerId', required: false, description: 'Filter by customer ID' }),
    (0, swagger_1.ApiQuery)({ name: 'rating', required: false, description: 'Filter by rating (1-5)' }),
    (0, swagger_1.ApiQuery)({ name: 'isApproved', required: false, description: 'Filter by approval status' }),
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
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin role required',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [review_dto_1.ReviewQueryDto]),
    __metadata("design:returntype", Promise)
], AdminReviewController.prototype, "getAllReviews", null);
__decorate([
    (0, common_1.Get)(':reviewId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get review by ID (Admin only)',
        description: 'Get any review by ID',
    }),
    (0, swagger_1.ApiParam)({ name: 'reviewId', description: 'Review ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Review retrieved successfully',
        type: review_dto_1.ReviewResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Review not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin role required',
    }),
    __param(0, (0, common_1.Param)('reviewId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminReviewController.prototype, "getReviewById", null);
__decorate([
    (0, common_1.Put)(':reviewId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Update any review (Admin only)',
        description: 'Update any review in the system. Admins can modify all fields including approval status.',
    }),
    (0, swagger_1.ApiParam)({ name: 'reviewId', description: 'Review ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Review updated successfully',
        type: review_dto_1.ReviewResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Review not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin role required',
    }),
    __param(0, (0, common_1.Param)('reviewId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, review_dto_1.UpdateReviewDto]),
    __metadata("design:returntype", Promise)
], AdminReviewController.prototype, "updateReview", null);
__decorate([
    (0, common_1.Delete)(':reviewId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete any review (Admin only)',
        description: 'Delete any review from the system',
    }),
    (0, swagger_1.ApiParam)({ name: 'reviewId', description: 'Review ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Review deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Review not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin role required',
    }),
    __param(0, (0, common_1.Param)('reviewId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminReviewController.prototype, "deleteReview", null);
__decorate([
    (0, common_1.Get)('business/:businessOwnerId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get reviews by business owner (Admin only)',
        description: 'Get all reviews for a specific business owner',
    }),
    (0, swagger_1.ApiParam)({ name: 'businessOwnerId', description: 'Business owner ID' }),
    (0, swagger_1.ApiQuery)({ name: 'rating', required: false, description: 'Filter by rating (1-5)' }),
    (0, swagger_1.ApiQuery)({ name: 'isApproved', required: false, description: 'Filter by approval status' }),
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
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin role required',
    }),
    __param(0, (0, common_1.Param)('businessOwnerId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, review_dto_1.ReviewQueryDto]),
    __metadata("design:returntype", Promise)
], AdminReviewController.prototype, "getReviewsByBusinessOwner", null);
__decorate([
    (0, common_1.Get)('customer/:customerId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get reviews by customer (Admin only)',
        description: 'Get all reviews written by a specific customer',
    }),
    (0, swagger_1.ApiParam)({ name: 'customerId', description: 'Customer ID' }),
    (0, swagger_1.ApiQuery)({ name: 'rating', required: false, description: 'Filter by rating (1-5)' }),
    (0, swagger_1.ApiQuery)({ name: 'isApproved', required: false, description: 'Filter by approval status' }),
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
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin role required',
    }),
    __param(0, (0, common_1.Param)('customerId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, review_dto_1.ReviewQueryDto]),
    __metadata("design:returntype", Promise)
], AdminReviewController.prototype, "getReviewsByCustomer", null);
exports.AdminReviewController = AdminReviewController = __decorate([
    (0, swagger_1.ApiTags)('Admin - Reviews'),
    (0, common_1.Controller)('admin/reviews'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    __metadata("design:paramtypes", [review_service_1.ReviewService])
], AdminReviewController);
//# sourceMappingURL=admin-review.controller.js.map