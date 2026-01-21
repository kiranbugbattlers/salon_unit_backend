import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { BusinessAddressDto, BusinessMediaDto } from './business-response.dto';
import { ServicePackageResponseDto } from '../../business-owner/dto';
import { ServiceLocationType } from '../../common/enums/service-location-type.enum';

export class ServiceCategoryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;
}

export class BusinessServiceDetailDto {
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
  category: ServiceCategoryDto;

  @ApiProperty()
  isActive: boolean;
}

export class StaffDetailDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  dateOfBirth: Date;

  @ApiProperty()
  gender: string;

  @ApiProperty({ required: false })
  profilePic?: string;

  @ApiProperty({ required: false })
  profilePicCdnUrl?: string;

  @ApiProperty({ description: 'Services that this staff member can provide', type: [String] })
  serviceIds: string[];
}

export class BusinessDetailDto {
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

  @ApiProperty({ type: [BusinessServiceDetailDto], description: 'All services offered by this business' })
  services: BusinessServiceDetailDto[];

  @ApiProperty({ type: [ServicePackageResponseDto], description: 'All service packages offered by this business', required: false })
  servicePackages?: ServicePackageResponseDto[];

  @ApiProperty({ type: [StaffDetailDto], description: 'All staff members of this business' })
  staff: StaffDetailDto[];

  @ApiProperty({ description: 'Price range based on available services', required: false })
  priceRange?: {
    min: number;
    max: number;
  };

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

  @ApiProperty({
    description: 'Days when the business is closed (0=Sunday, 1=Monday, ..., 6=Saturday)',
    required: false,
    type: [Number],
    example: [0, 6],
  })
  closedDays?: number[];

  @ApiProperty({
    description: 'Business operating hours for open days only (0=Sunday, 1=Monday, ..., 6=Saturday)',
    required: false,
    type: 'array',
    example: [
      { dayOfWeek: 1, openTime: '09:00', closeTime: '18:00' },
      { dayOfWeek: 2, openTime: '09:00', closeTime: '18:00' }
    ],
  })
  operatingHours?: {
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
  }[];

  @ApiProperty({
    description: 'Service location type - where the business provides services',
    enum: ServiceLocationType,
    required: false,
    example: ServiceLocationType.BOTH,
  })
  serviceLocationType?: ServiceLocationType;

}

export class BusinessDetailResponseDto extends ApiResponseDto<BusinessDetailDto> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Business details retrieved successfully' })
  message: string;

  @ApiProperty()
  data: BusinessDetailDto;

  constructor(code: number, success: boolean, message: string, data: BusinessDetailDto) {
    super(code, success, message, data);
  }
}