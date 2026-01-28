import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, IsEnum, IsOptional } from 'class-validator';

export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT'
}

export enum TransactionStatus {
  SUCCESS = 'SUCCESS',
  PENDING = 'PENDING',
  FAILED = 'FAILED'
}

export enum SettlementType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY'
}

export class AdminTransactionHistoryItemDto {
  @ApiProperty({ description: 'Unique transaction ID' })
  @IsString()
  transactionId: string;

  @ApiProperty({ description: 'Business owner name' })
  @IsString()
  businessOwnerName: string;

  @ApiProperty({ description: 'Shop ID' })
  @IsString()
  shopId: string;

  @ApiProperty({ description: 'Business name' })
  @IsString()
  businessName: string;

  @ApiProperty({ description: 'Transaction date & time' })
  @IsDateString()
  transactionDateTime: Date;

  @ApiProperty({ description: 'Previous balance before transaction' })
  @IsNumber()
  previousBalance: number;

  @ApiProperty({ description: 'Transaction amount (+ / -)' })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Current balance after transaction' })
  @IsNumber()
  currentBalance: number;

  @ApiProperty({ enum: TransactionType, description: 'Transaction type: Credit/Debit' })
  @IsEnum(TransactionType)
  transactionType: TransactionType;

  @ApiProperty({ enum: TransactionStatus, description: 'Transaction status: Success/Pending/Failed' })
  @IsEnum(TransactionStatus)
  status: TransactionStatus;

  @ApiProperty({ description: 'Transaction remark' })
  @IsString()
  remark: string;

  @ApiProperty({ description: 'Commission amount' })
  @IsNumber()
  commissionAmount: number;

  @ApiProperty({ description: 'Commission percentage' })
  @IsNumber()
  commissionPercentage: number;

  @ApiProperty({ description: 'Settlement amount' })
  @IsNumber()
  settlementAmount: number;

  @ApiProperty({ enum: SettlementType, description: 'Settlement type: Daily/Weekly/Monthly' })
  @IsOptional()
  @IsEnum(SettlementType)
  settlementType?: SettlementType;

  @ApiProperty({ description: 'Related booking ID' })
  @IsOptional()
  @IsString()
  relatedBookingId?: string;

  @ApiProperty({ description: 'Payment method' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiProperty({ description: 'Created by admin ID' })
  @IsOptional()
  @IsString()
  createdByAdminId?: string;

  @ApiProperty({ description: 'Commission related booking ID' })
  @IsOptional()
  @IsString()
  commissionRelatedBookingId?: string;

  @ApiProperty({ description: 'Commission status' })
  @IsOptional()
  @IsEnum(TransactionStatus)
  commissionStatus?: TransactionStatus;

  @ApiProperty({ description: 'Commission settlement date' })
  @IsOptional()
  @IsDateString()
  commissionSettlementDate?: Date;

  @ApiProperty({ description: 'Commission remarks' })
  @IsOptional()
  @IsString()
  commissionremarks?: string;
}

export class DayWiseAdminTransactionHistoryDto {
  @ApiProperty({ description: 'Date for which transactions are grouped' })
  @IsDateString()
  date: Date;

  @ApiProperty({ description: 'List of transactions for the day' })
  transactions: AdminTransactionHistoryItemDto[];

  @ApiProperty({ description: 'Total credit amount for the day' })
  @IsNumber()
  totalCredit: number;

  @ApiProperty({ description: 'Total debit amount for the day' })
  @IsNumber()
  totalDebit: number;

  @ApiProperty({ description: 'Total commission amount for the day' })
  @IsNumber()
  totalCommission: number;

  @ApiProperty({ description: 'Total settlement amount for the day' })
  @IsNumber()
  totalSettlement: number;

  @ApiProperty({ description: 'Net amount for the day (Credit - Debit)' })
  @IsNumber()
  netAmount: number;

  @ApiProperty({ description: 'Number of transactions for the day' })
  @IsNumber()
  transactionCount: number;
}

export class AdminTransactionHistoryResponseDto {
  @ApiProperty({ description: 'List of all business owners with transactions' })
  businessOwners: Array<{
    businessOwnerId: string;
    businessOwnerName: string;
    shopId: string;
    businessName: string;
    dayWiseHistory: DayWiseAdminTransactionHistoryDto[];
    totalCredit: number;
    totalDebit: number;
    totalCommission: number;
    totalSettlement: number;
    netBalance: number;
    totalTransactions: number;
  }>;

  @ApiProperty({ description: 'Overall totals across all business owners' })
  overallTotals: {
    totalCredit: number;
    totalDebit: number;
    totalCommission: number;
    totalSettlement: number;
    netBalance: number;
    totalTransactions: number;
    totalBusinessOwners: number;
  };

  @ApiProperty({ description: 'Filter parameters used' })
  filters: {
    businessOwnerId?: string;
    startDate?: Date;
    endDate?: Date;
    settlementType?: SettlementType;
  };
}
