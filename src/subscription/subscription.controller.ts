import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { SubscriptionService } from './subscription.service';
import {
  CreateSubscriptionPlanDto,
  UpdateSubscriptionPlanDto,
  SubscribeBusinessDto,
  CancelSubscriptionDto,
  SubscriptionPlanResponseDto,
  BusinessSubscriptionResponseDto,
  SubscriptionListResponseDto,
  BusinessSubscriptionListResponseDto,
  CreateSubscriptionPaymentOrderDto,
  VerifySubscriptionPaymentDto,
  SubscriptionPaymentOrderResponseDto,
  VerifySubscriptionPaymentResponseDto,
  SubscriptionPaymentStatusResponseDto,
} from './dto';

@Controller('subscription')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT')
export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  // Admin endpoints for subscription plan management

  @Post('admin/plans')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiTags('Admin - Subscription Management')
  @ApiOperation({
    summary: '[ADMIN ONLY] Create subscription plan',
    description: 'Create a new subscription plan with pricing, features, and billing type. Only accessible by admin users.',
  })
  @ApiResponse({
    status: 201,
    description: 'Subscription plan created successfully',
    type: ApiResponseDto<SubscriptionPlanResponseDto>,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async createSubscriptionPlan(
    @Body() createPlanDto: CreateSubscriptionPlanDto,
  ): Promise<ApiResponseDto<SubscriptionPlanResponseDto>> {
    const data = await this.subscriptionService.createSubscriptionPlan(createPlanDto);
    return new ApiResponseDto(201, true, 'Subscription plan created successfully', data);
  }

  @Get('admin/plans')
  @Roles(UserRole.ADMIN)
  @ApiTags('Admin - Subscription Management')
  @ApiOperation({
    summary: '[ADMIN ONLY] Get all subscription plans',
    description: 'Retrieve all subscription plans including inactive ones. Admin can see both active and inactive plans for management purposes.',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription plans retrieved successfully',
    type: ApiResponseDto<SubscriptionListResponseDto>,
  })
  async getAllSubscriptionPlans(): Promise<ApiResponseDto<SubscriptionListResponseDto>> {
    const data = await this.subscriptionService.getAllSubscriptionPlans();
    return new ApiResponseDto(200, true, 'Subscription plans retrieved successfully', data);
  }

  @Get('admin/plans/:id')
  @Roles(UserRole.ADMIN)
  @ApiTags('Admin - Subscription Management')
  @ApiOperation({
    summary: '[ADMIN ONLY] Get subscription plan by ID',
    description: 'Retrieve details of a specific subscription plan by its ID. Includes usage statistics and active subscriptions count.',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription plan retrieved successfully',
    type: ApiResponseDto<SubscriptionPlanResponseDto>,
  })
  @ApiResponse({
    status: 404,
    description: 'Subscription plan not found',
  })
  async getSubscriptionPlanById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponseDto<SubscriptionPlanResponseDto>> {
    const data = await this.subscriptionService.getSubscriptionPlanById(id);
    return new ApiResponseDto(200, true, 'Subscription plan retrieved successfully', data);
  }

  @Put('admin/plans/:id')
  @Roles(UserRole.ADMIN)
  @ApiTags('Admin - Subscription Management')
  @ApiOperation({
    summary: '[ADMIN ONLY] Update subscription plan',
    description: 'Update an existing subscription plan. Cannot disable plans with active subscriptions. Price changes do not affect existing subscriptions.',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription plan updated successfully',
    type: ApiResponseDto<SubscriptionPlanResponseDto>,
  })
  @ApiResponse({
    status: 404,
    description: 'Subscription plan not found',
  })
  async updateSubscriptionPlan(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePlanDto: UpdateSubscriptionPlanDto,
  ): Promise<ApiResponseDto<SubscriptionPlanResponseDto>> {
    const data = await this.subscriptionService.updateSubscriptionPlan(id, updatePlanDto);
    return new ApiResponseDto(200, true, 'Subscription plan updated successfully', data);
  }

  @Delete('admin/plans/:id')
  @Roles(UserRole.ADMIN)
  @ApiTags('Admin - Subscription Management')
  @ApiOperation({
    summary: '[ADMIN ONLY] Delete subscription plan',
    description: 'Permanently delete a subscription plan. Cannot delete plans with active subscriptions. Use with caution!',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription plan deleted successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete plan with active subscriptions',
  })
  @ApiResponse({
    status: 404,
    description: 'Subscription plan not found',
  })
  async deleteSubscriptionPlan(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponseDto<null>> {
    await this.subscriptionService.deleteSubscriptionPlan(id);
    return new ApiResponseDto(200, true, 'Subscription plan deleted successfully', null);
  }

  @Get('admin/subscriptions')
  @Roles(UserRole.ADMIN)
  @ApiTags('Admin - Subscription Management')
  @ApiOperation({
    summary: '[ADMIN ONLY] Get all business subscriptions',
    description: 'Monitor all business subscriptions across the platform. View active, expired, and cancelled subscriptions with business details.',
  })
  @ApiResponse({
    status: 200,
    description: 'Business subscriptions retrieved successfully',
    type: ApiResponseDto<BusinessSubscriptionListResponseDto>,
  })
  async getAllBusinessSubscriptions(): Promise<ApiResponseDto<BusinessSubscriptionListResponseDto>> {
    const data = await this.subscriptionService.getAllBusinessSubscriptions();
    return new ApiResponseDto(200, true, 'Business subscriptions retrieved successfully', data);
  }

  @Post('admin/update-expired')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiTags('Admin - Subscription Management')
  @ApiOperation({
    summary: '[ADMIN ONLY] Update expired subscriptions',
    description: 'Manually trigger batch update of expired subscriptions. Useful for maintenance and cleanup tasks.',
  })
  @ApiResponse({
    status: 200,
    description: 'Expired subscriptions updated successfully',
    type: ApiResponseDto<{updated: number}>,
  })
  async updateExpiredSubscriptions(): Promise<ApiResponseDto<{updated: number}>> {
    const result = await this.subscriptionService.updateExpiredSubscriptions();
    return new ApiResponseDto(200, true, `Updated ${result.updated} expired subscriptions`, {updated: result.updated});
  }

  // Public endpoints for viewing available plans

  @Get('plans')
  @Public()
  @ApiTags('Public - Browse Plans')
  @ApiOperation({
    summary: '[PUBLIC] Browse available subscription plans',
    description: 'Public endpoint to view all active subscription plans. No authentication required. Businesses can browse pricing and features before subscribing.',
  })
  @ApiResponse({
    status: 200,
    description: 'Active subscription plans retrieved successfully',
    type: ApiResponseDto<SubscriptionListResponseDto>,
  })
  async getActiveSubscriptionPlans(): Promise<ApiResponseDto<SubscriptionListResponseDto>> {
    const data = await this.subscriptionService.getActiveSubscriptionPlans();
    return new ApiResponseDto(200, true, 'Active subscription plans retrieved successfully', data);
  }

  // Business owner endpoints

  @Post('subscribe')
  @Roles(UserRole.BUSINESS_OWNER)
  @HttpCode(HttpStatus.CREATED)
  @ApiTags('Business Owner - Subscription Management')
  @ApiOperation({
    summary: '[BUSINESS OWNER] Subscribe to a plan',
    description: 'Subscribe your approved business to a subscription plan. Only approved businesses can subscribe. Instant activation - no payment required currently.',
  })
  @ApiResponse({
    status: 201,
    description: 'Subscription created successfully',
    type: ApiResponseDto<BusinessSubscriptionResponseDto>,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only approved businesses can subscribe',
  })
  @ApiResponse({
    status: 409,
    description: 'Business already has an active subscription',
  })
  async subscribeBusinessToPlan(
    @CurrentUser() user: CurrentUserData,
    @Body() subscribeDto: SubscribeBusinessDto,
  ): Promise<ApiResponseDto<BusinessSubscriptionResponseDto>> {
    const data = await this.subscriptionService.subscribeBusinessToPlan(user.userId, subscribeDto);
    return new ApiResponseDto(201, true, 'Subscription created successfully', data);
  }

  @Get('my-subscription')
  @Roles(UserRole.BUSINESS_OWNER)
  @ApiTags('Business Owner - Subscription Management')
  @ApiOperation({
    summary: '[BUSINESS OWNER] Get current subscription',
    description: 'Get detailed information about your current subscription including expiry date, features, and billing information.',
  })
  @ApiResponse({
    status: 200,
    description: 'Current subscription retrieved successfully',
    type: ApiResponseDto<BusinessSubscriptionResponseDto>,
  })
  @ApiResponse({
    status: 404,
    description: 'No subscription found for this business',
  })
  async getCurrentSubscription(
    @CurrentUser() user: CurrentUserData,
  ): Promise<ApiResponseDto<BusinessSubscriptionResponseDto>> {
    const data = await this.subscriptionService.getBusinessSubscription(user.userId);
    return new ApiResponseDto(200, true, 'Current subscription retrieved successfully', data);
  }

  @Post('cancel')
  @Roles(UserRole.BUSINESS_OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiTags('Business Owner - Subscription Management')
  @ApiOperation({
    summary: '[BUSINESS OWNER] Cancel subscription',
    description: 'Cancel your current active subscription. You can provide a reason for cancellation. Access continues until expiry date.',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription cancelled successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'No active subscription found',
  })
  async cancelSubscription(
    @CurrentUser() user: CurrentUserData,
    @Body() cancelDto: CancelSubscriptionDto,
  ): Promise<ApiResponseDto<null>> {
    await this.subscriptionService.cancelBusinessSubscription(user.userId, cancelDto);
    return new ApiResponseDto(200, true, 'Subscription cancelled successfully', null);
  }

  @Get('history')
  @Roles(UserRole.BUSINESS_OWNER)
  @ApiTags('Business Owner - Subscription Management')
  @ApiOperation({
    summary: '[BUSINESS OWNER] Get subscription history',
    description: 'View complete subscription history including all past and current subscriptions, cancellations, and renewals.',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription history retrieved successfully',
    type: ApiResponseDto<BusinessSubscriptionListResponseDto>,
  })
  async getSubscriptionHistory(
    @CurrentUser() user: CurrentUserData,
  ): Promise<ApiResponseDto<BusinessSubscriptionListResponseDto>> {
    const data = await this.subscriptionService.getBusinessSubscriptionHistory(user.userId);
    return new ApiResponseDto(200, true, 'Subscription history retrieved successfully', data);
  }

  @Get('status')
  @Roles(UserRole.BUSINESS_OWNER)
  @ApiTags('Business Owner - Subscription Management')
  @ApiOperation({
    summary: '[BUSINESS OWNER] Check subscription status',
    description: 'Quick lightweight check to see if your business has an active subscription. Returns minimal data for fast UI updates.',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription status retrieved successfully',
    type: ApiResponseDto<{hasActive: boolean; subscription?: BusinessSubscriptionResponseDto}>,
  })
  async checkSubscriptionStatus(
    @CurrentUser() user: CurrentUserData,
  ): Promise<ApiResponseDto<{hasActive: boolean; subscription?: BusinessSubscriptionResponseDto}>> {
    const data = await this.subscriptionService.hasActiveSubscription(user.userId);
    return new ApiResponseDto(200, true, 'Subscription status retrieved successfully', data);
  }

  // Payment endpoints for subscription

  @Post('create-payment-order')
  @Roles(UserRole.BUSINESS_OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiTags('Business Owner - Subscription Payment')
  @ApiOperation({
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
  })
  @ApiResponse({
    status: 200,
    description: 'Payment order created successfully',
    type: SubscriptionPaymentOrderResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only approved businesses can subscribe',
  })
  @ApiResponse({
    status: 409,
    description: 'Business already has an active subscription',
  })
  async createSubscriptionPaymentOrder(
    @CurrentUser() user: CurrentUserData,
    @Body() createDto: CreateSubscriptionPaymentOrderDto,
  ): Promise<SubscriptionPaymentOrderResponseDto> {
    return this.subscriptionService.createSubscriptionPaymentOrder(user.userId, createDto);
  }

  @Post('verify-payment')
  @Roles(UserRole.BUSINESS_OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiTags('Business Owner - Subscription Payment')
  @ApiOperation({
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
  })
  @ApiResponse({
    status: 200,
    description: 'Payment verified successfully. Subscription activated.',
    type: VerifySubscriptionPaymentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - signature verification failed or already activated',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - can only verify payment for own subscription',
  })
  @ApiResponse({
    status: 404,
    description: 'Subscription not found',
  })
  async verifySubscriptionPayment(
    @CurrentUser() user: CurrentUserData,
    @Body() verifyDto: VerifySubscriptionPaymentDto,
  ): Promise<VerifySubscriptionPaymentResponseDto> {
    return this.subscriptionService.verifySubscriptionPayment(user.userId, verifyDto);
  }

  @Get('payment-status/:subscriptionId')
  @Roles(UserRole.BUSINESS_OWNER)
  @ApiTags('Business Owner - Subscription Payment')
  @ApiOperation({
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
  })
  @ApiResponse({
    status: 200,
    description: 'Payment status retrieved successfully',
    type: SubscriptionPaymentStatusResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Subscription not found',
  })
  async getSubscriptionPaymentStatus(
    @CurrentUser() user: CurrentUserData,
    @Param('subscriptionId', ParseUUIDPipe) subscriptionId: string,
  ): Promise<SubscriptionPaymentStatusResponseDto> {
    return this.subscriptionService.getSubscriptionPaymentStatus(user.userId, subscriptionId);
  }
}