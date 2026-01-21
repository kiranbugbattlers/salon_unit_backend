import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, IsNumber, Min } from 'class-validator';

export class ApproveBusinessDto {
  @ApiProperty({
    description: 'Optional review notes for the approval',
    example: 'Business meets all requirements and documentation is complete.',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reviewNotes?: string;

  @ApiProperty({
    description: 'Credit limit to assign to the vendor',
    example: 50000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditLimit?: number;

  @ApiProperty({
    description: 'Admin remarks about the vendor approval',
    example: 'Approved with standard credit terms',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  adminRemarks?: string;
}