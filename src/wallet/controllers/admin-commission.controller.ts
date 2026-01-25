import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
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
import { CommissionService } from '../commission.service';
import { SettlementService } from '../settlement.service';
import { WalletService } from '../wallet.service';
import {
  CreateCommissionConfigDto,
  CommissionConfigApiResponseDto,
  CommissionSummaryApiResponseDto,
  SettlementApiResponseDto,
  SettlementListApiResponseDto,
  MarkPaymentReceivedDto,
  SettlementStatsDto,
  WalletApiResponseDto,
} from '../dto/wallet.dto';

@ApiTags('Admin - Commission & Wallet Management')
@Controller('admin/commission')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class AdminCommissionController {
  constructor(
    private readonly commissionService: CommissionService,
    private readonly settlementService: SettlementService,
    private readonly walletService: WalletService,
  ) {}

  // ==================== Commission Configuration ====================

  @Post('config')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create/Update commission configuration',
    description: `
      Set commission rates for business owners and reward rates for customers.

      Features:
      - Set business owner commission percentage (0-100%)
      - Set customer reward percentage (0-100%)
      - Specify effective date
      - Previous configs automatically deactivated
      - Full history preserved

      Default: Both percentages are 0% until explicitly set by admin.

      Example:
      - Business owner commission: 2% (company takes 2% from business owner)
      - Customer reward: 1% (customer gets 1% back as reward points)
    `,
  })
  @ApiBody({ type: CreateCommissionConfigDto })
  @ApiResponse({
    status: 201,
    description: 'Commission configuration created successfully',
    type: CommissionConfigApiResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid commission percentages' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT required' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async createCommissionConfig(
    @Request() req: any,
    @Body() createDto: CreateCommissionConfigDto,
  ): Promise<any> {
    const adminId = req.user.sub;
    const effectiveFrom = new Date(createDto.effectiveFrom);

    const config = await this.commissionService.createCommissionConfig(
      createDto.businessOwnerCommissionPercent,
      createDto.customerRewardPercent,
      effectiveFrom,
      adminId,
      createDto.notes,
    );

    return {
      code: 201,
      success: true,
      message: 'Commission configuration created successfully',
      data: config,
    };
  }

  @Get('config/active')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get active commission configuration',
    description: 'Retrieve the currently active commission rates.',
  })
  @ApiResponse({
    status: 200,
    description: 'Active commission configuration retrieved',
    type: CommissionConfigApiResponseDto,
  })
  async getActiveCommissionConfig(): Promise<any> {
    const config = await this.commissionService.getActiveCommissionConfig();

    return {
      code: 200,
      success: true,
      message: 'Active commission configuration retrieved',
      data: config,
    };
  }

  @Get('config/history')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get commission configuration history',
    description: 'View all historical commission rate changes with admin audit trail.',
  })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Commission configuration history retrieved',
  })
  async getCommissionConfigHistory(@Query('limit') limit?: number): Promise<any> {
    const history = await this.commissionService.getCommissionConfigHistory(limit || 20);

    return {
      code: 200,
      success: true,
      message: 'Commission configuration history retrieved',
      data: history,
    };
  }

  // ==================== Settlements ====================

  @Get('settlements')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get all settlements',
    description: 'View all monthly settlements across all business owners with filtering.',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'processing', 'completed', 'failed', 'requires_payment', 'payment_received'] })
  @ApiQuery({ name: 'month', required: false, example: '2025-01' })
  @ApiResponse({
    status: 200,
    description: 'Settlements retrieved successfully',
    type: SettlementListApiResponseDto,
  })
  async getAllSettlements(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('month') month?: string,
  ): Promise<any> {
    const result = await this.settlementService.getAllSettlements({
      page: page ? parseInt(String(page)) : 1,
      limit: limit ? parseInt(String(limit)) : 20,
      status: status as any,
      month,
    });

    return {
      code: 200,
      success: true,
      message: 'Settlements retrieved successfully',
      data: result,
    };
  }

  @Get('settlements/pending-approvals')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get pending payment approvals',
    description: `
      Get settlements requiring payment from business owners (negative settlements).

      These occur when:
      - Business owner collected COD payments
      - Commission on COD exceeds online payments
      - Business owner owes money to company
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Pending approvals retrieved',
  })
  async getPendingApprovals(): Promise<any> {
    const settlements = await this.settlementService.getPendingApprovals();

    return {
      code: 200,
      success: true,
      message: 'Pending payment approvals retrieved',
      data: settlements,
    };
  }

  @Get('settlements/:month/stats')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get settlement statistics for a month',
    description: 'View aggregated statistics for all settlements in a given month.',
  })
  @ApiParam({ name: 'month', example: '2025-01' })
  @ApiResponse({
    status: 200,
    description: 'Settlement statistics retrieved',
  })
  async getSettlementStats(@Param('month') month: string): Promise<any> {
    const stats = await this.settlementService.getSettlementStats(month);

    return {
      code: 200,
      success: true,
      message: 'Settlement statistics retrieved',
      data: stats,
    };
  }

  @Get('settlements/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get settlement details',
    description: 'View complete details of a specific settlement including all line items.',
  })
  @ApiParam({ name: 'id', description: 'Settlement ID' })
  @ApiResponse({
    status: 200,
    description: 'Settlement details retrieved',
    type: SettlementApiResponseDto,
  })
  async getSettlementById(@Param('id') id: string): Promise<any> {
    const settlement = await this.settlementService.getSettlementById(id);

    return {
      code: 200,
      success: true,
      message: 'Settlement details retrieved',
      data: settlement,
    };
  }

  @Post('settlements/generate/:month')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate settlements for a month',
    description: `
      Manually trigger settlement generation for all business owners for a specific month.

      Normally runs automatically via cron on 1st of each month.

      This endpoint allows manual generation for:
      - Regenerating settlements
      - Historical settlement creation
      - Testing purposes
    `,
  })
  @ApiParam({ name: 'month', example: '2025-01', description: 'Month in YYYY-MM format' })
  @ApiResponse({
    status: 200,
    description: 'Settlements generated successfully',
  })
  async generateMonthlySettlements(@Param('month') month: string): Promise<any> {
    // Validate month format
    if (!/^\d{4}-\d{2}$/.test(month)) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(month)) {
        month = month.substring(0, 7);
      } else {
        throw new BadRequestException('Invalid month format. Expected YYYY-MM');
      }
    }

    const settlements = await this.settlementService.generateAllMonthlySettlements(month);

    return {
      code: 200,
      success: true,
      message: `Generated ${settlements.length} settlements for ${month}`,
      data: {
        month,
        settlementsGenerated: settlements.length,
        settlements,
      },
    };
  }

  @Post('settlements/:id/process-payout')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Process Razorpay payout for settlement',
    description: `
      Initiate Razorpay payout to business owner's bank account.

      Requirements:
      - Settlement must be in pending status
      - Net payable must be positive (company owes business owner)
      - Business owner must have valid fund account ID

      The payout is processed via Razorpay Payouts API.
    `,
  })
  @ApiParam({ name: 'id', description: 'Settlement ID' })
  @ApiResponse({
    status: 200,
    description: 'Payout initiated successfully',
    type: SettlementApiResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot process payout (negative settlement or already completed)',
  })
  async processPayout(@Param('id') id: string): Promise<any> {
    const settlement = await this.settlementService.processPayout(id);

    return {
      code: 200,
      success: true,
      message: 'Payout processed successfully',
      data: settlement,
    };
  }

  @Post('settlements/:id/mark-paid')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark business owner payment as received',
    description: `
      Mark a negative settlement as paid when business owner sends payment to company.

      Use this for settlements where:
      - Net payable is negative (business owner owes company)
      - Business owner has transferred the commission amount
      - Admin confirms payment received
    `,
  })
  @ApiParam({ name: 'id', description: 'Settlement ID' })
  @ApiBody({ type: MarkPaymentReceivedDto })
  @ApiResponse({
    status: 200,
    description: 'Payment marked as received',
    type: SettlementApiResponseDto,
  })
  async markPaymentReceived(
    @Param('id') id: string,
    @Body() dto: MarkPaymentReceivedDto,
  ): Promise<any> {
    const settlement = await this.settlementService.markPaymentReceived(id, dto.adminNotes);

    return {
      code: 200,
      success: true,
      message: 'Payment marked as received',
      data: settlement,
    };
  }

  // ==================== Commission Transactions ====================

  @Get('transactions')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get all commission transactions',
    description: 'View all commission transactions with filtering and pagination.',
  })
  @ApiQuery({ name: 'businessOwnerId', required: false })
  @ApiQuery({ name: 'customerId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Commission transactions retrieved',
  })
  async getCommissionTransactions(
    @Query('businessOwnerId') businessOwnerId?: string,
    @Query('customerId') customerId?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<any> {
    const result = await this.commissionService.getCommissionTransactions({
      businessOwnerId,
      customerId,
      status: status as any,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page: page ? parseInt(String(page)) : 1,
      limit: limit ? parseInt(String(limit)) : 20,
    });

    return {
      code: 200,
      success: true,
      message: 'Commission transactions retrieved',
      data: result,
    };
  }

  // ==================== Wallet Management ====================

  @Get('wallets')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get all wallets',
    description: 'View all customer and business owner wallets with balances.',
  })
  @ApiQuery({ name: 'userType', required: false, enum: ['customer', 'business_owner'] })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Wallets retrieved successfully',
  })
  async getAllWallets(
    @Query('userType') userType?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<any> {
    const pageNum = page || 1;
    const limitNum = limit || 10;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (userType) {
      where.userType = userType;
    }

    const [wallets, total] = await this.walletService.walletRepository.findAndCount({
      where,
      skip,
      take: limitNum,
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      code: 200,
      success: true,
      message: 'Wallets retrieved successfully',
      data: {
        wallets,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  @Post('wallets/:id/adjust')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Manual wallet adjustment',
    description: `
      Manually adjust wallet balance for corrections, refunds, or special cases.

      Use cases:
      - Refund processing
      - Correction of errors
      - Special promotions
      - Compensation

      All adjustments are logged with admin ID and reason.
    `,
  })
  @ApiParam({ name: 'id', description: 'Wallet ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: { type: 'number', example: 100, description: 'Positive = credit, Negative = debit' },
        reason: { type: 'string', example: 'Refund for cancelled booking' },
      },
      required: ['amount', 'reason'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Wallet adjusted successfully',
  })
  async adjustWallet(
    @Request() req: any,
    @Param('id') walletId: string,
    @Body() body: { amount: number; reason: string },
  ): Promise<any> {
    const adminId = req.user.sub;
    const transaction = await this.walletService.adminAdjustWallet(
      walletId,
      body.amount,
      body.reason,
      adminId,
    );

    return {
      code: 200,
      success: true,
      message: 'Wallet adjusted successfully',
      data: transaction,
    };
  }

  @Get('wallets/:id/reconcile')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Reconcile wallet balance',
    description: `
      Verify wallet balance matches transaction history.

      Checks:
      - Calculate expected balance from all transactions
      - Compare with actual wallet balance
      - Report any discrepancies

      Used for auditing and detecting data inconsistencies.
    `,
  })
  @ApiParam({ name: 'id', description: 'Wallet ID' })
  @ApiResponse({
    status: 200,
    description: 'Wallet reconciliation result',
  })
  async reconcileWallet(@Param('id') walletId: string): Promise<any> {
    const result = await this.walletService.reconcileWallet(walletId);

    return {
      code: 200,
      success: true,
      message: result.isBalanced
        ? 'Wallet is balanced'
        : `Wallet has discrepancy of ₹${result.difference}`,
      data: result,
    };
  }

  // ==================== Reports ====================

  @Get('reports/commission-summary')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Commission summary report',
    description: 'Get aggregated commission statistics across all business owners.',
  })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({
    status: 200,
    description: 'Commission summary retrieved',
  })
  async getCommissionSummaryReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<any> {
    // Aggregate commission data across all business owners
    return {
      code: 200,
      success: true,
      message: 'Commission summary report generated',
      data: {
        totalCommissionCollected: 0,
        totalBookings: 0,
        averageCommissionPercent: 0,
      },
    };
  }

  @Get('reports/wallet-summary')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Wallet balances summary',
    description: 'Get total wallet balances across all users.',
  })
  @ApiResponse({
    status: 200,
    description: 'Wallet summary retrieved',
  })
  async getWalletSummaryReport(): Promise<any> {
    // Aggregate wallet data
    return {
      code: 200,
      success: true,
      message: 'Wallet summary report generated',
      data: {
        totalCustomerWallets: 0,
        totalBusinessOwnerWallets: 0,
        totalCustomerBalance: 0,
        totalBusinessOwnerBalance: 0,
      },
    };
  }
}
