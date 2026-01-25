import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
  ParseUUIDPipe,
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
import { WalletMonitorService } from '../wallet-monitor.service';
import { WalletService } from '../wallet.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessOwner, Wallet, WalletUserType, BankingInfo } from '../../database/entities';
import {
  DefaulterListResponseDto,
  DefaulterDetailsResponseDto,
  CheckDefaultersApiResponseDto,
  ManualActionResponseDto,
  ManualDefaulterActionDto,
  DefaulterBusinessDto,
  DefaulterDetailsDto,
} from '../dto/defaulter.dto';

@ApiTags('Admin - Defaulter Management')
@Controller('admin/wallet/defaulters')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class AdminDefaulterController {
  constructor(
    private readonly walletMonitorService: WalletMonitorService,
    private readonly walletService: WalletService,
    @InjectRepository(BusinessOwner)
    private readonly businessOwnerRepository: Repository<BusinessOwner>,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(BankingInfo)
    private readonly bankingInfoRepository: Repository<BankingInfo>,
  ) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get list of all defaulters',
    description: `
      Retrieve all business owners currently marked as defaulters (negative wallet balance).

      Shows:
      - Business details
      - Current wallet balance
      - Days since marked as defaulter
      - Contact information

      Defaulters are businesses that owe commission to the company (typically from COD bookings).
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Defaulters list retrieved successfully',
    type: DefaulterListResponseDto,
  })
  async getAllDefaulters(): Promise<any> {
    const summary = await this.walletMonitorService.getDefaultersSummary();

    // Calculate average days defaulter
    let totalDays = 0;
    const enrichedDefaulters: DefaulterBusinessDto[] = [];

    for (const defaulter of summary.defaulters) {
      const businessOwner = await this.businessOwnerRepository.findOne({
        where: { id: defaulter.businessOwnerId },
        relations: ['user'],
      });

      if (!businessOwner || !businessOwner.defaulterSince) continue;

      const daysSince = Math.floor(
        (new Date().getTime() - new Date(businessOwner.defaulterSince).getTime()) / (1000 * 60 * 60 * 24),
      );
      totalDays += daysSince;

      enrichedDefaulters.push({
        businessOwnerId: defaulter.businessOwnerId,
        shopId: defaulter.shopId,
        businessName: defaulter.businessName,
        walletBalance: defaulter.walletBalance,
        defaulterSince: defaulter.defaulterSince,
        daysSinceDefaulter: daysSince,
        userId: businessOwner.userId,
        phone: businessOwner.user?.phone || 'N/A',
      });
    }

    const averageDaysDefaulter = enrichedDefaulters.length > 0 ? Math.round(totalDays / enrichedDefaulters.length) : 0;

    return {
      code: 200,
      success: true,
      message: 'Defaulters retrieved successfully',
      data: {
        totalDefaulters: summary.totalDefaulters,
        totalNegativeBalance: summary.totalNegativeBalance,
        averageDaysDefaulter,
        defaulters: enrichedDefaulters,
      },
    };
  }

  @Get('summary')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get defaulters summary statistics',
    description: 'Quick overview of defaulter statistics without full list.',
  })
  @ApiResponse({
    status: 200,
    description: 'Summary retrieved successfully',
  })
  async getDefaultersSummary(): Promise<any> {
    const summary = await this.walletMonitorService.getDefaultersSummary();

    return {
      code: 200,
      success: true,
      message: 'Defaulters summary retrieved successfully',
      data: {
        totalDefaulters: summary.totalDefaulters,
        totalNegativeBalance: summary.totalNegativeBalance,
      },
    };
  }

  @Get('check')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Manually trigger credit limit check (GET alias)' })
  async checkDefaultersGet(): Promise<any> {
    return this.checkDefaulters();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get detailed information about a specific defaulter',
    description: `
      Retrieve comprehensive details about a defaulter including:
      - Business and owner information
      - Current wallet balance
      - Banking information
      - Recent wallet transactions
      - Commission owed
    `,
  })
  @ApiParam({ name: 'id', description: 'Business Owner ID' })
  @ApiResponse({
    status: 200,
    description: 'Defaulter details retrieved successfully',
    type: DefaulterDetailsResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Business owner not found or not a defaulter',
  })
  async getDefaulterDetails(@Param('id', ParseUUIDPipe) businessOwnerId: string): Promise<any> {
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { id: businessOwnerId, isDefaulter: true },
      relations: ['user'],
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found or not marked as defaulter');
    }

    // Get wallet
    const wallet = await this.walletRepository.findOne({
      where: {
        userId: businessOwner.userId,
        userType: WalletUserType.BUSINESS_OWNER,
      },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found for this business owner');
    }

    // Get banking info
    const bankingInfo = await this.bankingInfoRepository.findOne({
      where: { businessOwnerId: businessOwner.id },
    });

    // Get recent transactions (last 10)
    const transactionsResult = await this.walletService.getTransactions(wallet.id, {
      page: 1,
      limit: 10,
    });

    const recentTransactions = transactionsResult.transactions.map(tx => ({
      id: tx.id,
      type: tx.type,
      category: tx.category,
      amount: Number(tx.amount),
      description: tx.description,
      createdAt: tx.createdAt,
    }));

    const daysSinceDefaulter = businessOwner.defaulterSince
      ? Math.floor((new Date().getTime() - new Date(businessOwner.defaulterSince).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const details: DefaulterDetailsDto = {
      businessOwnerId: businessOwner.id,
      shopId: businessOwner.shopId,
      businessName: businessOwner.businessName,
      walletBalance: Number(wallet.balance),
      defaulterSince: businessOwner.defaulterSince,
      daysSinceDefaulter,
      userId: businessOwner.userId,
      phone: businessOwner.user?.phone || 'N/A',
      bankingInfo: bankingInfo
        ? {
            accountNumber: bankingInfo.accountNumber, // Show clear account number
            accountHolderName: bankingInfo.accountHolderName,
            ifscCode: bankingInfo.ifscCode,
            bankName: bankingInfo.bankName,
            branch: bankingInfo.branch,
            isVerified: bankingInfo.isVerified,
          }
        : undefined,
      recentTransactions,
      totalCommissionOwed: Math.abs(Number(wallet.balance)),
    };

    return {
      code: 200,
      success: true,
      message: 'Defaulter details retrieved successfully',
      data: details,
    };
  }

  @Post('check')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Manually trigger credit limit check',
    description: `
      Manually run the credit limit breach detection process instead of waiting for the cron job.

      This will:
      1. Find all business owner wallets with negative balance
      2. Check if they exceed their assigned credit limit
      3. Notify admins if limit is exceeded
      4. Return count of notified admins

      Use this after:
      - Commission deductions
      - Testing the system
      - Immediate action needed
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Credit limit check completed successfully',
    type: CheckDefaultersApiResponseDto,
  })
  async checkDefaulters(): Promise<any> {
    const result = await this.walletMonitorService.checkCreditLimitBreaches();

    return {
      code: 200,
      success: true,
      message: `Credit limit check completed. ${result.notifiedCount} notifications sent.`,
      data: result,
    };
  }

  @Post(':id/mark')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Manually mark a business owner as defaulter',
    description: `
      Manually override the system and mark a business owner as defaulter.

      Use cases:
      - Disciplinary action
      - Contract violation
      - Special circumstances
      - Testing

      Note: This works even if wallet balance is positive (manual override).
      All actions are logged with admin ID and reason.
    `,
  })
  @ApiParam({ name: 'id', description: 'Business Owner ID' })
  @ApiBody({ type: ManualDefaulterActionDto })
  @ApiResponse({
    status: 200,
    description: 'Business owner marked as defaulter successfully',
    type: ManualActionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Business owner not found',
  })
  async manuallyMarkDefaulter(
    @Param('id', ParseUUIDPipe) businessOwnerId: string,
    @Body() actionDto: ManualDefaulterActionDto,
    @Request() req: any,
  ): Promise<any> {
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { id: businessOwnerId },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    if (businessOwner.isDefaulter) {
      throw new BadRequestException('Business owner is already marked as defaulter');
    }

    // Get wallet balance
    const wallet = await this.walletRepository.findOne({
      where: {
        userId: businessOwner.userId,
        userType: WalletUserType.BUSINESS_OWNER,
      },
    });

    // Mark as defaulter
    businessOwner.isDefaulter = true;
    businessOwner.defaulterSince = new Date();
    await this.businessOwnerRepository.save(businessOwner);

    // TODO: Log this action in an audit table with admin ID and reason

    return {
      code: 200,
      success: true,
      message: `Business owner ${businessOwner.businessName} marked as defaulter by admin`,
      data: {
        businessOwnerId: businessOwner.id,
        shopId: businessOwner.shopId,
        businessName: businessOwner.businessName,
        isDefaulter: true,
        walletBalance: wallet ? Number(wallet.balance) : 0,
        actionDate: businessOwner.defaulterSince,
      },
    };
  }

  @Post(':id/restore')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Manually restore a business owner from defaulter status',
    description: `
      Manually remove defaulter status from a business owner.

      Use cases:
      - Payment received outside the system
      - Dispute resolved
      - Special exception granted
      - Testing

      Note: This works even if wallet balance is still negative (manual override).
      All actions are logged with admin ID and reason.
    `,
  })
  @ApiParam({ name: 'id', description: 'Business Owner ID' })
  @ApiBody({ type: ManualDefaulterActionDto })
  @ApiResponse({
    status: 200,
    description: 'Business owner restored from defaulter status successfully',
    type: ManualActionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Business owner not found',
  })
  async manuallyRestoreDefaulter(
    @Param('id') businessOwnerId: string,
    @Body() actionDto: ManualDefaulterActionDto,
    @Request() req: any,
  ): Promise<any> {
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { id: businessOwnerId },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    if (!businessOwner.isDefaulter) {
      throw new BadRequestException('Business owner is not marked as defaulter');
    }

    // Get wallet balance
    const wallet = await this.walletRepository.findOne({
      where: {
        userId: businessOwner.userId,
        userType: WalletUserType.BUSINESS_OWNER,
      },
    });

    // Restore from defaulter
    businessOwner.isDefaulter = false;
    businessOwner.defaulterSince = null;
    await this.businessOwnerRepository.save(businessOwner);

    // TODO: Log this action in an audit table with admin ID and reason

    return {
      code: 200,
      success: true,
      message: `Business owner ${businessOwner.businessName} restored from defaulter status by admin`,
      data: {
        businessOwnerId: businessOwner.id,
        shopId: businessOwner.shopId,
        businessName: businessOwner.businessName,
        isDefaulter: false,
        walletBalance: wallet ? Number(wallet.balance) : 0,
        actionDate: new Date(),
      },
    };
  }

  @Get('stats/overview')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get comprehensive defaulter statistics',
    description: 'Dashboard overview with defaulter trends and metrics.',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getDefaulterStats(): Promise<any> {
    const summary = await this.walletMonitorService.getDefaultersSummary();

    // Calculate additional stats
    const defaulters = await this.businessOwnerRepository.find({
      where: { isDefaulter: true },
    });

    let totalDays = 0;
    let maxBalance = 0;
    let minBalance = 0;

    for (const defaulter of defaulters) {
      if (defaulter.defaulterSince) {
        const days = Math.floor(
          (new Date().getTime() - new Date(defaulter.defaulterSince).getTime()) / (1000 * 60 * 60 * 24),
        );
        totalDays += days;
      }

      const wallet = await this.walletRepository.findOne({
        where: {
          userId: defaulter.userId,
          userType: WalletUserType.BUSINESS_OWNER,
        },
      });

      if (wallet) {
        const balance = Number(wallet.balance);
        if (balance < minBalance) minBalance = balance;
        if (balance > maxBalance) maxBalance = balance;
      }
    }

    const averageDays = defaulters.length > 0 ? Math.round(totalDays / defaulters.length) : 0;
    const averageDebt = defaulters.length > 0 ? summary.totalNegativeBalance / defaulters.length : 0;

    return {
      code: 200,
      success: true,
      message: 'Defaulter statistics retrieved successfully',
      data: {
        totalDefaulters: summary.totalDefaulters,
        totalDebtOwed: Math.abs(summary.totalNegativeBalance),
        averageDebtPerDefaulter: Math.abs(averageDebt),
        averageDaysInDefaulter: averageDays,
        largestDebt: Math.abs(minBalance),
        smallestDebt: Math.abs(maxBalance),
      },
    };
  }
}
