import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum SupportMemberSortBy {
  CUSTOMER_COUNT = 'customerCount',
  NAME = 'firstName',
  JOINING_DATE = 'joiningDate',
}

export class SupportMemberQueryDto {
  @ApiProperty({ description: 'Page number', required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'Items per page', required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({ description: 'Filter by active status', required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ enum: SupportMemberSortBy, description: 'Sort by field', required: false })
  @IsOptional()
  @IsEnum(SupportMemberSortBy)
  sortBy?: SupportMemberSortBy = SupportMemberSortBy.CUSTOMER_COUNT;
}
