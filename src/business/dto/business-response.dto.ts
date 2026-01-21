import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

export class BusinessAddressDto {
  @ApiProperty()
  id: string;

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

  @ApiProperty({ required: false })
  latitude?: number;

  @ApiProperty({ required: false })
  longitude?: number;

  @ApiProperty({ description: 'Distance from user location in km', required: false })
  distance?: number;
}

export class BusinessMediaDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  mediaUrl: string;

  @ApiProperty({ required: false })
  mediaCdnUrl?: string;

  @ApiProperty()
  mediaType: string;

  @ApiProperty({ required: false })
  description?: string;
}


export class BusinessItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
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

  @ApiProperty({ required: false })
  businessAddress?: BusinessAddressDto;

  @ApiProperty({ type: [BusinessMediaDto], required: false })
  businessMedia?: BusinessMediaDto[];



  @ApiProperty({ description: 'Average rating from customer reviews', required: false })
  averageRating?: number;

  @ApiProperty({ description: 'Total number of reviews', required: false })
  reviewCount?: number;

  @ApiProperty({ description: 'User-specific data like isFavorite', required: false })
  userSpecific?: {
    isFavorite?: boolean;
    lastVisitedAt?: Date;
    bookingCount?: number;
  };

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class BusinessMetaDto {
  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Items per page' })
  limit: number;

  @ApiProperty({ description: 'Total number of businesses' })
  total: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number;

  @ApiProperty({ description: 'Whether there is a next page' })
  hasNextPage: boolean;

  @ApiProperty({ description: 'Whether there is a previous page' })
  hasPreviousPage: boolean;

  @ApiProperty({ description: 'Applied filters summary', required: false })
  filters?: {
    location?: {
      lat: number;
      lng: number;
      radius: number;
    };
    category?: string;
    priceRange?: {
      min?: number;
      max?: number;
    };
    availableAtHome?: boolean;
    operatingYears?: {
      min?: number;
    };
    search?: string;
    sort?: string;
  };
}

export class BusinessDataDto {
  @ApiProperty({ type: [BusinessItemDto] })
  businesses: BusinessItemDto[];

  @ApiProperty()
  meta: BusinessMetaDto;
}

export class BusinessResponseDto extends ApiResponseDto<BusinessDataDto> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Businesses retrieved successfully' })
  message: string;

  @ApiProperty()
  data: BusinessDataDto;

  constructor(code: number, success: boolean, message: string, data: BusinessDataDto) {
    super(code, success, message, data);
  }
}