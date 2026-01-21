import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
  MaxLength,
  IsUrl,
  IsUUID,
  IsNumber,
  IsArray,
  Min,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ServiceCategoryResponseDto } from './service-category.dto';
import { ServiceGenderEnum } from '../../common/enums/service-gender.enum';
import { ApiResponseDto } from '../../common/dto/api-response.dto';


export class CreateServiceDto {
  @ApiProperty({
    description: 'Service category ID',
    example: 'uuid-of-category',
  })
  @IsNotEmpty()
  @IsUUID(4)
  categoryId: string;

  @ApiProperty({
    description: 'Service name',
    example: 'Haircut',
    maxLength: 150,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  name: string;

  @ApiProperty({
    description: 'Service description',
    example: 'Professional haircut service with styling consultation',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Service image URL',
    example: 'https://example.com/haircut.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  image?: string;

  @ApiProperty({
    description: 'Base price for the service',
    example: 45.00,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  basePrice?: number;

  @ApiProperty({
    description: 'Default duration in minutes',
    example: 45,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  defaultDuration?: number;

  @ApiProperty({
    description: 'Whether service is available at home',
    example: false,
    required: false,
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  })
  @IsBoolean()
  availableAtHome?: boolean;

  @ApiProperty({
    description: 'Gender this service is available for',
    example: ServiceGenderEnum.BOTH,
    enum: ServiceGenderEnum,
    required: false,
  })
  @IsOptional()
  @IsEnum(ServiceGenderEnum)
  gender?: ServiceGenderEnum;

  @ApiProperty({
    description: 'Whether the service is active',
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

export class UpdateServiceDto {
  @ApiProperty({
    description: 'Service category ID',
    example: 'uuid-of-category',
    required: false,
  })
  @IsOptional()
  @IsUUID(4)
  categoryId?: string;

  @ApiProperty({
    description: 'Service name',
    example: 'Haircut',
    maxLength: 150,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @ApiProperty({
    description: 'Service description',
    example: 'Professional haircut service with styling consultation',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Service image URL',
    example: 'https://example.com/haircut.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  image?: string;

  @ApiProperty({
    description: 'Base price for the service',
    example: 45.00,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  basePrice?: number;

  @ApiProperty({
    description: 'Default duration in minutes',
    example: 45,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  defaultDuration?: number;

  @ApiProperty({
    description: 'Whether service is available at home',
    example: false,
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
  availableAtHome?: boolean;

  @ApiProperty({
    description: 'Gender this service is available for',
    example: ServiceGenderEnum.BOTH,
    enum: ServiceGenderEnum,
    required: false,
  })
  @IsOptional()
  @IsEnum(ServiceGenderEnum)
  gender?: ServiceGenderEnum;

  @ApiProperty({
    description: 'Whether the service is active',
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

export class ServiceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  image?: string;

  @ApiProperty({ required: false })
  basePrice?: number;

  @ApiProperty({ required: false })
  defaultDuration?: number;

  @ApiProperty()
  availableAtHome: boolean;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: ServiceCategoryResponseDto })
  category: ServiceCategoryResponseDto;

  @ApiProperty({ enum: ServiceGenderEnum })
  gender: ServiceGenderEnum;
}

export class ServiceListResponseDto {
  @ApiProperty({ type: [ServiceResponseDto] })
  data: ServiceResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

// Simplified service DTO for grouped response (without repeated category info)
export class ServiceInCategoryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  image?: string;

  @ApiProperty({ required: false })
  basePrice?: number;

  @ApiProperty({ required: false })
  defaultDuration?: number;

  @ApiProperty()
  availableAtHome: boolean;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ enum: ServiceGenderEnum })
  gender: ServiceGenderEnum;
}

export class CategoryWithServicesDto {
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

  @ApiProperty({ type: [ServiceInCategoryDto] })
  services: ServiceInCategoryDto[];
}

export class ServicesGroupedByCategoryDataDto {
  @ApiProperty({ type: [CategoryWithServicesDto] })
  categories: CategoryWithServicesDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

export class ServicesGroupedByCategoryResponseDto extends ApiResponseDto<ServicesGroupedByCategoryDataDto> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Services grouped by categories retrieved successfully' })
  message: string;

  @ApiProperty({ type: ServicesGroupedByCategoryDataDto })
  data: ServicesGroupedByCategoryDataDto;

  constructor(
    code: number = 200,
    success: boolean = true,
    message: string = 'Services grouped by categories retrieved successfully',
    data: ServicesGroupedByCategoryDataDto
  ) {
    super(code, success, message, data);
  }
}