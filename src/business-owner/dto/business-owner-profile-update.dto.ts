import { IsString, IsOptional, IsEnum, IsDateString, IsInt, IsNumber, Min, Max, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../../common/enums';

export class BusinessOwnerProfileUpdateDto {
  @ApiProperty({
    description: 'First name of the business owner',
    example: 'John',
    required: false,
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName?: string;

  @ApiProperty({
    description: 'Last name of the business owner',
    example: 'Doe',
    required: false,
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  lastName?: string;

  @ApiProperty({
    description: 'Gender of the business owner',
    enum: Gender,
    example: Gender.MALE,
    required: false,
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({
    description: 'Date of birth in YYYY-MM-DD format',
    example: '1990-05-15',
    required: false,
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({
    description: 'Name of the business',
    example: 'Elite Hair Studio',
    required: false,
    minLength: 3,
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  businessName?: string;

  @ApiProperty({
    description: 'Description of the business',
    example: 'Professional hair styling and grooming services with 10+ years of experience',
    required: false,
    minLength: 10,
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  businessDescription?: string;

  @ApiProperty({
    description: 'Years of operating experience',
    example: 5,
    required: false,
    minimum: 0,
    maximum: 50,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  operatingYears?: number;

  @ApiProperty({
    description: 'UPI ID for payments',
    example: 'john@paytm',
    required: false,
    minLength: 3,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  upiId?: string;

  @ApiProperty({
    description: 'Credit limit assigned by admin (admin only)',
    example: 50000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditLimit?: number;
}