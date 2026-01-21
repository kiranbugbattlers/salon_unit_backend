import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { CreateStaffDto } from './create-staff.dto';

export class UpdateStaffDto extends PartialType(CreateStaffDto) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}