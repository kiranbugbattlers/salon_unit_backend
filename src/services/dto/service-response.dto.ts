import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

export class ServiceCategoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;
}

export class BusinessOwnerInfoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  shopId: string;

  @ApiProperty({ required: false })
  businessName?: string;

  @ApiProperty({ required: false })
  businessDescription?: string;

  @ApiProperty()
  isApproved: boolean;
}

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

export class ServiceItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  basePrice?: number;

  @ApiProperty()
  customPrice: number;

  @ApiProperty({ required: false })
  defaultDuration?: number;

  @ApiProperty()
  customDurationMinutes: number;

  @ApiProperty()
  availableAtHome: boolean;

  @ApiProperty({ required: false })
  image?: string;

  @ApiProperty({ required: false })
  gender?: string;

  @ApiProperty()
  category: ServiceCategoryResponseDto;

  @ApiProperty()
  businessOwner: BusinessOwnerInfoDto;

  @ApiProperty({ required: false })
  businessAddress?: BusinessAddressDto;

  @ApiProperty({ description: 'User-specific data like isFavorite', required: false })
  userSpecific?: {
    isFavorite?: boolean;
    lastBookedAt?: Date;
    bookingCount?: number;
  };

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ServicesMetaDto {
  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Items per page' })
  limit: number;

  @ApiProperty({ description: 'Total number of services' })
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
    sort?: string;
  };
}

export class ServicesDataDto {
  @ApiProperty({ type: [ServiceItemDto] })
  services: ServiceItemDto[];

  @ApiProperty()
  meta: ServicesMetaDto;
}

export class ServicesResponseDto extends ApiResponseDto<ServicesDataDto> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Services retrieved successfully' })
  message: string;

  @ApiProperty()
  data: ServicesDataDto;

  constructor(code: number, success: boolean, message: string, data: ServicesDataDto) {
    super(code, success, message, data);
  }
}