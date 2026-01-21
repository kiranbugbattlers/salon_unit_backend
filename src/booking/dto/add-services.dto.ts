import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class AddServicesDto {
  @ApiProperty({
    description: 'Business service IDs to add as add-ons',
    example: ['123e4567-e89b-12d3-a456-426614174000', '456e7890-e12b-34c5-d678-901234567890'],
    required: false,
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  businessServiceIds?: string[];

  @ApiProperty({
    description: 'Service package IDs to add as add-ons',
    example: ['789e0123-e45f-67g8-h901-234567890123'],
    required: false,
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  servicePackageIds?: string[];

  @ApiProperty({
    description: 'Notes about add-on services',
    example: 'Customer requested hair coloring after consultation',
    required: false
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
