import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, IsOptional } from 'class-validator';

export class VerifyBookingOtpDto {
  @ApiProperty({
    description: '6-digit OTP code for booking verification',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @Length(6, 6, { message: 'OTP code must be exactly 6 digits' })
  otpCode: string;
}

export class CompleteServiceDto {
  @ApiProperty({
    description: 'Optional notes about service completion',
    example: 'Customer satisfied with the service',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
