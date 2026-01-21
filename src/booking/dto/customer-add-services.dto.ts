import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';

export class CustomerAddServicesDto {
  @ApiProperty({
    description: 'Array of business service IDs to add as add-ons',
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  businessServiceIds?: string[];

  @ApiProperty({
    description: 'Array of service package IDs to add as add-ons',
    example: ['123e4567-e89b-12d3-a456-426614174001'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  servicePackageIds?: string[];

  @ApiProperty({
    description: 'Optional notes about the add-on services',
    example: 'Customer requested during service',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ValidateIf((o) => !o.businessServiceIds && !o.servicePackageIds)
  @IsArray()
  validate() {
    if (!this.businessServiceIds && !this.servicePackageIds) {
      throw new Error(
        'At least one of businessServiceIds or servicePackageIds must be provided',
      );
    }
    return true;
  }
}
