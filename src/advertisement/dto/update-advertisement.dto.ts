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
  ValidateIf,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { AdMediaType, AdUserType } from '../../common/enums';

// Helper function to check if value is not empty
const isNotEmpty = (value: any) => value !== '' && value !== null && value !== undefined;

export class UpdateAdvertisementDto {
  @ApiProperty({ description: 'Ad title for admin reference', required: false })
  @IsOptional()
  @ValidateIf((o) => isNotEmpty(o.title))
  @Transform(({ value }) => (value === '' || value === null || value === undefined) ? undefined : value)
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title?: string;

  @ApiProperty({ description: 'Optional ad description', required: false })
  @IsOptional()
  @ValidateIf((o) => isNotEmpty(o.description))
  @Transform(({ value }) => (value === '' || value === null || value === undefined) ? undefined : value)
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ enum: AdMediaType, description: 'Type of media', required: false })
  @IsOptional()
  @ValidateIf((o) => isNotEmpty(o.mediaType))
  @IsEnum(AdMediaType)
  mediaType?: AdMediaType;

  @ApiProperty({ description: 'Optional URL to open when clicked', required: false })
  @IsOptional()
  @ValidateIf((o) => isNotEmpty(o.linkUrl))
  @Transform(({ value }) => (value === '' || value === null || value === undefined) ? undefined : value)
  @IsUrl()
  linkUrl?: string;

  @ApiProperty({
    description: 'User types that should see this ad',
    example: ['customer', 'business_owner'],
    enum: AdUserType,
    isArray: true,
    required: false,
  })
  @IsOptional()
  @ValidateIf((o) => isNotEmpty(o.targetUserTypes) && (!Array.isArray(o.targetUserTypes) || o.targetUserTypes.length > 0))
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(AdUserType, { each: true })
  @Type(() => String)
  @Transform(({ value }) => {
    if (!value || value === '' || (Array.isArray(value) && value.length === 0)) return undefined;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [value];
      }
    }
    return Array.isArray(value) ? value : [value];
  })
  targetUserTypes?: AdUserType[];

  @ApiProperty({
    description: 'Screens where ad appears for each user type',
    example: { customer: ['home', 'login'] },
    required: false,
  })
  @IsOptional()
  @ValidateIf((o) => isNotEmpty(o.targetScreens) && !(typeof o.targetScreens === 'object' && Object.keys(o.targetScreens).length === 0))
  @IsObject()
  @Transform(({ value }) => {
    if (!value || value === '' || (typeof value === 'object' && Object.keys(value).length === 0)) return undefined;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  targetScreens?: Record<string, string[]>;

  @ApiProperty({ description: 'Display priority (0-100)', required: false })
  @IsOptional()
  @ValidateIf((o) => isNotEmpty(o.priority))
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  priority?: number;

  @ApiProperty({ description: 'Active status', required: false })
  @IsOptional()
  @ValidateIf((o) => isNotEmpty(o.isActive))
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    if (typeof value === 'string') {
      return value === 'true' || value === '1';
    }
    return value;
  })
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Start date (ISO 8601)', required: false })
  @IsOptional()
  @ValidateIf((o) => isNotEmpty(o.startDate))
  @Transform(({ value }) => (value === '' || value === null || value === undefined) ? undefined : value)
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'End date (ISO 8601)', required: false })
  @IsOptional()
  @ValidateIf((o) => isNotEmpty(o.endDate))
  @Transform(({ value }) => (value === '' || value === null || value === undefined) ? undefined : value)
  @IsDateString()
  endDate?: string;
}
