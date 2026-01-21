import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  MaxLength,
  IsNumber,
  IsArray,
  Min,
  Max,
  ValidateNested,
  IsUUID,
  IsBoolean,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

export class ServicePackageItemDto {
  @ApiProperty({
    description: 'Business service ID to include in the package',
    example: 'uuid-business-service-id',
  })
  @IsNotEmpty()
  @IsUUID(4)
  businessServiceId: string;
}

export class CreateServicePackageDto {
  @ApiProperty({
    description: 'Package name',
    example: 'Hair & Beauty Combo',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Package description',
    example: 'Complete hair styling and beauty treatment package',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Overall package discount percentage (0-100)',
    example: 15.0,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  @Transform(({ value }) => parseFloat(value))
  discountPercentage: number;

  @ApiProperty({
    description: 'Array of services to include in the package',
    type: [ServicePackageItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServicePackageItemDto)
  services: ServicePackageItemDto[];
}

export class UpdateServicePackageDto {
  @ApiProperty({
    description: 'Package name',
    example: 'Hair & Beauty Combo',
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiProperty({
    description: 'Package description',
    example: 'Complete hair styling and beauty treatment package',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Overall package discount percentage (0-100)',
    example: 15.0,
    minimum: 0,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  @Transform(({ value }) => parseFloat(value))
  discountPercentage?: number;

  @ApiProperty({
    description: 'Array of services to include in the package',
    type: [ServicePackageItemDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServicePackageItemDto)
  services?: ServicePackageItemDto[];
}

export class ServicePackageItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  businessServiceId: string;

  @ApiProperty()
  serviceName: string;

  @ApiProperty()
  serviceDescription?: string;

  @ApiProperty()
  serviceCategoryName: string;

  @ApiProperty()
  defaultPrice: number;

  @ApiProperty()
  customPrice: number;

  @ApiProperty()
  defaultDurationMinutes: number;

  @ApiProperty()
  customDurationMinutes: number;

  @ApiProperty({
    description: 'Effective duration in minutes (uses customDurationMinutes or falls back to defaultDurationMinutes)',
  })
  effectiveDurationMinutes: number;

  @ApiProperty()
  finalPrice: number; // After applying package discount

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ServicePackageResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  discountPercentage: number;

  @ApiProperty()
  totalOriginalPrice: number;

  @ApiProperty()
  totalDiscountedPrice: number; // After applying all discounts

  @ApiProperty()
  totalSavings: number;

  @ApiProperty()
  totalDurationMinutes: number;

  @ApiProperty()
  serviceCount: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ type: [ServicePackageItemResponseDto] })
  services: ServicePackageItemResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ServicePackageListDataDto {
  @ApiProperty({ type: [ServicePackageResponseDto] })
  packages: ServicePackageResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

export class ServicePackageListResponseDto extends ApiResponseDto<ServicePackageListDataDto> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Service packages retrieved successfully' })
  message: string;

  @ApiProperty({ type: ServicePackageListDataDto })
  data: ServicePackageListDataDto;

  constructor(
    code: number = 200,
    success: boolean = true,
    message: string = 'Service packages retrieved successfully',
    data: ServicePackageListDataDto
  ) {
    super(code, success, message, data);
  }
}

export class ServicePackageResponseWrapperDto extends ApiResponseDto<ServicePackageResponseDto> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Service package retrieved successfully' })
  message: string;

  @ApiProperty({ type: ServicePackageResponseDto })
  data: ServicePackageResponseDto;

  constructor(
    code: number = 200,
    success: boolean = true,
    message: string = 'Service package retrieved successfully',
    data: ServicePackageResponseDto
  ) {
    super(code, success, message, data);
  }
}

export class ServicePackageDeleteResponseDto extends ApiResponseDto {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Service package deleted successfully' })
  message: string;

  constructor(
    code: number = 200,
    success: boolean = true,
    message: string = 'Service package deleted successfully'
  ) {
    super(code, success, message);
  }
}