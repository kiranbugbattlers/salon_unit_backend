import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsBoolean, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AdUserType } from '../../common/enums';

export class AdvertisementQueryDto {
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

  @ApiProperty({ enum: AdUserType, description: 'Filter by user type', required: false })
  @IsOptional()
  @IsEnum(AdUserType)
  userType?: AdUserType;

  @ApiProperty({ description: 'Filter by screen name', required: false })
  @IsOptional()
  @IsString()
  screen?: string;
}
