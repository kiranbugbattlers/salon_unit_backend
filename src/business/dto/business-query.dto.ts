import { IsOptional, IsNumber, IsString, IsBoolean, Min, Max, IsEnum, IsUUID } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ServiceGenderEnum } from '../../common/enums/service-gender.enum';

export enum BusinessSortField {
  RATING = 'rating',
  NAME = 'name',
  CREATED_AT = 'createdAt',
  DISTANCE = 'distance',
  OPERATING_YEARS = 'operatingYears',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class BusinessQueryDto {
  @ApiProperty({
    description: 'Latitude for location-based filtering',
    example: 12.9716,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat?: number;

  @ApiProperty({
    description: 'Longitude for location-based filtering',
    example: 77.5946,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng?: number;

  @ApiProperty({
    description: 'Radius in kilometers for location filtering (optional - if not provided with lat/lng, no location filtering applied)',
    example: 5,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  radius?: number;

  @ApiProperty({
    description: 'Sort fields (comma-separated). Prefix with - for descending order',
    example: 'rating,-operatingYears',
    required: false,
  })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiProperty({
    description: 'Include user-specific data (favorites, history)',
    example: false,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  userspecific?: boolean;

  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
    required: false,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({
    description: 'Filter by category UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsUUID(4)
  category?: string;


  @ApiProperty({
    description: 'Filter businesses offering services at home',
    example: true,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  availableAtHome?: boolean;

  @ApiProperty({
    description: 'Minimum price filter (based on business services)',
    example: 100,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiProperty({
    description: 'Maximum price filter (based on business services)',
    example: 1000,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiProperty({
    description: 'Filter businesses by service gender availability',
    enum: ServiceGenderEnum,
    example: ServiceGenderEnum.BOTH,
    required: false,
  })
  @IsOptional()
  @IsEnum(ServiceGenderEnum)
  gender?: ServiceGenderEnum;

  @ApiProperty({
    description: 'Minimum operating years',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minOperatingYears?: number;

  @ApiProperty({
    description: 'Search term for business name, description, city, area, or landmark',
    example: 'Mumbai',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}