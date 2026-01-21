import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsUUID,
  IsNumber,
  IsPositive,
  Min,
} from 'class-validator';

export class AssignServiceDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID(4)
  serviceId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  customPrice: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  customDurationMinutes: number;
}

export class UpdateStaffServiceDto {
  @ApiProperty({ required: false })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  customPrice?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(1)
  customDurationMinutes?: number;
}