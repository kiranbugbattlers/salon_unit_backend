import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SettlementPaidStatus } from '../../database/entities/daily-settlement.entity';

export class UpdateSettlementStatusDto {
  @ApiProperty({ description: 'Business Owner ID' })
  @IsString()
  businessOwnerId: string;

  @ApiProperty({ description: 'Date for settlement (YYYY-MM-DD)', example: '2026-01-07' })
  @IsString()
  date: string;

  @ApiProperty({ enum: SettlementPaidStatus, description: 'New payment status' })
  @IsEnum(SettlementPaidStatus)
  status: SettlementPaidStatus;

  @ApiPropertyOptional({ description: 'Transaction reference for payment' })
  @IsOptional()
  @IsString()
  transactionReference?: string;

  @ApiPropertyOptional({ description: 'Admin notes' })
  @IsOptional()
  @IsString()
  adminNotes?: string;
}
