import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsPositive, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

export class BusinessServiceDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  serviceId: string;

  @ApiProperty()
  serviceName: string;

  @ApiProperty({ required: false })
  serviceDescription?: string;

  @ApiProperty({ required: false })
  serviceCategoryName?: string;

  @ApiProperty({ required: false })
  defaultPrice?: number;

  @ApiProperty({ required: false })
  defaultDurationMinutes?: number;

  @ApiProperty({ required: false })
  customPrice?: number;

  @ApiProperty({ required: false })
  customDurationMinutes?: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class BusinessServicesResponseDto extends ApiResponseDto<BusinessServiceDto[]> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Business services retrieved successfully' })
  message: string;

  @ApiProperty({ type: [BusinessServiceDto] })
  data: BusinessServiceDto[];

  constructor(code: number, success: boolean, message: string, data: BusinessServiceDto[]) {
    super(code, success, message, data);
  }
}