import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsEnum, IsNumber, Min, Max, IsUUID, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export enum SortOrderEnum {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum SortByEnum {
  CREATED_AT = 'createdAt',
  AMOUNT = 'amount',
  TYPE = 'type',
  CATEGORY = 'category',
}

export class BusinessOwnerTransactionHistoryQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by transaction type',
    enum: ['credit', 'debit'],
  })
  @IsOptional()
  @IsEnum(['credit', 'debit'])
  type?: string;

  @ApiPropertyOptional({
    description: 'Filter by transaction category',
    enum: ['booking_payment', 'commission', 'commission_payment', 'settlement', 'reward_points', 'refund', 'adjustment', 'withdrawal'],
  })
  @IsOptional()
  @IsEnum(['booking_payment', 'commission', 'commission_payment', 'settlement', 'reward_points', 'refund', 'adjustment', 'withdrawal'])
  category?: string;

  @ApiPropertyOptional({
    description: 'Filter by transaction status',
    enum: ['pending', 'completed', 'failed', 'reversed'],
  })
  @IsOptional()
  @IsEnum(['pending', 'completed', 'failed', 'reversed'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Filter by business owner ID',
    example: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  businessOwnerId?: string;

  @ApiPropertyOptional({
    description: 'Filter by start date (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by end date (YYYY-MM-DD)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({
    description: 'Search by description or remark',
    example: 'booking',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: ['createdAt', 'amount', 'type', 'category'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'], { message: 'sortOrder must be either ASC or DESC' })
  sortOrder?: string = 'DESC';
}

export class BusinessOwnerTransactionResponseDto {
  @ApiProperty({ description: 'Transaction ID' })
  id: string;

  @ApiProperty({ description: 'Date & Time of transaction' })
  createdAt: Date;

  @ApiProperty({ description: 'Transaction description' })
  description: string;

  @ApiProperty({ description: 'Previous balance before transaction' })
  previousBalance: number;

  @ApiProperty({ description: 'Transaction amount (positive for credit, negative for debit)' })
  amount: number;

  @ApiProperty({ description: 'Current balance after transaction' })
  currentBalance: number;

  @ApiProperty({ description: 'Unique transaction ID' })
  transactionId: string;

  @ApiProperty({ description: 'Transaction type (Credit/Debit)' })
  transactionType: string;

  @ApiProperty({ description: 'Transaction status' })
  status: string;

  @ApiProperty({ description: 'Transaction remark' })
  remark: string;

  @ApiProperty({ description: 'Transaction category' })
  category: string;

  @ApiProperty({ description: 'Related booking ID' })
  bookingId?: string;

  @ApiProperty({ description: 'Related payment ID' })
  paymentId?: string;

  @ApiProperty({ description: 'Related settlement ID' })
  settlementId?: string;

  @ApiProperty({ description: 'Business Owner Information' })
  businessOwner?: {
    id: string;
    businessName?: string;
    ownerName?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    shopId?: string;
    isApproved: boolean;
    isActive: boolean;
    vendorStatus: string;
    creditLimit?: number;
    upiId?: string;
    createdAt: Date;
    updatedAt: Date;
  };

  @ApiProperty({ description: 'Wallet Information' })
  wallet?: {
    id: string;
    currentBalance: number;
    userId: string;
    userType: string;
  };
}

export class UpdateTransactionRemarkDto {
  @ApiProperty({ description: 'Transaction remark' })
  @IsString()
  remark: string;
}

export class TransactionSummaryDto {
  @ApiProperty({ description: 'Total credits amount' })
  totalCredits: number;

  @ApiProperty({ description: 'Total debits amount' })
  totalDebits: number;

  @ApiProperty({ description: 'Net balance change' })
  netBalance: number;

  @ApiProperty({ description: 'Total number of transactions' })
  totalTransactions: number;

  @ApiProperty({ description: 'Successful transactions count' })
  successfulTransactions: number;

  @ApiProperty({ description: 'Pending transactions count' })
  pendingTransactions: number;

  @ApiProperty({ description: 'Failed transactions count' })
  failedTransactions: number;
}