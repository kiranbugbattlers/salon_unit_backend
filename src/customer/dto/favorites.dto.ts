import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { BusinessAddressDto, BusinessMediaDto } from '../../business/dto';

export class FavoriteBusinessItemDto {
  @ApiProperty({
    description: 'Business Owner unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Business shop ID',
    example: 'SH-123456',
  })
  shopId: string;

  @ApiProperty({
    description: 'Business name',
    example: 'Premium Hair Salon',
  })
  businessName: string;

  @ApiProperty({
    description: 'Business description',
    example: 'Full-service salon offering haircuts, styling, and coloring',
    required: false,
  })
  businessDescription?: string;

  @ApiProperty({
    description: 'Years the business has been operating',
    example: 5,
    required: false,
  })
  operatingYears?: number;

  @ApiProperty({
    description: 'Business address details',
    required: false,
  })
  businessAddress?: BusinessAddressDto;

  @ApiProperty({
    description: 'Business media (images/videos)',
    type: [BusinessMediaDto],
    required: false,
  })
  businessMedia?: BusinessMediaDto[];

  @ApiProperty({
    description: 'Average rating from customer reviews',
    example: 4.5,
    required: false,
  })
  averageRating?: number;

  @ApiProperty({
    description: 'Total number of reviews',
    example: 120,
    required: false,
  })
  reviewCount?: number;

  @ApiProperty({
    description: 'When the business was favorited',
    example: '2024-01-15T10:30:00Z',
  })
  favoritedAt: Date;
}

export class FavoritesPaginationDto {
  @ApiProperty({
    description: 'Page number',
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
}

export class FavoritesMetaDto {
  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Items per page',
    example: 20,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of favorites',
    example: 45,
  })
  total: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 3,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Whether there is a next page',
    example: true,
  })
  hasNextPage: boolean;

  @ApiProperty({
    description: 'Whether there is a previous page',
    example: false,
  })
  hasPreviousPage: boolean;
}

export class FavoritesDataDto {
  @ApiProperty({
    description: 'List of favorite businesses',
    type: [FavoriteBusinessItemDto],
  })
  favorites: FavoriteBusinessItemDto[];

  @ApiProperty({
    description: 'Pagination metadata',
  })
  meta: FavoritesMetaDto;
}

export class FavoritesResponseDto extends ApiResponseDto<FavoritesDataDto> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Favorites retrieved successfully' })
  message: string;

  @ApiProperty()
  data: FavoritesDataDto;

  constructor(code: number, success: boolean, message: string, data: FavoritesDataDto) {
    super(code, success, message, data);
  }
}

export class FavoriteActionResponseDto extends ApiResponseDto<{ isFavorite: boolean }> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Business added to favorites' })
  message: string;

  @ApiProperty({
    example: { isFavorite: true },
  })
  data: { isFavorite: boolean };

  constructor(code: number, success: boolean, message: string, isFavorite: boolean) {
    super(code, success, message, { isFavorite });
  }
}
