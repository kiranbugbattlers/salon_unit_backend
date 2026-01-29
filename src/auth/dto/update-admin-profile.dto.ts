import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail, MaxLength, IsBoolean } from 'class-validator';

export class UpdateAdminProfileDto {
  @ApiProperty({
    description: 'Admin username',
    example: 'parshuram_gaikwad',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  username?: string;

  @ApiProperty({
    description: 'Admin first name',
    example: 'Parshuram',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiProperty({
    description: 'Admin last name',
    example: 'Gaikwad',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiProperty({
    description: 'Admin email',
    example: 'parshuram@styleplus.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Admin active status',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
