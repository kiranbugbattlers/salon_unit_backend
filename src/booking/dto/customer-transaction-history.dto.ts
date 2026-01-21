import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, IsEnum } from 'class-validator';

export enum PaymentMethod {
  CASH = 'CASH',
  ONLINE = 'ONLINE'
}

export class TransactionHistoryItemDto {
  @ApiProperty({ description: 'Unique booking ID' })
  @IsString()
  bookingId: string;

  @ApiProperty({ description: 'Customer name' })
  @IsString()
  customerName: string;

  @ApiProperty({ description: 'Total booking amount' })
  @IsNumber()
  bookingAmount: number;

  @ApiProperty({ enum: PaymentMethod, description: 'Payment method' })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ description: 'Booking date & time' })
  @IsDateString()
  bookingDateTime: Date;
}

export class DayWiseTransactionHistoryDto {
  @ApiProperty({ description: 'Date for which transactions are grouped' })
  @IsDateString()
  date: Date;

  @ApiProperty({ description: 'List of transactions for the day' })
  transactions: TransactionHistoryItemDto[];

  @ApiProperty({ description: 'Total amount for the day' })
  @IsNumber()
  totalAmount: number;

  @ApiProperty({ description: 'Number of transactions for the day' })
  @IsNumber()
  transactionCount: number;
}

export class CustomerTransactionHistoryResponseDto {
  @ApiProperty({ description: 'Customer ID' })
  @IsString()
  customerId: string;

  @ApiProperty({ description: 'Day-wise transaction history' })
  dayWiseHistory: DayWiseTransactionHistoryDto[];

  @ApiProperty({ description: 'Total amount across all periods' })
  @IsNumber()
  totalAmount: number;

  @ApiProperty({ description: 'Total number of transactions' })
  @IsNumber()
  totalTransactions: number;
}
