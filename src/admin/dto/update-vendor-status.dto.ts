import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { VendorStatus } from '../../common/enums/vendor-status.enum';

export class UpdateVendorStatusDto {
  @ApiProperty({
    enum: VendorStatus,
    description: 'New vendor status',
    example: VendorStatus.ACTIVE,
  })
  @IsEnum(VendorStatus)
  vendorStatus: VendorStatus;

  @ApiProperty({
    description: 'Optional remarks for the status change',
    example: 'Business owner verified and approved for active status',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  remarks?: string;
}
