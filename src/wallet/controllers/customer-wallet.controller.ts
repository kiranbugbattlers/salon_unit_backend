import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';
import { WalletService } from '../wallet.service';
import { RewardPointsService } from '../reward-points.service';
import { WalletUserType } from '../../database/entities';
import {
  WalletApiResponseDto,
  WalletStatsApiResponseDto,
  WalletTransactionListApiResponseDto,
  RewardPointsApiResponseDto,
  RedeemPointsDto,
  TierProgressDto,
  CustomerWalletOverviewApiResponseDto,
} from '../dto/wallet.dto';

@ApiTags('Customer - Wallet & Rewards')
@Controller('customer/wallet')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class CustomerWalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly rewardPointsService: RewardPointsService,
  ) {}

  @Get('stats')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({
    summary: 'Get comprehensive wallet statistics',
    description: `
      Get complete wallet and rewards overview in a single request.

      **This endpoint consolidates three separate calls into one:**
      - Wallet statistics (balance, earnings, spending)
      - Reward points (available, earned, redeemed, tier)
      - Tier progress (current tier, next tier, progress percentage)

      **Benefits:**
      - Reduced network overhead (1 call instead of 3)
      - Better performance
      - Easier frontend integration

      **Response includes:**
      1. **Wallet:** Balance, total earned, total spent, commission received, transaction count
      2. **Reward Points:** Points balance, tier status, bookings count, expiry info
      3. **Tier Progress:** Current tier, next tier, bookings needed, progress %

      **Use this endpoint for:**
      - Dashboard overview screens
      - Wallet summary pages
      - Quick stats display
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Wallet overview retrieved successfully',
    type: CustomerWalletOverviewApiResponseDto,
  })
  async getWalletStats(@Request() req: any): Promise<any> {
    const userId = req.user.userId;
    const customerId = req.user.customerId;

    const overview = await this.rewardPointsService.getCustomerWalletOverview(customerId, userId);

    return {
      code: 200,
      success: true,
      message: 'Wallet overview retrieved successfully',
      data: overview,
    };
  }

  @Get('transactions')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({
    summary: 'Get wallet transaction history',
    description: `
      View complete wallet transaction history including all money movements and reward points.

      **This endpoint consolidates all transaction types:**
      - Reward points earned from bookings
      - Reward points redeemed to wallet balance
      - Commission/rewards received
      - Refunds and adjustments
      - Payments and withdrawals

      **Each transaction shows:**
      - Type (credit/debit)
      - Category (reward_points, commission, refund, etc.)
      - Amount
      - Balance before/after
      - Description
      - Related booking/payment IDs
      - Timestamp

      **Filter by category:**
      - \`?category=reward_points\` - Points earned and redeemed (replaces /reward-points/history)
      - \`?category=commission\` - Commission/reward earnings
      - \`?category=refund\` - Refunds only
      - \`?category=adjustment\` - Manual adjustments

      **Examples:**
      - All transactions: \`GET /transactions\`
      - Reward points history: \`GET /transactions?category=reward_points\`
      - Recent refunds: \`GET /transactions?category=refund&page=1&limit=10\`
    `,
  })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, example: 20, description: 'Items per page (max 100)' })
  @ApiQuery({
    name: 'category',
    required: false,
    enum: ['reward_points', 'commission', 'refund', 'adjustment', 'booking_payment', 'withdrawal'],
    description: 'Filter by transaction category. Use "reward_points" for points earned/redeemed history.'
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction history retrieved successfully',
    type: WalletTransactionListApiResponseDto,
  })
  async getTransactions(
    @Request() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('category') category?: string,
  ): Promise<any> {
    const userId = req.user.userId;
    const wallet = await this.walletService.getOrCreateWallet(userId, WalletUserType.CUSTOMER);

    const result = await this.walletService.getTransactions(wallet.id, {
      page: page ? parseInt(String(page)) : 1,
      limit: limit ? parseInt(String(limit)) : 20,
      category: category as any,
    });

    return {
      code: 200,
      success: true,
      message: 'Transaction history retrieved',
      data: result,
    };
  }

  // ==================== Reward Points ====================

  @Get('reward-points/tier-benefits')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({
    summary: 'Get tier benefits',
    description: 'View benefits for all tiers to see what you can unlock.',
  })
  @ApiQuery({ name: 'tier', required: false, enum: ['bronze', 'silver', 'gold', 'platinum'] })
  @ApiResponse({
    status: 200,
    description: 'Tier benefits retrieved',
  })
  async getTierBenefits(@Query('tier') tier?: string): Promise<any> {
    if (tier) {
      const benefits = this.rewardPointsService.getTierBenefits(tier as any);
      return {
        code: 200,
        success: true,
        message: 'Tier benefits retrieved',
        data: benefits,
      };
    }

    // Return all tiers
    const allBenefits = ['bronze', 'silver', 'gold', 'platinum'].map(t =>
      this.rewardPointsService.getTierBenefits(t as any),
    );

    return {
      code: 200,
      success: true,
      message: 'All tier benefits retrieved',
      data: allBenefits,
    };
  }

  @Post('reward-points/redeem')
  @Roles(UserRole.CUSTOMER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Redeem reward points',
    description: `
      Convert reward points to wallet balance.

      Conversion: 1 point = 1 INR

      Example:
      - You have 500 points
      - Redeem 100 points
      - Points: 500 → 400
      - Wallet balance: +₹100

      Redeemed amount can be used for bookings or withdrawn.
    `,
  })
  @ApiBody({ type: RedeemPointsDto })
  @ApiResponse({
    status: 200,
    description: 'Points redeemed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Insufficient points',
  })
  async redeemPoints(
    @Request() req: any,
    @Body() redeemDto: RedeemPointsDto,
  ): Promise<any> {
    const customerId = req.user.customerId;
    const result = await this.rewardPointsService.redeemPoints(
      customerId,
      redeemDto.pointsToRedeem,
    );

    return {
      code: 200,
      success: true,
      message: `Successfully redeemed ${redeemDto.pointsToRedeem} points to ₹${redeemDto.pointsToRedeem}`,
      data: {
        pointsRedeemed: redeemDto.pointsToRedeem,
        remainingPoints: result.rewardPoints.totalPoints,
        newWalletBalance: result.walletBalance,
      },
    };
  }
}
