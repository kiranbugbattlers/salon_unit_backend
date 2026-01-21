import { Controller, Post, Delete, Get, Body, Req, UseGuards, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { RegisterTokenDto } from './dto/register-token.dto';
import { SendNotificationDto, SendBulkNotificationDto } from './dto/send-notification.dto';
import { NotificationResponseDto, TokenResponseDto } from './dto/notification-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('Notifications')
@Controller('notifications')
@ApiBearerAuth('JWT')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('register-token')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Register FCM device token',
    description: 'Register a device token for receiving push notifications. This should be called when the app launches and gets the FCM token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Token registered successfully',
    type: TokenResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async registerToken(
    @Req() req: any,
    @Body() registerTokenDto: RegisterTokenDto,
  ): Promise<TokenResponseDto> {
    const userId = req.user.userId;
    const token = await this.notificationService.registerToken(userId, registerTokenDto);

    return {
      success: true,
      message: 'Device token registered successfully',
      tokenId: token.id,
    };
  }

  @Delete('unregister-token')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Unregister FCM device token',
    description: 'Unregister a device token when user logs out or uninstalls the app.',
  })
  @ApiResponse({
    status: 200,
    description: 'Token unregistered successfully',
    type: TokenResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async unregisterToken(
    @Req() req: any,
    @Body('fcmToken') fcmToken: string,
  ): Promise<TokenResponseDto> {
    const userId = req.user.userId;
    await this.notificationService.unregisterToken(userId, fcmToken);

    return {
      success: true,
      message: 'Device token unregistered successfully',
    };
  }

  @Post('send')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send notification to a user (Admin only)',
    description: 'Send a push notification to a specific user. This is an admin-only endpoint for testing or manual notifications.',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification sent successfully',
    type: NotificationResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async sendNotification(
    @Body() sendNotificationDto: SendNotificationDto,
  ): Promise<NotificationResponseDto> {
    const { userId, userType, notificationType, title, body, data } = sendNotificationDto;

    await this.notificationService.sendToUser(userId, userType, {
      notificationType,
      title,
      body,
      data,
    });

    return {
      success: true,
      message: 'Notification sent successfully',
    };
  }

  @Post('send-bulk')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send bulk notification (Admin only)',
    description: 'Send a push notification to multiple users at once. Useful for promotional campaigns or system announcements.',
  })
  @ApiResponse({
    status: 200,
    description: 'Bulk notification sent',
    type: NotificationResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async sendBulkNotification(
    @Body() sendBulkNotificationDto: SendBulkNotificationDto,
  ): Promise<NotificationResponseDto> {
    const result = await this.notificationService.sendBulkNotification(sendBulkNotificationDto);

    return {
      success: true,
      message: 'Bulk notification sent',
      successCount: result.successCount,
      failureCount: result.failureCount,
    };
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get notification history',
    description: 'Get the notification history for the authenticated user.',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of notifications to retrieve (default: 50)' })
  @ApiResponse({
    status: 200,
    description: 'Notification history retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getNotificationHistory(
    @Req() req: any,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user.userId;
    const limitNumber = limit ? parseInt(limit, 10) : 50;

    const history = await this.notificationService.getNotificationHistory(userId, limitNumber);

    return {
      success: true,
      count: history.length,
      notifications: history,
    };
  }
}
