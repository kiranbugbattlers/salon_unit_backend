import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsDateString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { Gender } from '../../common/enums';

export class CreateSupportMemberDto {
  @ApiProperty({ description: 'First name', example: 'John' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ description: 'Last name', example: 'Doe' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ description: 'Email address', example: 'john.doe@support.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Phone number', example: '+1234567890' })
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone must be a valid phone number',
  })
  phone: string;

  @ApiProperty({ enum: Gender, description: 'Gender', required: false })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({ description: 'Date of birth (ISO 8601)', required: false, example: '1990-01-01' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;
}
