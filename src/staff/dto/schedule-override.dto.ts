import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsEnum,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator';
import { StaffOverrideType } from '../../common/enums';

export class CreateScheduleOverrideDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiProperty({ enum: StaffOverrideType })
  @IsNotEmpty()
  @IsEnum(StaffOverrideType)
  overrideType: StaffOverrideType;

  @ApiProperty({ required: false, description: 'Time in HH:MM format (24-hour)' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Start time must be in HH:MM format (24-hour)',
  })
  startTime?: string;

  @ApiProperty({ required: false, description: 'Time in HH:MM format (24-hour)' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'End time must be in HH:MM format (24-hour)',
  })
  endTime?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}

export class UpdateScheduleOverrideDto {
  @ApiProperty({ enum: StaffOverrideType, required: false })
  @IsOptional()
  @IsEnum(StaffOverrideType)
  overrideType?: StaffOverrideType;

  @ApiProperty({ required: false, description: 'Time in HH:MM format (24-hour)' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Start time must be in HH:MM format (24-hour)',
  })
  startTime?: string;

  @ApiProperty({ required: false, description: 'Time in HH:MM format (24-hour)' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'End time must be in HH:MM format (24-hour)',
  })
  endTime?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}

export class ScheduleOverrideResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  staffId: string;

  @ApiProperty()
  date: Date;

  @ApiProperty({ enum: StaffOverrideType })
  overrideType: StaffOverrideType;

  @ApiProperty({ required: false })
  startTime?: string;

  @ApiProperty({ required: false })
  endTime?: string;

  @ApiProperty({ required: false })
  reason?: string;

  @ApiProperty()
  createdAt: Date;
}

export class ScheduleOverrideListResponseDto {
  @ApiProperty({ type: [ScheduleOverrideResponseDto] })
  data: ScheduleOverrideResponseDto[];

  @ApiProperty()
  total: number;
}