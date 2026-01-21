import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches, IsEnum } from 'class-validator';
import { UserRole } from '../../common/enums';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'Phone number',
    example: '9876543210',
  })
  @IsNotEmpty()
  @IsString()
  @Length(10, 15)
  @Matches(/^(\+91|91)?[6-9]\d{9}$/, {
    message: 'Phone number must be a valid Indian mobile number',
  })
  phone: string;

  @ApiProperty({
    description: '6-digit OTP code',
    example: '123456',
  })
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/, {
    message: 'OTP must be a 6-digit number',
  })
  otp: string;

  @ApiProperty({
    description: 'User role to assign after verification',
    example: 'customer',
    enum: UserRole,
  })
  @IsNotEmpty()
  @IsEnum(UserRole, {
    message: 'Role must be either customer or business_owner',
  })
  role: UserRole;
}