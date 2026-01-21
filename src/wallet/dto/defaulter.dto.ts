import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';

// ==================== Individual Defaulter DTOs ====================

export class DefaulterBusinessDto {
  @ApiProperty({ description: 'Business owner ID' })
  businessOwnerId: string;

  @ApiProperty({ description: 'Shop ID (e.g., SH-123456)' })
  shopId: string;

  @ApiProperty({ description: 'Business name' })
  businessName: string;

  @ApiProperty({ description: 'Current wallet balance (negative)' })
  walletBalance: number;

  @ApiProperty({ description: 'When they were marked as defaulter' })
  defaulterSince: Date;

  @ApiProperty({ description: 'Days since marked as defaulter' })
  daysSinceDefaulter: number;

  @ApiProperty({ description: 'Business owner user ID' })
  userId: string;

  @ApiProperty({ description: 'Business owner phone number' })
  phone: string;
}

export class DefaulterDetailsDto extends DefaulterBusinessDto {
  @ApiProperty({ description: 'Banking information', required: false })
  bankingInfo?: {
    accountNumber: string;
    accountHolderName: string;
    ifscCode: string;
    bankName: string;
    branch?: string;
    isVerified: boolean;
  };

  @ApiProperty({ description: 'Recent wallet transactions' })
  recentTransactions: Array<{
    id: string;
    type: string;
    category: string;
    amount: number;
    description: string;
    createdAt: Date;
  }>;

  @ApiProperty({ description: 'Total commission owed' })
  totalCommissionOwed: number;
}

// ==================== Summary DTOs ====================

export class DefaulterSummaryDto {
  @ApiProperty({ description: 'Total number of defaulters' })
  totalDefaulters: number;

  @ApiProperty({ description: 'Total negative balance across all defaulters' })
  totalNegativeBalance: number;

  @ApiProperty({ description: 'Average days in defaulter status' })
  averageDaysDefaulter: number;

  @ApiProperty({ description: 'List of defaulter businesses' })
  defaulters: DefaulterBusinessDto[];
}

// ==================== Request DTOs ====================

export class ManualDefaulterActionDto {
  @ApiProperty({ description: 'Reason for manual action' })
  @IsString()
  reason: string;

  @ApiProperty({ description: 'Admin notes (optional)', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CheckDefaultersResponseDto {
  @ApiProperty({ description: 'Number of newly marked defaulters' })
  newDefaulters: number;

  @ApiProperty({ description: 'Number of businesses already marked' })
  alreadyDefaulters: number;

  @ApiProperty({ description: 'Total negative wallet count' })
  totalNegativeWallets: number;
}

// ==================== History DTOs ====================

export class DefaulterHistoryEntryDto {
  @ApiProperty({ description: 'Business owner ID' })
  businessOwnerId: string;

  @ApiProperty({ description: 'Shop ID' })
  shopId: string;

  @ApiProperty({ description: 'Business name' })
  businessName: string;

  @ApiProperty({ description: 'Action type: marked or restored' })
  action: 'marked' | 'restored';

  @ApiProperty({ description: 'When the action occurred' })
  actionDate: Date;

  @ApiProperty({ description: 'Wallet balance at time of action' })
  balanceAtAction: number;

  @ApiProperty({ description: 'Whether it was manual or automatic' })
  isManual: boolean;

  @ApiProperty({ description: 'Admin ID if manual action', required: false })
  adminId?: string;

  @ApiProperty({ description: 'Reason for action', required: false })
  reason?: string;
}

export class DefaulterHistoryDto {
  @ApiProperty({ description: 'List of defaulter history entries' })
  history: DefaulterHistoryEntryDto[];

  @ApiProperty({ description: 'Total entries' })
  total: number;

  @ApiProperty({ description: 'Current page' })
  page: number;

  @ApiProperty({ description: 'Total pages' })
  totalPages: number;
}

// ==================== API Response Wrappers ====================

export class DefaulterListResponseDto {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Defaulters retrieved successfully' })
  message: string;

  @ApiProperty({ type: () => DefaulterSummaryDto })
  data: DefaulterSummaryDto;
}

export class DefaulterDetailsResponseDto {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Defaulter details retrieved successfully' })
  message: string;

  @ApiProperty({ type: () => DefaulterDetailsDto })
  data: DefaulterDetailsDto;
}

export class CheckDefaultersApiResponseDto {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Defaulter check completed' })
  message: string;

  @ApiProperty({ type: () => CheckDefaultersResponseDto })
  data: CheckDefaultersResponseDto;
}

export class ManualActionResponseDto {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Action completed successfully' })
  message: string;

  @ApiProperty()
  data: {
    businessOwnerId: string;
    shopId: string;
    businessName: string;
    isDefaulter: boolean;
    walletBalance: number;
    actionDate: Date;
  };
}

export class DefaulterHistoryResponseDto {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Defaulter history retrieved successfully' })
  message: string;

  @ApiProperty({ type: () => DefaulterHistoryDto })
  data: DefaulterHistoryDto;
}
