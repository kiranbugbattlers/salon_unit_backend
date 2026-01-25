import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';
import { BusinessOwnerTransactionHistoryService } from '../services/business-owner-transaction-history.service';
import { 
  BusinessOwnerTransactionHistoryQueryDto, 
  UpdateTransactionRemarkDto,
  BusinessOwnerTransactionResponseDto,
  SortByEnum,
  SortOrderEnum
} from '../dto/business-owner-transaction-history.dto';
import { Logger } from '@nestjs/common';
import { VendorTransactionQueryValidationPipe } from '../../common/pipes/vendor-transaction-query-validation.pipe';

@ApiTags('Admin - Business Owner Transaction History')
@Controller('admin/business-owner-transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth('JWT')
export class BusinessOwnerTransactionHistoryController {
  private readonly logger = new Logger(BusinessOwnerTransactionHistoryController.name);

  constructor(
    private readonly businessOwnerTransactionHistoryService: BusinessOwnerTransactionHistoryService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all business owner transactions',
    description: 'Retrieve all business owner transactions with filtering and pagination options.',
  })
  @ApiQuery({ name: 'type', enum: ['credit', 'debit'], required: false, description: 'Filter by transaction type' })
  @ApiQuery({ 
    name: 'category', 
    enum: ['booking_payment', 'commission', 'commission_payment', 'settlement', 'reward_points', 'refund', 'adjustment', 'withdrawal'], 
    required: false, 
    description: 'Filter by transaction category' 
  })
  @ApiQuery({ name: 'status', enum: ['pending', 'completed', 'failed', 'reversed'], required: false, description: 'Filter by transaction status' })
  @ApiQuery({ name: 'businessOwnerId', required: false, description: 'Filter by business owner ID' })
  @ApiQuery({ name: 'fromDate', required: false, description: 'Filter by start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'toDate', required: false, description: 'Filter by end date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by description or remark' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', example: 20 })
  @ApiQuery({ name: 'sortBy', enum: ['createdAt', 'amount', 'type', 'category'], required: false, description: 'Sort field' })
  @ApiQuery({ name: 'sortOrder', enum: ['ASC', 'DESC'], required: false, description: 'Sort order' })
  @ApiResponse({ status: 200, description: 'All business owner transactions retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getAllBusinessOwnerTransactions(
    @Query(VendorTransactionQueryValidationPipe) queryDto: BusinessOwnerTransactionHistoryQueryDto,
  ): Promise<any> {
    try {
      this.logger.log('Getting all business owner transactions');
      
      const result = await this.businessOwnerTransactionHistoryService.getAllBusinessOwnerTransactions(queryDto);

      this.logger.log('Successfully retrieved all business owner transactions');
      return result;
    } catch (error) {
      this.logger.error('Failed to get all business owner transactions:', error);
      
      throw {
        code: 500,
        success: false,
        message: 'Failed to retrieve business owner transactions',
        error: error.message,
      };
    }
  }

  @Get('day-wise')
  @ApiOperation({
    summary: 'Get business owner transactions grouped by day',
    description: 'Retrieve business owner transactions aggregated by date with daily summaries.',
  })
  @ApiQuery({ name: 'date', required: false, description: 'Filter by specific date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'fromDate', required: false, description: 'Filter by start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'toDate', required: false, description: 'Filter by end date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'businessOwnerId', required: false, description: 'Filter by business owner ID' })
  @ApiResponse({ status: 200, description: 'Day-wise transactions retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getTransactionDayWise(
    @Query() query: any,
  ): Promise<any> {
    try {
      this.logger.log('Getting day-wise business owner transactions');
      
      const result = await this.businessOwnerTransactionHistoryService.getTransactionDayWise(query);

      this.logger.log('Successfully retrieved day-wise business owner transactions');
      return result;
    } catch (error) {
      this.logger.error('Failed to get day-wise business owner transactions:', error);
      
      throw {
        code: 500,
        success: false,
        message: 'Failed to retrieve day-wise transactions',
        error: error.message,
      };
    }
  }

  @Get(':transactionId')
  @ApiOperation({
    summary: 'Get transaction by ID',
    description: 'Retrieve detailed information for a specific business owner transaction.',
  })
  @ApiParam({ name: 'transactionId', description: 'Transaction ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Transaction retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  @ApiResponse({ status: 400, description: 'Not a business owner transaction' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getTransactionById(
    @Param('transactionId') transactionId: string,
  ): Promise<any> {
    try {
      this.logger.log(`Getting transaction by ID: ${transactionId}`);
      
      const result = await this.businessOwnerTransactionHistoryService.getTransactionById(transactionId);

      this.logger.log(`Successfully retrieved transaction: ${transactionId}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to get transaction ${transactionId}:`, error);
      
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      throw {
        code: 500,
        success: false,
        message: 'Failed to retrieve transaction',
        error: error.message,
      };
    }
  }

  @Put(':transactionId/remark')
  @ApiOperation({
    summary: 'Update transaction remark',
    description: 'Update the remark for a specific business owner transaction.',
  })
  @ApiParam({ name: 'transactionId', description: 'Transaction ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Transaction remark updated successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  @ApiResponse({ status: 400, description: 'Not a business owner transaction' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async updateTransactionRemark(
    @Param('transactionId') transactionId: string,
    @Body() updateDto: UpdateTransactionRemarkDto,
  ): Promise<any> {
    try {
      this.logger.log(`Updating remark for transaction: ${transactionId}`);
      
      const result = await this.businessOwnerTransactionHistoryService.updateTransactionRemark(
        transactionId,
        updateDto,
      );

      this.logger.log(`Successfully updated remark for transaction: ${transactionId}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to update remark for transaction ${transactionId}:`, error);
      
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      throw {
        code: 500,
        success: false,
        message: 'Failed to update transaction remark',
        error: error.message,
      };
    }
  }

  @Delete(':transactionId')
  @ApiOperation({
    summary: 'Delete transaction',
    description: 'Delete a business owner transaction (only pending or failed transactions can be deleted).',
  })
  @ApiParam({ name: 'transactionId', description: 'Transaction ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Transaction deleted successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete completed transactions or not a business owner transaction' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async deleteTransaction(
    @Param('transactionId') transactionId: string,
  ): Promise<any> {
    try {
      this.logger.log(`Deleting transaction: ${transactionId}`);
      
      const result = await this.businessOwnerTransactionHistoryService.deleteTransaction(transactionId);

      this.logger.log(`Successfully deleted transaction: ${transactionId}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to delete transaction ${transactionId}:`, error);
      
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      throw {
        code: 500,
        success: false,
        message: 'Failed to delete transaction',
        error: error.message,
      };
    }
  }
}