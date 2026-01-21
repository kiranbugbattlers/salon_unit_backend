import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsUrl,
  IsArray,
  IsObject,
  IsInt,
  IsBoolean,
  IsDateString,
  MinLength,
  MaxLength,
  Min,
  Max,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { AdMediaType, AdUserType } from '../../common/enums';

export class CreateAdvertisementDto {
  @ApiProperty({ description: 'Ad title for admin reference', example: 'Summer Sale Banner' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: 'Optional ad description', required: false })
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null || value === undefined) ? undefined : value)
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ enum: AdMediaType, description: 'Type of media', example: AdMediaType.IMAGE })
  @IsEnum(AdMediaType)
  mediaType: AdMediaType;

  @ApiProperty({
    description: 'Optional URL to open when clicked',
    example: 'https://example.com/promo',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null || value === undefined) ? undefined : value)
  @IsUrl()
  linkUrl?: string;

  @ApiProperty({
    description: 'User types that should see this ad',
    example: ['customer', 'business_owner'],
    enum: AdUserType,
    isArray: true,
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(AdUserType, { each: true })
  @Type(() => String)
  @Transform(({ value }) => {
    // Handle both string (from form-data) and array
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [value];
      }
    }
    return Array.isArray(value) ? value : [value];
  })
  targetUserTypes: AdUserType[];

  @ApiProperty({
    description: 'Screens where ad appears for each user type',
    example: {
      customer: ['home', 'login'],
      business_owner: ['approval', 'home'],
    },
  })
  @IsObject()
  @Transform(({ value }) => {
    // Handle JSON string from form-data
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  targetScreens: Record<string, string[]>;

  @ApiProperty({ description: 'Display priority (0-100)', default: 0, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  priority?: number;

  @ApiProperty({ description: 'Active status', default: true, required: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true' || value === '1';
    }
    return value;
  })
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Start date (ISO 8601)', required: false, example: '2025-01-01T00:00:00Z' })
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null || value === undefined) ? undefined : value)
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'End date (ISO 8601)', required: false, example: '2025-12-31T23:59:59Z' })
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null || value === undefined) ? undefined : value)
  @IsDateString()
  endDate?: string;
}
