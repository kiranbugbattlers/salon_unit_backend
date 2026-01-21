import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsDateString,
  IsPhoneNumber,
  IsEmail,
  IsOptional,
  MaxLength,
  Matches,
} from 'class-validator';
import { Gender } from '../../common/enums';

export class CreateStaffDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  firstName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  lastName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsPhoneNumber('IN')
  phone: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ enum: Gender })
  @IsNotEmpty()
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({
    description: 'Lunch break start time in HH:MM format (24-hour)',
    example: '13:00'
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Lunch start time must be in HH:MM format (24-hour)',
  })
  lunchStartTime: string;

  @ApiProperty({
    description: 'Lunch break end time in HH:MM format (24-hour)',
    example: '14:00'
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Lunch end time must be in HH:MM format (24-hour)',
  })
  lunchEndTime: string;
}