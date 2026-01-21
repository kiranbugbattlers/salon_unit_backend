import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsDateString, IsUrl, MaxLength, IsArray, IsUUID, IsInt, Min, Max } from 'class-validator';
import { Gender, HairType } from '../../common/enums';

export class UpdateCustomerProfileDto {
  // Step 1 Fields - Basic Information (excluding phone/email for signup method protection)
  @ApiProperty({
    description: 'First name',
    example: 'John',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Doe', 
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiProperty({
    description: 'Gender',
    enum: Gender,
    example: Gender.MALE,
    required: false,
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({
    description: 'Date of birth (YYYY-MM-DD format)',
    example: '1990-05-15',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  // User Fields
  @ApiProperty({
    description: 'Profile picture URL',
    example: 'https://example.com/profile.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  profilePic?: string;

  // Step 3 Fields - Service Preferences  
  @ApiProperty({
    description: 'Hair type',
    enum: HairType,
    example: HairType.STRAIGHT,
    required: false,
  })
  @IsOptional()
  @IsEnum(HairType)
  hairType?: HairType;

  @ApiProperty({
    description: 'Preferred service category IDs',
    example: ['uuid1', 'uuid2', 'uuid3'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  preferredCategoryIds?: string[];

  // Step 4 Fields - Timing Preferences
  @ApiProperty({
    description: 'Preferred time slot IDs',
    example: ['uuid1', 'uuid2'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  preferredTimeSlotIds?: string[];

  @ApiProperty({
    description: 'Preferred days of week (1=Monday, 7=Sunday)',
    example: [1, 2, 3, 4, 5],
    type: [Number],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(7, { each: true })
  preferredDays?: number[];
}