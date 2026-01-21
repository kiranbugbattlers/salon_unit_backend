import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class FcmTokenDto {
  @ApiProperty({
    description: 'Firebase Cloud Messaging token for push notifications',
    example: 'dGhpc19pc19hX2ZjbV90b2tlbl9leGFtcGxl...',
  })
  @IsNotEmpty()
  @IsString()
  fcmToken: string;

  @ApiProperty({
    description: 'Device type (optional)',
    example: 'android',
    enum: ['android', 'ios', 'web'],
    required: false,
  })
  @IsOptional()
  @IsString()
  deviceType?: string;

  @ApiProperty({
    description: 'Device identifier (optional)',
    example: 'device_123456',
    required: false,
  })
  @IsOptional()
  @IsString()
  deviceId?: string;
}