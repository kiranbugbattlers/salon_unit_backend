import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';
import { DailySettlementService } from '../../wallet/daily-settlement.service';
import { GetDailySettlementsDto } from '../dto/get-daily-settlements.dto';
import { UpdateSettlementStatusDto } from '../dto/update-settlement-status.dto';

@ApiTags('Admin - Settlements')
@Controller('admin/settlements')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth('JWT')
export class AdminSettlementController {
  constructor(private readonly dailySettlementService: DailySettlementService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all businesses settlement data for a date',
    description: 'Get all approved businesses with their settlement data for a specific date',
  })
  @ApiResponse({
    status: 200,
    description: 'List of businesses with settlement data',
  })
  async getAllSettlements(@Query() query: GetDailySettlementsDto) {
    return this.dailySettlementService.getAllSettlements({
      date: query.date,
      startDate: query.startDate,
      endDate: query.endDate,
      page: query.page,
      limit: query.limit,
    });
  }

  @Get('history')
  @ApiOperation({
    summary: 'Get all settlement history',
    description: 'Get all completed bookings history for all businesses. Can filter on UI by date range.',
  })
  @ApiResponse({
    status: 200,
    description: 'All settlement history with pagination',
  })
  async getAllHistory(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('businessOwnerId') businessOwnerId?: string,
  ) {
    return this.dailySettlementService.getAllHistory({
      page: page || 1,
      limit: limit || 50,
      startDate,
      endDate,
      businessOwnerId,
    });
  }

  @Post('update-status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update settlement status',
    description: 'Update the payment status of a business owner settlement for a specific date',
  })
  @ApiResponse({ status: 200, description: 'Settlement status updated' })
  @ApiResponse({ status: 404, description: 'Business owner not found' })
  async updateSettlementStatus(@Body() dto: UpdateSettlementStatusDto) {
    return this.dailySettlementService.updateSettlementStatusByBusinessOwner(
      dto.businessOwnerId,
      dto.date,
      dto.status,
      dto.transactionReference,
      dto.adminNotes,
    );
  }

  @Get('details')
  @ApiOperation({
    summary: 'Get detailed settlement info for a business',
    description: 'Get owner details, business info, transaction history and settlement calculation for a specific date or date range',
  })
  @ApiResponse({ status: 200, description: 'Settlement details with transactions' })
  @ApiResponse({ status: 404, description: 'Business owner not found' })
  async getSettlementDetails(
    @Query('businessOwnerId') businessOwnerId: string,
    @Query('date') date?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.dailySettlementService.getSettlementDetails({
      businessOwnerId,
      date,
      startDate,
      endDate,
    });
  }

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate daily settlements',
    description: 'Generate settlements for all vendors for a specific date',
  })
  @ApiResponse({ status: 200, description: 'Settlements generated' })
  async generateSettlements(@Body() body: { date: string }) {
    return this.dailySettlementService.generateDailySettlements(body.date);
  }
}
