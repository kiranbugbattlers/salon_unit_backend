import { IsString, IsOptional, IsObject, IsEnum, IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '../entities/notification-log.entity';
import { UserType } from '../entities/device-token.entity';

export class SendNotificationDto {
  @ApiProperty({
    description: 'User ID to send notification to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Type of user',
    enum: UserType,
    example: UserType.CUSTOMER,
  })
  @IsEnum(UserType)
  userType: UserType;

  @ApiProperty({
    description: 'Notification type',
    enum: NotificationType,
    example: NotificationType.BOOKING_REQUEST_APPROVED,
  })
  @IsEnum(NotificationType)
  notificationType: NotificationType;

  @ApiProperty({
    description: 'Notification title',
    example: 'Booking Request Approved',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Notification body/message',
    example: 'Your booking request has been approved! Your OTP is: 123456',
  })
  @IsString()
  body: string;

  @ApiProperty({
    description: 'Additional data payload',
    required: false,
    example: {
      bookingId: '123e4567-e89b-12d3-a456-426614174000',
      action: 'view_booking',
    },
  })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;
}

export class SendBulkNotificationDto {
  @ApiProperty({
    description: 'Array of user IDs to send notification to',
    example: ['123e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174001'],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  userIds: string[];

  @ApiProperty({
    description: 'Type of users',
    enum: UserType,
    example: UserType.CUSTOMER,
  })
  @IsEnum(UserType)
  userType: UserType;

  @ApiProperty({
    description: 'Notification type',
    enum: NotificationType,
    example: NotificationType.PROMOTIONAL,
  })
  @IsEnum(NotificationType)
  notificationType: NotificationType;

  @ApiProperty({
    description: 'Notification title',
    example: 'Special Offer',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Notification body/message',
    example: 'Get 20% off on your next booking!',
  })
  @IsString()
  body: string;

  @ApiProperty({
    description: 'Additional data payload',
    required: false,
  })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;
}
