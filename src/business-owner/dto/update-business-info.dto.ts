import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsPositive, MaxLength } from 'class-validator';

export class UpdateBusinessInfoDto {
  @ApiProperty({
    description: 'Business name',
    example: 'Elite Hair Studio',
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  businessName?: string;

  @ApiProperty({
    description: 'Business description',
    example: 'Professional hair styling and grooming services',
    required: false
  })
  @IsOptional()
  @IsString()
  businessDescription?: string;

  @ApiProperty({
    description: 'Years of operating experience',
    example: 5,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  operatingYears?: number;
}