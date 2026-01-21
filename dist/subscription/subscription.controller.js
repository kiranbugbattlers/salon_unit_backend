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
exports.SubscriptionController = void 0;
const common_1 = require("@nestjs/common");
const public_decorator_1 = require("../common/decorators/public.decorator");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const enums_1 = require("../common/enums");
const api_response_dto_1 = require("../common/dto/api-response.dto");
const subscription_service_1 = require("./subscription.service");
const dto_1 = require("./dto");
let SubscriptionController = class SubscriptionController {
    constructor(subscriptionService) {
        this.subscriptionService = subscriptionService;
    }
    async createSubscriptionPlan(createPlanDto) {
        const data = await this.subscriptionService.createSubscriptionPlan(createPlanDto);
        return new api_response_dto_1.ApiResponseDto(201, true, 'Subscription plan created successfully', data);
    }
    async getAllSubscriptionPlans() {
        const data = await this.subscriptionService.getAllSubscriptionPlans();
        return new api_response_dto_1.ApiResponseDto(200, true, 'Subscription plans retrieved successfully', data);
    }
    async getSubscriptionPlanById(id) {
        const data = await this.subscriptionService.getSubscriptionPlanById(id);
        return new api_response_dto_1.ApiResponseDto(200, true, 'Subscription plan retrieved successfully', data);
    }
    async updateSubscriptionPlan(id, updatePlanDto) {
        const data = await this.subscriptionService.updateSubscriptionPlan(id, updatePlanDto);
        return new api_response_dto_1.ApiResponseDto(200, true, 'Subscription plan updated successfully', data);
    }
    async deleteSubscriptionPlan(id) {
        await this.subscriptionService.deleteSubscriptionPlan(id);
        return new api_response_dto_1.ApiResponseDto(200, true, 'Subscription plan deleted successfully', null);
    }
    async getAllBusinessSubscriptions() {
        const data = await this.subscriptionService.getAllBusinessSubscriptions();
        return new api_response_dto_1.ApiResponseDto(200, true, 'Business subscriptions retrieved successfully', data);
    }
    async updateExpiredSubscriptions() {
        const result = await this.subscriptionService.updateExpiredSubscriptions();
        return new api_response_dto_1.ApiResponseDto(200, true, `Updated ${result.updated} expired subscriptions`, { updated: result.updated });
    }
    async getActiveSubscriptionPlans() {
        const data = await this.subscriptionService.getActiveSubscriptionPlans();
        return new api_response_dto_1.ApiResponseDto(200, true, 'Active subscription plans retrieved successfully', data);
    }
    async subscribeBusinessToPlan(user, subscribeDto) {
        const data = await this.subscriptionService.subscribeBusinessToPlan(user.userId, subscribeDto);
        return new api_response_dto_1.ApiResponseDto(201, true, 'Subscription created successfully', data);
    }
    async getCurrentSubscription(user) {
        const data = await this.subscriptionService.getBusinessSubscription(user.userId);
        return new api_response_dto_1.ApiResponseDto(200, true, 'Current subscription retrieved successfully', data);
    }
    async cancelSubscription(user, cancelDto) {
        await this.subscriptionService.cancelBusinessSubscription(user.userId, cancelDto);
        return new api_response_dto_1.ApiResponseDto(200, true, 'Subscription cancelled successfully', null);
    }
    async getSubscriptionHistory(user) {
        const data = await this.subscriptionService.getBusinessSubscriptionHistory(user.userId);
        return new api_response_dto_1.ApiResponseDto(200, true, 'Subscription history retrieved successfully', data);
    }
    async checkSubscriptionStatus(user) {
        const data = await this.subscriptionService.hasActiveSubscription(user.userId);
        return new api_response_dto_1.ApiResponseDto(200, true, 'Subscription status retrieved successfully', data);
    }
    async createSubscriptionPaymentOrder(user, createDto) {
        return this.subscriptionService.createSubscriptionPaymentOrder(user.userId, createDto);
    }
    async verifySubscriptionPayment(user, verifyDto) {
        return this.subscriptionService.verifySubscriptionPayment(user.userId, verifyDto);
    }
    async getSubscriptionPaymentStatus(user, subscriptionId) {
        return this.subscriptionService.getSubscriptionPaymentStatus(user.userId, subscriptionId);
    }
};
exports.SubscriptionController = SubscriptionController;
__decorate([
    (0, common_1.Post)('admin/plans'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiTags)('Admin - Subscription Management'),
    (0, swagger_1.ApiOperation)({
        summary: '[ADMIN ONLY] Create subscription plan',
        description: 'Create a new subscription plan with pricing, features, and billing type. Only accessible by admin users.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Subscription plan created successfully',
        type: (api_response_dto_1.ApiResponseDto),
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin access required',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateSubscriptionPlanDto]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "createSubscriptionPlan", null);
__decorate([
    (0, common_1.Get)('admin/plans'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiTags)('Admin - Subscription Management'),
    (0, swagger_1.ApiOperation)({
        summary: '[ADMIN ONLY] Get all subscription plans',
        description: 'Retrieve all subscription plans including inactive ones. Admin can see both active and inactive plans for management purposes.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Subscription plans retrieved successfully',
        type: (api_response_dto_1.ApiResponseDto),
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getAllSubscriptionPlans", null);
__decorate([
    (0, common_1.Get)('admin/plans/:id'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiTags)('Admin - Subscription Management'),
    (0, swagger_1.ApiOperation)({
        summary: '[ADMIN ONLY] Get subscription plan by ID',
        description: 'Retrieve details of a specific subscription plan by its ID. Includes usage statistics and active subscriptions count.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Subscription plan retrieved successfully',
        type: (api_response_dto_1.ApiResponseDto),
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Subscription plan not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getSubscriptionPlanById", null);
__decorate([
    (0, common_1.Put)('admin/plans/:id'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiTags)('Admin - Subscription Management'),
    (0, swagger_1.ApiOperation)({
        summary: '[ADMIN ONLY] Update subscription plan',
        description: 'Update an existing subscription plan. Cannot disable plans with active subscriptions. Price changes do not affect existing subscriptions.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Subscription plan updated successfully',
        type: (api_response_dto_1.ApiResponseDto),
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Subscription plan not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateSubscriptionPlanDto]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "updateSubscriptionPlan", null);
__decorate([
    (0, common_1.Delete)('admin/plans/:id'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiTags)('Admin - Subscription Management'),
    (0, swagger_1.ApiOperation)({
        summary: '[ADMIN ONLY] Delete subscription plan',
        description: 'Permanently delete a subscription plan. Cannot delete plans with active subscriptions. Use with caution!',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Subscription plan deleted successfully',
        type: api_response_dto_1.ApiResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Cannot delete plan with active subscriptions',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Subscription plan not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "deleteSubscriptionPlan", null);
__decorate([
    (0, common_1.Get)('admin/subscriptions'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiTags)('Admin - Subscription Management'),
    (0, swagger_1.ApiOperation)({
        summary: '[ADMIN ONLY] Get all business subscriptions',
        description: 'Monitor all business subscriptions across the platform. View active, expired, and cancelled subscriptions with business details.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Business subscriptions retrieved successfully',
        type: (api_response_dto_1.ApiResponseDto),
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getAllBusinessSubscriptions", null);
__decorate([
    (0, common_1.Post)('admin/update-expired'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiTags)('Admin - Subscription Management'),
    (0, swagger_1.ApiOperation)({
        summary: '[ADMIN ONLY] Update expired subscriptions',
        description: 'Manually trigger batch update of expired subscriptions. Useful for maintenance and cleanup tasks.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Expired subscriptions updated successfully',
        type: (api_response_dto_1.ApiResponseDto),
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "updateExpiredSubscriptions", null);
__decorate([
    (0, common_1.Get)('plans'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiTags)('Public - Browse Plans'),
    (0, swagger_1.ApiOperation)({
        summary: '[PUBLIC] Browse available subscription plans',
        description: 'Public endpoint to view all active subscription plans. No authentication required. Businesses can browse pricing and features before subscribing.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Active subscription plans retrieved successfully',
        type: (api_response_dto_1.ApiResponseDto),
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getActiveSubscriptionPlans", null);
__decorate([
    (0, common_1.Post)('subscribe'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.BUSINESS_OWNER),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiTags)('Business Owner - Subscription Management'),
    (0, swagger_1.ApiOperation)({
        summary: '[BUSINESS OWNER] Subscribe to a plan',
        description: 'Subscribe your approved business to a subscription plan. Only approved businesses can subscribe. Instant activation - no payment required currently.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Subscription created successfully',
        type: (api_response_dto_1.ApiResponseDto),
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Only approved businesses can subscribe',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Business already has an active subscription',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.SubscribeBusinessDto]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "subscribeBusinessToPlan", null);
__decorate([
    (0, common_1.Get)('my-subscription'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.BUSINESS_OWNER),
    (0, swagger_1.ApiTags)('Business Owner - Subscription Management'),
    (0, swagger_1.ApiOperation)({
        summary: '[BUSINESS OWNER] Get current subscription',
        description: 'Get detailed information about your current subscription including expiry date, features, and billing information.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Current subscription retrieved successfully',
        type: (api_response_dto_1.ApiResponseDto),
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'No subscription found for this business',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getCurrentSubscription", null);
__decorate([
    (0, common_1.Post)('cancel'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.BUSINESS_OWNER),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiTags)('Business Owner - Subscription Management'),
    (0, swagger_1.ApiOperation)({
        summary: '[BUSINESS OWNER] Cancel subscription',
        description: 'Cancel your current active subscription. You can provide a reason for cancellation. Access continues until expiry date.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Subscription cancelled successfully',
        type: api_response_dto_1.ApiResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'No active subscription found',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CancelSubscriptionDto]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "cancelSubscription", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.BUSINESS_OWNER),
    (0, swagger_1.ApiTags)('Business Owner - Subscription Management'),
    (0, swagger_1.ApiOperation)({
        summary: '[BUSINESS OWNER] Get subscription history',
        description: 'View complete subscription history including all past and current subscriptions, cancellations, and renewals.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Subscription history retrieved successfully',
        type: (api_response_dto_1.ApiResponseDto),
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getSubscriptionHistory", null);
__decorate([
    (0, common_1.Get)('status'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.BUSINESS_OWNER),
    (0, swagger_1.ApiTags)('Business Owner - Subscription Management'),
    (0, swagger_1.ApiOperation)({
        summary: '[BUSINESS OWNER] Check subscription status',
        description: 'Quick lightweight check to see if your business has an active subscription. Returns minimal data for fast UI updates.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Subscription status retrieved successfully',
        type: (api_response_dto_1.ApiResponseDto),
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "checkSubscriptionStatus", null);
__decorate([
    (0, common_1.Post)('create-payment-order'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.BUSINESS_OWNER),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiTags)('Business Owner - Subscription Payment'),
    (0, swagger_1.ApiOperation)({
        summary: '[BUSINESS OWNER] Create subscription payment order',
        description: `
      Create a Razorpay payment order for a subscription plan.

      **Authentication Required - Business Owner Only**

      Flow:
      1. Business owner selects subscription plan
      2. Backend creates PENDING subscription + Razorpay order
      3. Returns order details: orderId, amount, currency, razorpayKeyId
      4. Flutter app opens Razorpay SDK with these details
      5. User completes payment in Razorpay
      6. Flutter calls verify-payment endpoint

      Prerequisites:
      - Business must be approved
      - No existing ACTIVE subscription
      - Plan must be active

      Response includes all details needed for Flutter Razorpay SDK.
    `,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Payment order created successfully',
        type: dto_1.SubscriptionPaymentOrderResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Only approved businesses can subscribe',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Business already has an active subscription',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateSubscriptionPaymentOrderDto]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "createSubscriptionPaymentOrder", null);
__decorate([
    (0, common_1.Post)('verify-payment'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.BUSINESS_OWNER),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiTags)('Business Owner - Subscription Payment'),
    (0, swagger_1.ApiOperation)({
        summary: '[BUSINESS OWNER] Verify payment and activate subscription',
        description: `
      Verify Razorpay payment signature and activate subscription.

      **Authentication Required - Business Owner Only**

      Flow:
      1. User completes payment in Razorpay SDK (Flutter)
      2. Razorpay SDK returns payment details to Flutter
      3. Flutter calls this endpoint with: subscriptionId, orderId, paymentId, signature
      4. Backend verifies signature (HMAC SHA256)
      5. If valid, activates subscription (PENDING → ACTIVE)
      6. Updates transaction record
      7. Returns activated subscription details

      Security:
      - Payment signature verified using HMAC SHA256
      - Signature = HMAC(order_id|payment_id, razorpay_secret)
      - Only valid payments activate subscriptions
      - Idempotent - prevents duplicate activation

      After Success:
      - Subscription status: ACTIVE
      - Business can access premium features
    `,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Payment verified successfully. Subscription activated.',
        type: dto_1.VerifySubscriptionPaymentResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - signature verification failed or already activated',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - can only verify payment for own subscription',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Subscription not found',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.VerifySubscriptionPaymentDto]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "verifySubscriptionPayment", null);
__decorate([
    (0, common_1.Get)('payment-status/:subscriptionId'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.BUSINESS_OWNER),
    (0, swagger_1.ApiTags)('Business Owner - Subscription Payment'),
    (0, swagger_1.ApiOperation)({
        summary: '[BUSINESS OWNER] Get payment status for subscription',
        description: `
      Check payment status for a subscription.

      Use Cases:
      - Check if payment is pending
      - Get Razorpay order ID for retry
      - Verify if subscription is activated

      Returns:
      - Subscription status (PENDING, ACTIVE, etc.)
      - Razorpay order ID if exists
      - Whether payment can be retried
      - Plan details and amount
    `,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Payment status retrieved successfully',
        type: dto_1.SubscriptionPaymentStatusResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Subscription not found',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('subscriptionId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getSubscriptionPaymentStatus", null);
exports.SubscriptionController = SubscriptionController = __decorate([
    (0, common_1.Controller)('subscription'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    __metadata("design:paramtypes", [subscription_service_1.SubscriptionService])
], SubscriptionController);
//# sourceMappingURL=subscription.controller.js.map