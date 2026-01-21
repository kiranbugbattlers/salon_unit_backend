import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, Length, IsEnum } from 'class-validator';
import { UserRole } from '../../common/enums';

export class SendOtpDto {
  @ApiProperty({
    description: 'Phone number in format: +919876543210 or 9876543210',
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
    description: 'User role for which OTP is being requested',
    example: 'customer',
    enum: UserRole,
  })
  @IsNotEmpty()
  @IsEnum(UserRole, {
    message: 'Role must be either customer or business_owner',
  })
  role: UserRole;
}