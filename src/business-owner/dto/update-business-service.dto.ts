import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsPositive, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateBusinessServiceItemDto {
  @ApiProperty({
    description: 'Service ID to update',
    example: 'service-uuid-123'
  })
  @IsString()
  serviceId: string;

  @ApiProperty({
    description: 'Custom price for this service (overrides default price)',
    example: 500,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  customPrice?: number;

  @ApiProperty({
    description: 'Custom duration in minutes for this service (overrides default duration)',
    example: 60,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  customDurationMinutes?: number;

  @ApiProperty({
    description: 'Whether this service is active for the business',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateBusinessServicesDto {
  @ApiProperty({
    description: 'Array of services to update',
    type: [UpdateBusinessServiceItemDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateBusinessServiceItemDto)
  services: UpdateBusinessServiceItemDto[];
}