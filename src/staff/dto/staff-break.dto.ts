import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsNumber,
  IsString,
  IsDateString,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BreakType } from '../../common/enums';

export class CreateStaffBreakDto {
  @ApiProperty({ description: '0=Sunday, 1=Monday, ..., 6=Saturday' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({ description: 'Time in HH:MM format (24-hour)' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Start time must be in HH:MM format (24-hour)',
  })
  startTime: string;

  @ApiProperty({ description: 'Time in HH:MM format (24-hour)' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'End time must be in HH:MM format (24-hour)',
  })
  endTime: string;

  @ApiProperty({ enum: BreakType })
  @IsNotEmpty()
  @IsEnum(BreakType)
  breakType: BreakType;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isRecurring?: boolean = true;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  effectiveTo?: string;
}

export class UpdateStaffBreakDto {
  @ApiProperty({ description: '0=Sunday, 1=Monday, ..., 6=Saturday', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(6)
  dayOfWeek?: number;

  @ApiProperty({ description: 'Time in HH:MM format (24-hour)', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Start time must be in HH:MM format (24-hour)',
  })
  startTime?: string;

  @ApiProperty({ description: 'Time in HH:MM format (24-hour)', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'End time must be in HH:MM format (24-hour)',
  })
  endTime?: string;

  @ApiProperty({ enum: BreakType, required: false })
  @IsOptional()
  @IsEnum(BreakType)
  breakType?: BreakType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isRecurring?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  effectiveTo?: string;
}

export class StaffBreakResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  staffId: string;

  @ApiProperty({ description: '0=Sunday, 1=Monday, ..., 6=Saturday' })
  dayOfWeek: number;

  @ApiProperty()
  startTime: string;

  @ApiProperty()
  endTime: string;

  @ApiProperty({ enum: BreakType })
  breakType: BreakType;

  @ApiProperty()
  isRecurring: boolean;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ required: false })
  effectiveFrom?: Date;

  @ApiProperty({ required: false })
  effectiveTo?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class StaffBreakListResponseDto {
  @ApiProperty({ type: [StaffBreakResponseDto] })
  data: StaffBreakResponseDto[];

  @ApiProperty()
  total: number;
}