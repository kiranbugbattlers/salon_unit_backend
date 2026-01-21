import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNotEmpty, MaxLength, IsUrl } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

export class CreateServiceCategoryDto {
  @ApiProperty({
    description: 'Service category name',
    example: 'Hair Care',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Service category description',
    example: 'Professional hair care services including cutting, washing, and basic treatments',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Service category image URL',
    example: 'https://example.com/hair-care.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  image?: string;

  @ApiProperty({
    description: 'Whether the category is active',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  })
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateServiceCategoryDto {
  @ApiProperty({
    description: 'Service category name',
    example: 'Hair Care',
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    description: 'Service category description',
    example: 'Professional hair care services including cutting, washing, and basic treatments',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Service category image URL',
    example: 'https://example.com/hair-care.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  image?: string;

  @ApiProperty({
    description: 'Whether the category is active',
    example: true,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  })
  @IsBoolean()
  isActive?: boolean;
}

export class ServiceCategoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  image?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ServiceCategoryListResponseDto {
  @ApiProperty({ type: [ServiceCategoryResponseDto] })
  categories: ServiceCategoryResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

export class ServiceCategoryApiResponseDto extends ApiResponseDto<ServiceCategoryResponseDto> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Service category retrieved successfully' })
  message: string;

  @ApiProperty({ type: ServiceCategoryResponseDto })
  data: ServiceCategoryResponseDto;

  constructor(code: number, success: boolean, message: string, data: ServiceCategoryResponseDto) {
    super(code, success, message, data);
  }
}

export class ServiceCategoryListApiResponseDto extends ApiResponseDto<ServiceCategoryListResponseDto> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Service categories retrieved successfully' })
  message: string;

  @ApiProperty({ type: ServiceCategoryListResponseDto })
  data: ServiceCategoryListResponseDto;

  constructor(code: number, success: boolean, message: string, data: ServiceCategoryListResponseDto) {
    super(code, success, message, data);
  }
}