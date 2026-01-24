import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, IsEnum, IsOptional, IsArray } from 'class-validator';

export enum BusinessOwnerTransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit'
}

export enum BusinessOwnerTransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum PaymentMethod {
  CASH = 'cash',
  ONLINE = 'online',
  UPI = 'upi',
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer'
}

export enum SettlementStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REQUIRES_PAYMENT = 'requires_payment',
  PAYMENT_RECEIVED = 'payment_received'
}

export class BusinessOwnerTransactionItemDto {
  @ApiProperty({ description: 'Transaction ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Transaction date & time' })
  @IsDateString()
  transactionDate: Date;

  @ApiProperty({ description: 'Transaction amount' })
  @IsNumber()
  transactionAmount: number;

  @ApiProperty({ enum: BusinessOwnerTransactionType, description: 'Transaction type' })
  @IsEnum(BusinessOwnerTransactionType)
  transactionType: BusinessOwnerTransactionType;

  @ApiProperty({ description: 'Previous balance before transaction' })
  @IsNumber()
  previousBalance: number;

  @ApiProperty({ description: 'Remaining balance after transaction' })
  @IsNumber()
  remainingBalance: number;

  @ApiProperty({ enum: BusinessOwnerTransactionStatus, description: 'Transaction status' })
  @IsEnum(BusinessOwnerTransactionStatus)
  status: BusinessOwnerTransactionStatus;

  @ApiProperty({ enum: PaymentMethod, description: 'Payment method' })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiProperty({ description: 'Transaction remarks' })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiProperty({ description: 'Related booking ID' })
  @IsOptional()
  @IsString()
  relatedBookingId?: string;
}

export class SettlementItemDto {
  @ApiProperty({ description: 'Settlement ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Settlement month (YYYY-MM)' })
  @IsString()
  settlementMonth: string;

  @ApiProperty({ description: 'Total booking amount for the month' })
  @IsNumber()
  totalBookingAmount: number;

  @ApiProperty({ description: 'Total commission amount for the month' })
  @IsNumber()
  totalCommissionAmount: number;

  @ApiProperty({ description: 'Net amount payable to business owner' })
  @IsNumber()
  netPayableToBusinessOwner: number;

  @ApiProperty({ description: 'Total COD amount collected by business owner' })
  @IsNumber()
  totalCODAmount: number;

  @ApiProperty({ description: 'Total online payment amount collected by company' })
  @IsNumber()
  totalOnlineAmount: number;

  @ApiProperty({ description: 'Number of bookings included in settlement' })
  @IsNumber()
  bookingCount: number;

  @ApiProperty({ enum: SettlementStatus, description: 'Settlement status' })
  @IsEnum(SettlementStatus)
  status: SettlementStatus;

  @ApiProperty({ description: 'Razorpay payout ID' })
  @IsOptional()
  @IsString()
  razorpayPayoutId?: string;

  @ApiProperty({ description: 'When payout was initiated' })
  @IsOptional()
  @IsDateString()
  payoutInitiatedAt?: Date;

  @ApiProperty({ description: 'When payout was completed' })
  @IsOptional()
  @IsDateString()
  payoutCompletedAt?: Date;

  @ApiProperty({ description: 'Failure reason if payout failed' })
  @IsOptional()
  @IsString()
  failureReason?: string;

  @ApiProperty({ description: 'Payout status from Razorpay' })
  @IsOptional()
  @IsString()
  payoutStatus?: string;

  @ApiProperty({ description: 'Payout mode (IMPS, NEFT, etc.)' })
  @IsOptional()
  @IsString()
  payoutMode?: string;

  @ApiProperty({ description: 'Payout UTR number' })
  @IsOptional()
  @IsString()
  payoutUtr?: string;

  @ApiProperty({ description: 'Notes from admin' })
  @IsOptional()
  @IsString()
  adminNotes?: string;

  @ApiProperty({ description: 'Created at' })
  @IsDateString()
  createdAt: Date;
}

export class BusinessOwnerTransactionHistoryResponseDto {
  @ApiProperty({ description: 'Business owner ID' })
  @IsString()
  businessOwnerId: string;

  @ApiProperty({ description: 'Business owner name' })
  @IsString()
  businessOwnerName: string;

  @ApiProperty({ description: 'Shop ID' })
  @IsString()
  shopId: string;

  @ApiProperty({ description: 'Business name' })
  @IsOptional()
  @IsString()
  businessName?: string;

  @ApiProperty({ description: 'Transaction history' })
  @IsArray()
  transactions: BusinessOwnerTransactionItemDto[];

  @ApiProperty({ description: 'Settlement history' })
  @IsArray()
  settlements: SettlementItemDto[];

  @ApiProperty({ description: 'Current balance' })
  @IsNumber()
  currentBalance: number;

  @ApiProperty({ description: 'Total credit amount' })
  @IsNumber()
  totalCredit: number;

  @ApiProperty({ description: 'Total debit amount' })
  @IsNumber()
  totalDebit: number;

  @ApiProperty({ description: 'Total settlements received' })
  @IsNumber()
  totalSettlementsReceived: number;

  @ApiProperty({ description: 'Total pending settlements' })
  @IsNumber()
  totalPendingSettlements: number;

  @ApiProperty({ description: 'Total number of transactions' })
  @IsNumber()
  totalTransactions: number;

  @ApiProperty({ description: 'Filter parameters used' })
  filters: {
    startDate?: Date;
    endDate?: Date;
    transactionType?: BusinessOwnerTransactionType;
    status?: BusinessOwnerTransactionStatus;
    settlementStatus?: SettlementStatus;
  };
}
