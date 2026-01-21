import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { VendorStatus } from '../../common/enums/vendor-status.enum';

export class UpdateVendorStatusDto {
  @ApiProperty({
    enum: VendorStatus,
    description: 'New vendor status',
    example: VendorStatus.ACTIVE,
  })
  @IsEnum(VendorStatus)
  vendorStatus: VendorStatus;
}
