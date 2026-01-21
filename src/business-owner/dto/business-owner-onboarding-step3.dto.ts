import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsArray, IsUUID, IsEnum, IsString, ValidateNested, IsNumber, Min, Max, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ServiceLocationType } from '../../common/enums';

export class BusinessHoursDto {
  @ApiProperty({
    description: 'Day of week (0=Sunday, 1=Monday, ..., 6=Saturday)',
    example: 1,
  })
  @IsNumber()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({
    description: 'Opening time (24-hour format)',
    example: '09:00',
  })
  @IsNotEmpty()
  @IsString()
  openTime: string;

  @ApiProperty({
    description: 'Closing time (24-hour format)',
    example: '20:00',
  })
  @IsNotEmpty()
  @IsString()
  closeTime: string;

  @ApiProperty({
    description: 'Is closed on this day',
    example: false,
    default: false,
  })
  @IsOptional()
  isClosed?: boolean;
}

export class ServiceOfferingDto {
  @ApiProperty({
    description: 'ID of the existing service from the service catalog',
    example: 'uuid-of-existing-service',
  })
  @IsNotEmpty()
  @IsUUID(4)
  serviceId: string;

  @ApiProperty({
    description: 'Custom price for this service (in INR)',
    example: 500,
  })
  @IsNumber()
  @Min(0)
  customPrice: number;

  @ApiProperty({
    description: 'Custom duration for this service in minutes',
    example: 30,
  })
  @IsNumber()
  @Min(1)
  customDurationMinutes: number;
}

export class BusinessOwnerOnboardingStep3Dto {
  @ApiProperty({
    description: 'Services offered by the business owner',
    type: [ServiceOfferingDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceOfferingDto)
  servicesOffered: ServiceOfferingDto[];

  @ApiProperty({
    description: 'Business hours for each day',
    type: [BusinessHoursDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BusinessHoursDto)
  businessHours: BusinessHoursDto[];

  @ApiProperty({
    description: 'Working days (0=Sunday, 1=Monday, ..., 6=Saturday)',
    example: [1, 2, 3, 4, 5, 6],
    type: [Number],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  workingDays: number[];

  @ApiProperty({
    description: 'Service location type',
    enum: ServiceLocationType,
    example: ServiceLocationType.BOTH,
  })
  @IsNotEmpty()
  @IsEnum(ServiceLocationType)
  serviceLocationType: ServiceLocationType;

  @ApiProperty({
    description: 'Travel radius in kilometers (for user location services)',
    example: 5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  travelRadiusKm?: number;
}