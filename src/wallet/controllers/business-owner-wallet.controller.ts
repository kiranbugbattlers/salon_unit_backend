import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';
import { WalletService } from '../wallet.service';
import { CommissionService } from '../commission.service';
import { SettlementService } from '../settlement.service';
import { CommissionPaymentService } from '../commission-payment.service';
import { DailySettlementService } from '../daily-settlement.service';
import { WalletUserType } from '../../database/entities';
import {
  WalletApiResponseDto,
  WalletStatsApiResponseDto,
  WalletTransactionListApiResponseDto,
  CommissionSummaryApiResponseDto,
  SettlementListApiResponseDto,
  SettlementApiResponseDto,
} from '../dto/wallet.dto';
import {
  CreateCommissionPaymentDto,
  CommissionPaymentResponseDto,
  VerifyCommissionPaymentDto,
  CommissionPaymentVerificationResponseDto,
} from '../dto/commission-payment.dto';

@ApiTags('Business Owner - Wallet & Earnings')
@Controller('business-owner/wallet')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class BusinessOwnerWalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly commissionService: CommissionService,
    private readonly settlementService: SettlementService,
    private readonly commissionPaymentService: CommissionPaymentService,
    private readonly dailySettlementService: DailySettlementService,
  ) {}


  @Get('stats')
  @Roles(UserRole.BUSINESS_OWNER)
  @ApiOperation({
    summary: 'Get wallet statistics and commission summary',
    description: `
      Get consolidated wallet statistics and commission summary.

      Shows:
      - Current balance (can be negative for COD commissions)
      - Total earned (lifetime)
      - Total spent (lifetime)
      - Total commission paid to company
      - Total commission received
      - Transaction count
      - Last transaction timestamp
      - Total bookings
      - Total booking amount
      - Average commission percentage
      - Net earnings (bookings - commission)
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Wallet statistics retrieved',
    type: WalletStatsApiResponseDto,
  })
  async getWalletStats(@Request() req: any): Promise<any> {
    const userId = req.user.userId;
    const businessOwnerId = req.user.businessOwnerId;
    const wallet = await this.walletService.getOrCreateWallet(userId, WalletUserType.BUSINESS_OWNER);
    const stats = await this.walletService.getWalletStats(wallet.id);

    // Get commission summary (includes payment method breakdown)
    const commissionSummary = await this.commissionService.getBusinessOwnerCommissionSummary(businessOwnerId);

    return {
      code: 200,
      success: true,
      message: 'Wallet statistics retrieved',
      data: {
        ...stats,
        totalBookings: commissionSummary.totalBookings,
        totalBookingAmount: commissionSummary.totalBookingAmount,
        averageCommissionPercent: commissionSummary.averageCommissionPercent,
        netEarnings: commissionSummary.netEarnings,
        codAmount: commissionSummary.codAmount,
        onlineAmount: commissionSummary.onlineAmount,
        gstAmount: commissionSummary.gstAmount,
        totalDeduction: commissionSummary.totalDeduction,
      },
    };
  }

  @Get('daily-stats')
  @Roles(UserRole.BUSINESS_OWNER)
  @ApiOperation({
    summary: 'Get daily settlement stats for the business',
    description: 'Get total amount, cash, online, platform fee, GST and settlement amount for a specific date or date range',
  })
  async getDailyStats(
    @Request() req: any,
    @Query('date') date?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<any> {
    const businessOwnerId = req.user.businessOwnerId;
    
    const result = await this.dailySettlementService.getSettlementDetails({
      businessOwnerId,
      date,
      startDate,
      endDate,
    });

    return {
      code: 200,
      success: true,
      message: 'Daily settlement statistics retrieved',
      data: result,
    };
  }

  @Get('daily-history')
  @Roles(UserRole.BUSINESS_OWNER)
  @ApiOperation({
    summary: 'Get daily settlement history for the business',
    description: 'Get historical daily settlement records with amounts and payment status',
  })
  async getDailyHistory(
    @Request() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<any> {
    const businessOwnerId = req.user.businessOwnerId;

    const result = await this.dailySettlementService.getAllHistory({
      page: page || 1,
      limit: limit || 10,
      startDate,
      endDate,
      businessOwnerId,
    });

    return {
      code: 200,
      success: true,
      message: 'Daily settlement history retrieved',
      data: result,
    };
  }

  @Get('transactions')
  @Roles(UserRole.BUSINESS_OWNER)
  @ApiOperation({
    summary: 'Get wallet transaction history',
    description: `
      View all wallet transactions (credits and debits).

      Includes:
      - Commission deductions
      - Settlement transactions
      - Manual adjustments
      - Refunds

      Transactions show before/after balance for audit trail.
    `,
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'category', required: false, enum: ['commission', 'settlement', 'refund', 'adjustment'] })
  @ApiQuery({ name: 'type', required: false, enum: ['credit', 'debit'] })
  @ApiResponse({
    status: 200,
    description: 'Transaction history retrieved',
    type: WalletTransactionListApiResponseDto,
  })
  async getTransactions(
    @Request() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('category') category?: string,
    @Query('type') type?: string,
  ): Promise<any> {
    const userId = req.user.userId;
    const wallet = await this.walletService.getOrCreateWallet(userId, WalletUserType.BUSINESS_OWNER);

    const result = await this.walletService.getTransactions(wallet.id, {
      page: page ? parseInt(String(page)) : 1,
      limit: limit ? parseInt(String(limit)) : 20,
      category: category as any,
      type: type as any,
    });

    return {
      code: 200,
      success: true,
      message: 'Transaction history retrieved',
      data: result,
    };
  }


  @Get('settlements')
  @Roles(UserRole.BUSINESS_OWNER)
  @ApiOperation({
    summary: 'Get monthly settlements',
    description: `
      View your monthly settlement history.

      Each settlement shows:
      - Total bookings for the month
      - Total booking amount
      - Commission charged
      - COD vs Online breakdown
      - Net amount payable
      - Payout status

      Positive net amount: Company pays you
      Negative net amount: You owe commission to company
    `,
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 12, description: '12 months per page' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'processing', 'completed', 'failed', 'requires_payment'] })
  @ApiResponse({
    status: 200,
    description: 'Settlements retrieved',
    type: SettlementListApiResponseDto,
  })
  async getSettlements(
    @Request() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ): Promise<any> {
    const businessOwnerId = req.user.businessOwnerId;

    const result = await this.settlementService.getBusinessOwnerSettlements(businessOwnerId, {
      page: page ? parseInt(String(page)) : 1,
      limit: limit ? parseInt(String(limit)) : 12,
      status: status as any,
    });

    return {
      code: 200,
      success: true,
      message: 'Settlements retrieved',
      data: result,
    };
  }

  @Get('settlements/:id')
  @Roles(UserRole.BUSINESS_OWNER)
  @ApiOperation({
    summary: 'Get settlement details',
    description: `
      View complete details of a specific settlement.

      Includes:
      - Summary (bookings, amounts, commission)
      - Line-by-line breakdown of all bookings
      - Payment status
      - Payout information
    `,
  })
  @ApiParam({ name: 'id', description: 'Settlement ID' })
  @ApiResponse({
    status: 200,
    description: 'Settlement details retrieved',
    type: SettlementApiResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Can only view own settlements' })
  async getSettlementDetails(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<any> {
    const businessOwnerId = req.user.businessOwnerId;
    const settlement = await this.settlementService.getSettlementById(id);

    // Verify ownership
    if (settlement.businessOwnerId !== businessOwnerId) {
      throw new Error('You can only view your own settlements');
    }

    return {
      code: 200,
      success: true,
      message: 'Settlement details retrieved',
      data: settlement,
    };
  }

  @Get('earnings-report')
  @Roles(UserRole.BUSINESS_OWNER)
  @ApiOperation({
    summary: 'Get earnings report',
    description: `
      Comprehensive earnings report with breakdowns.

      Shows:
      - Total bookings
      - Gross revenue
      - Commission paid
      - Net earnings
      - COD vs Online split
      - Month-over-month comparison

      Use for accounting and tax purposes.
    `,
  })
  @ApiQuery({ name: 'year', required: false, example: 2025 })
  @ApiQuery({ name: 'month', required: false, example: 1, description: '1-12' })
  @ApiResponse({
    status: 200,
    description: 'Earnings report generated',
  })
  async getEarningsReport(
    @Request() req: any,
    @Query('year') year?: number,
    @Query('month') month?: number,
  ): Promise<any> {
    const businessOwnerId = req.user.businessOwnerId;

    // Calculate date range
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month || now.getMonth() + 1;

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const commissionSummary = await this.commissionService.getBusinessOwnerCommissionSummary(
      businessOwnerId,
      startDate,
      endDate,
    );

    // Get settlement for the month (if exists - for historical data)
    const settlementMonth = `${targetYear}-${String(targetMonth).padStart(2, '0')}`;
    const settlements = await this.settlementService.getBusinessOwnerSettlements(businessOwnerId, {
      page: 1,
      limit: 1,
    });

    const monthSettlement = settlements.settlements.find(s => s.settlementMonth === settlementMonth);

    // Use commission summary breakdown (real-time) or settlement (historical)
    // Commission summary calculates from actual bookings, more accurate for current month
    const codAmount = commissionSummary.codAmount || monthSettlement?.totalCODAmount || 0;
    const onlineAmount = commissionSummary.onlineAmount || monthSettlement?.totalOnlineAmount || 0;

    return {
      code: 200,
      success: true,
      message: 'Earnings report generated',
      data: {
        period: settlementMonth,
        summary: commissionSummary,
        settlement: monthSettlement || null,
        breakdown: {
          totalBookings: commissionSummary.totalBookings,
          grossRevenue: commissionSummary.totalBookingAmount,
          commissionPaid: commissionSummary.totalCommissionPaid,
          netEarnings: commissionSummary.netEarnings,
          codAmount,
          onlineAmount,
        },
      },
    };
  }

  // ==================== Commission Payment ====================

  @Post('pay-commission')
  @Roles(UserRole.BUSINESS_OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Create commission payment order',
    description: `
      Pay your commission debt online via Razorpay.

      Use this when:
      - Your wallet has negative balance
      - You're marked as defaulter
      - You need to clear commission dues

      Process:
      1. Call this endpoint with amount
      2. Get Razorpay order details
      3. Show Razorpay payment page to user
      4. After payment, call verify endpoint

      The payment will:
      - Credit your wallet balance
      - Remove defaulter status (if balance becomes positive)
      - Record transaction history
    `,
  })
  @ApiBody({ type: CreateCommissionPaymentDto })
  @ApiResponse({
    status: 200,
    description: 'Payment order created successfully',
    type: CommissionPaymentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid amount or no debt to pay',
  })
  async createCommissionPayment(
    @Request() req: any,
    @Body() createPaymentDto: CreateCommissionPaymentDto,
  ): Promise<any> {
    const businessOwnerId = req.user.businessOwnerId;

    const paymentOrder = await this.commissionPaymentService.createCommissionPaymentOrder(
      businessOwnerId,
      createPaymentDto.amount,
      createPaymentDto.notes,
    );

    return {
      code: 200,
      success: true,
      message: 'Payment order created successfully',
      data: paymentOrder,
    };
  }

  @Post('pay-commission/verify')
  @Roles(UserRole.BUSINESS_OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify commission payment',
    description: `
      Verify payment after Razorpay payment is completed.

      Call this endpoint after customer completes payment on Razorpay.

      This will:
      - Verify payment signature
      - Update wallet balance
      - Remove defaulter status if applicable
      - Record transaction

      Required: razorpayOrderId, razorpayPaymentId, razorpaySignature
      (These are returned by Razorpay after successful payment)
    `,
  })
  @ApiBody({ type: VerifyCommissionPaymentDto })
  @ApiResponse({
    status: 200,
    description: 'Payment verified and wallet updated',
    type: CommissionPaymentVerificationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Payment verification failed',
  })
  async verifyCommissionPayment(
    @Request() req: any,
    @Body() verifyDto: VerifyCommissionPaymentDto,
  ): Promise<any> {
    const businessOwnerId = req.user.businessOwnerId;

    const result = await this.commissionPaymentService.verifyAndProcessPayment(
      businessOwnerId,
      verifyDto.razorpayOrderId,
      verifyDto.razorpayPaymentId,
      verifyDto.razorpaySignature,
    );

    return {
      code: 200,
      success: true,
      message: result.defaulterStatusRemoved
        ? 'Payment successful! Your commission debt is cleared and defaulter status removed.'
        : 'Payment successful! Your wallet balance has been updated.',
      data: result,
    };
  }

  @Get('payment-history')
  @Roles(UserRole.BUSINESS_OWNER)
  @ApiOperation({
    summary: 'Get commission payment history',
    description: `
      View history of all commission payments made.

      Shows:
      - Payment amount
      - Payment status (pending/completed/failed)
      - Razorpay transaction details
      - Balance before/after
      - Payment date
    `,
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Payment history retrieved',
  })
  async getPaymentHistory(
    @Request() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<any> {
    const businessOwnerId = req.user.businessOwnerId;

    const result = await this.commissionPaymentService.getPaymentHistory(businessOwnerId, {
      page: page ? parseInt(String(page)) : 1,
      limit: limit ? parseInt(String(limit)) : 20,
    });

    return {
      code: 200,
      success: true,
      message: 'Payment history retrieved',
      data: result,
    };
  }

  @Get('payment-history/:id')
  @Roles(UserRole.BUSINESS_OWNER)
  @ApiOperation({
    summary: 'Get payment details by ID',
    description: 'View complete details of a specific commission payment.',
  })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment details retrieved',
  })
  @ApiResponse({
    status: 404,
    description: 'Payment not found',
  })
  async getPaymentDetails(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<any> {
    const businessOwnerId = req.user.businessOwnerId;
    const payment = await this.commissionPaymentService.getPaymentById(id, businessOwnerId);

    return {
      code: 200,
      success: true,
      message: 'Payment details retrieved',
      data: payment,
    };
  }
}
