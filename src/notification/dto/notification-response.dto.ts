import { ApiProperty } from '@nestjs/swagger';

export class NotificationResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Notification sent successfully',
  })
  message: string;

  @ApiProperty({
    description: 'FCM message ID',
    example: 'projects/myproject/messages/1234567890',
    required: false,
  })
  messageId?: string;

  @ApiProperty({
    description: 'Number of successful sends (for bulk)',
    required: false,
  })
  successCount?: number;

  @ApiProperty({
    description: 'Number of failed sends (for bulk)',
    required: false,
  })
  failureCount?: number;
}

export class TokenResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Device token registered successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Token ID',
    required: false,
  })
  tokenId?: string;
}
