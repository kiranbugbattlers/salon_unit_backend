import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DeviceType, UserType } from '../entities/device-token.entity';

export class RegisterTokenDto {
  @ApiProperty({
    description: 'FCM token received from the client device',
    example: 'fXxY_1234567890abcdefghijklmnopqrstuvwxyz...',
  })
  @IsString()
  fcmToken: string;

  @ApiProperty({
    description: 'Type of device',
    enum: DeviceType,
    example: DeviceType.ANDROID,
  })
  @IsEnum(DeviceType)
  deviceType: DeviceType;

  @ApiProperty({
    description: 'Type of user',
    enum: UserType,
    example: UserType.CUSTOMER,
  })
  @IsEnum(UserType)
  userType: UserType;

  @ApiProperty({
    description: 'Additional device information',
    required: false,
    example: {
      model: 'iPhone 14 Pro',
      osVersion: 'iOS 17.0',
      appVersion: '1.0.0',
      deviceName: 'John\'s iPhone',
    },
  })
  @IsOptional()
  @IsObject()
  deviceInfo?: {
    model?: string;
    osVersion?: string;
    appVersion?: string;
    deviceName?: string;
  };
}
