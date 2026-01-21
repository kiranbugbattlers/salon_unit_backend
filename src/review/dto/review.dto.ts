import { ApiProperty } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsUUID, Min, Max } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ description: 'ID of the booking being reviewed' })
  @IsNotEmpty()
  @IsUUID()
  bookingId: string;

  @ApiProperty({ description: 'Rating given (1-5)', minimum: 1, maximum: 5 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ description: 'Review comment', required: false })
  @IsOptional()
  @IsString()
  comment?: string;
}

export class UpdateReviewDto {
  @ApiProperty({ description: 'Rating given (1-5)', required: false, minimum: 1, maximum: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiProperty({ description: 'Review comment', required: false })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({ description: 'Whether the review is approved to be shown publicly', required: false })
  @IsOptional()
  isApproved?: boolean;
}

export class ReviewResponseDto {
  @ApiProperty({ description: 'Unique identifier of the review' })
  id: string;

  @ApiProperty({ description: 'ID of the booking being reviewed' })
  bookingId: string;

  @ApiProperty({ description: 'ID of the customer who wrote the review' })
  customerId: string;

  @ApiProperty({ description: 'ID of the business owner being reviewed' })
  businessOwnerId: string;

  @ApiProperty({ description: 'Rating given (1-5)' })
  rating: number;

  @ApiProperty({ description: 'Review comment', required: false })
  comment?: string;

  @ApiProperty({ description: 'Whether the review is approved to be shown publicly' })
  isApproved: boolean;

  @ApiProperty({ description: 'Date when the review was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Date when the review was last updated' })
  updatedAt: Date;

  @ApiProperty({ description: 'Customer information', required: false })
  customer?: {
    id: string;
    firstName?: string;
    lastName?: string;
    profilePic?: string;
    profilePicCdnUrl?: string;
  };

  @ApiProperty({ description: 'Business owner information', required: false })
  businessOwner?: {
    id: string;
    businessName?: string;
    shopId: string;
  };
}

export class ReviewListResponseDto {
  @ApiProperty({ description: 'Array of reviews' })
  reviews: ReviewResponseDto[];

  @ApiProperty({ description: 'Total number of reviews' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Number of reviews per page' })
  limit: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number;
}

export class ReviewQueryDto {
  @ApiProperty({ description: 'Filter by business owner ID', required: false })
  @IsOptional()
  @IsUUID()
  businessOwnerId?: string;

  @ApiProperty({ description: 'Filter by customer ID', required: false })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiProperty({ description: 'Filter by rating', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiProperty({ description: 'Filter by approval status', required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isApproved?: boolean;

  @ApiProperty({ description: 'Page number', required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'Number of reviews per page', required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
