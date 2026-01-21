import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

export class BusinessAddressInfoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  addressType: string;

  @ApiProperty()
  latitude: number;

  @ApiProperty()
  longitude: number;

  @ApiProperty()
  streetAddress: string;

  @ApiProperty({ required: false })
  addressLine1?: string;

  @ApiProperty({ required: false })
  addressLine2?: string;

  @ApiProperty({ required: false })
  landmark?: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  state: string;

  @ApiProperty()
  postalCode: string;

  @ApiProperty()
  country: string;

  @ApiProperty()
  isPrimary: boolean;

  @ApiProperty()
  isActive: boolean;
}

export class BusinessMediaInfoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  mediaType: string;

  @ApiProperty()
  mediaUrl: string;

  @ApiProperty({ required: false })
  cdnUrl?: string;

  @ApiProperty({ required: false })
  thumbnailUrl?: string;

  @ApiProperty({ required: false })
  fileName?: string;

  @ApiProperty({ required: false })
  fileSize?: number;

  @ApiProperty({ required: false })
  mimeType?: string;

  @ApiProperty()
  displayOrder: number;

  @ApiProperty()
  createdAt: Date;
}

export class BusinessInfoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({
    description: 'Unique shop identifier with format SH-XXXXXX',
    example: 'SH-A1B2C3'
  })
  shopId: string;

  @ApiProperty({ required: false })
  businessName?: string;

  @ApiProperty({ required: false })
  businessDescription?: string;

  @ApiProperty({ required: false })
  operatingYears?: number;

  @ApiProperty()
  isApproved: boolean;

  @ApiProperty({ required: false })
  approvedAt?: Date;

  @ApiProperty({
    type: BusinessAddressInfoDto,
    required: false,
    nullable: true,
    description: 'Business address information (single address object, not an array)'
  })
  address?: BusinessAddressInfoDto;

  @ApiProperty({
    type: [BusinessMediaInfoDto],
    required: false,
    description: 'Business media files (images/videos)'
  })
  media?: BusinessMediaInfoDto[];

  @ApiProperty({ required: false, nullable: true })
  averageRating?: number;

  @ApiProperty({ example: 0 })
  reviewCount: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class BusinessInfoResponseDto extends ApiResponseDto<BusinessInfoDto> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Business information retrieved successfully' })
  message: string;

  @ApiProperty({ type: BusinessInfoDto })
  data: BusinessInfoDto;

  constructor(code: number, success: boolean, message: string, data: BusinessInfoDto) {
    super(code, success, message, data);
  }
}