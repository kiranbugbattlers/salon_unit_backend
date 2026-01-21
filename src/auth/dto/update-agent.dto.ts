import { IsString, IsOptional, IsEmail, IsDateString, IsEnum, IsObject, IsNumber, Min, Max, Length, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAgentDto {
  @ApiProperty({
    description: 'Agent first name',
    example: 'John',
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  firstName?: string;

  @ApiProperty({
    description: 'Agent last name',
    example: 'Doe',
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  lastName?: string;

  @ApiProperty({
    description: 'Agent gender',
    example: 'male',
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['male', 'female', 'other', 'prefer_not_to_say'])
  gender?: string;

  @ApiProperty({
    description: 'Date of birth (YYYY-MM-DD)',
    example: '1990-01-15',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({
    description: 'Unique employee ID',
    example: 'AGT-001',
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  employeeId?: string;

  @ApiProperty({
    description: 'Department',
    example: 'Customer Service',
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  department?: string;

  @ApiProperty({
    description: 'Position/Job title',
    example: 'Senior Agent',
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  position?: string;

  @ApiProperty({
    description: 'Hire date (YYYY-MM-DD)',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @ApiProperty({
    description: 'Salary amount',
    example: 55000.00,
    minimum: 0,
    maximum: 999999999,
    required: false,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(999999999)
  salary?: number;

  @ApiProperty({
    description: 'Agent active status',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Agent permissions and access levels',
    example: {
      canManageBookings: true,
      canViewReports: true,
      canManageCustomers: true,
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  permissions?: Record<string, any>;

  @ApiProperty({
    description: 'Additional notes about the agent',
    example: 'Updated permissions to include report access',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Agent location address',
    example: '123 Main St, New York, NY',
    required: false,
  })
  @IsOptional()
  @IsString()
  locationAddress?: string;

  @ApiProperty({
    description: 'Agent location latitude',
    example: 40.7128,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiProperty({
    description: 'Agent location longitude',
    example: -74.0060,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;
}