import { ApiProperty } from '@nestjs/swagger';
import { ServiceGenderEnum } from '../../common/enums/service-gender.enum';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

export class BusinessOwnerServiceInCategoryDto {
  @ApiProperty({ description: 'Unique identifier of the business service' })
  id: string;

  @ApiProperty({ description: 'Unique identifier of the original service' })
  serviceId: string;

  @ApiProperty({ description: 'Name of the service' })
  name: string;

  @ApiProperty({ description: 'Description of the service', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Image URL of the service', nullable: true })
  image?: string;

  @ApiProperty({ description: 'Base price of the service' })
  defaultPrice: number;

  @ApiProperty({ description: 'Default duration of the service in minutes' })
  defaultDurationMinutes: number;

  @ApiProperty({ description: 'Custom price set by the business owner for this service' })
  customPrice: number;

  @ApiProperty({ description: 'Custom duration in minutes set by the business owner for this service' })
  customDurationMinutes: number;

  @ApiProperty({ description: 'Whether the service is available at home' })
  availableAtHome: boolean;

  @ApiProperty({ description: 'Whether the service is active' })
  isActive: boolean;

  @ApiProperty({ enum: ServiceGenderEnum, description: 'Gender for which the service is applicable' })
  gender: ServiceGenderEnum;

  @ApiProperty({ description: 'Date and time when the service was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Date and time when the service was last updated' })
  updatedAt: Date;
}

export class BusinessOwnerCategoryWithServicesDto {
  @ApiProperty({ description: 'Unique identifier of the service category' })
  id: string;

  @ApiProperty({ description: 'Name of the service category' })
  name: string;

  @ApiProperty({ description: 'Description of the service category', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Image URL of the service category', nullable: true })
  image?: string;

  @ApiProperty({ description: 'Whether the service category is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Date and time when the category was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Date and time when the category was last updated' })
  updatedAt: Date;

  @ApiProperty({ type: [BusinessOwnerServiceInCategoryDto], description: 'List of services within this category' })
  services: BusinessOwnerServiceInCategoryDto[];
}

export class BusinessOwnerServicesGroupedByCategoryDataDto {
  @ApiProperty({ type: [BusinessOwnerCategoryWithServicesDto], description: 'List of service categories with their associated services' })
  categories: BusinessOwnerCategoryWithServicesDto[];

  @ApiProperty({ description: 'Total number of categories with services' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number;
}

export class BusinessOwnerServicesGroupedByCategoryResponseDto extends ApiResponseDto {
  @ApiProperty({ type: BusinessOwnerServicesGroupedByCategoryDataDto })
  data: BusinessOwnerServicesGroupedByCategoryDataDto;
}
