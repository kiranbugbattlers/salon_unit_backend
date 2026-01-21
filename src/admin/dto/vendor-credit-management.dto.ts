import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString, IsOptional, IsEnum } from 'class-validator';

export class AddVendorCreditDto {
  @ApiProperty({
    description: 'Credit points to add to vendor',
    example: 1000,
    minimum: 0.01,
  })
  @IsNumber()
  @IsPositive()
  creditPoints: number;

  @ApiProperty({
    description: 'Reason for adding credit points',
    example: 'Vendor approved and account activated',
    required: false,
  })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class VendorCreditStatusDto {
  @ApiProperty({
    description: 'Current credit status',
    enum: ['active', 'overdue', 'suspended'],
    example: 'active',
  })
  @IsEnum(['active', 'overdue', 'suspended'])
  status: string;

  @ApiProperty({
    description: 'Notes about status change',
    example: 'Credit points depleted - account marked as overdue',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
