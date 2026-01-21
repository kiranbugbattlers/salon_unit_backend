"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const notification_service_1 = require("./notification.service");
const register_token_dto_1 = require("./dto/register-token.dto");
const send_notification_dto_1 = require("./dto/send-notification.dto");
const notification_response_dto_1 = require("./dto/notification-response.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const user_role_enum_1 = require("../common/enums/user-role.enum");
let NotificationController = class NotificationController {
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    async registerToken(req, registerTokenDto) {
        const userId = req.user.userId;
        const token = await this.notificationService.registerToken(userId, registerTokenDto);
        return {
            success: true,
            message: 'Device token registered successfully',
            tokenId: token.id,
        };
    }
    async unregisterToken(req, fcmToken) {
        const userId = req.user.userId;
        await this.notificationService.unregisterToken(userId, fcmToken);
        return {
            success: true,
            message: 'Device token unregistered successfully',
        };
    }
    async sendNotification(sendNotificationDto) {
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
    async sendBulkNotification(sendBulkNotificationDto) {
        const result = await this.notificationService.sendBulkNotification(sendBulkNotificationDto);
        return {
            success: true,
            message: 'Bulk notification sent',
            successCount: result.successCount,
            failureCount: result.failureCount,
        };
    }
    async getNotificationHistory(req, limit) {
        const userId = req.user.userId;
        const limitNumber = limit ? parseInt(limit, 10) : 50;
        const history = await this.notificationService.getNotificationHistory(userId, limitNumber);
        return {
            success: true,
            count: history.length,
            notifications: history,
        };
    }
};
exports.NotificationController = NotificationController;
__decorate([
    (0, common_1.Post)('register-token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Register FCM device token',
        description: 'Register a device token for receiving push notifications. This should be called when the app launches and gets the FCM token.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Token registered successfully',
        type: notification_response_dto_1.TokenResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, register_token_dto_1.RegisterTokenDto]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "registerToken", null);
__decorate([
    (0, common_1.Delete)('unregister-token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Unregister FCM device token',
        description: 'Unregister a device token when user logs out or uninstalls the app.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Token unregistered successfully',
        type: notification_response_dto_1.TokenResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('fcmToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "unregisterToken", null);
__decorate([
    (0, common_1.Post)('send'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Send notification to a user (Admin only)',
        description: 'Send a push notification to a specific user. This is an admin-only endpoint for testing or manual notifications.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Notification sent successfully',
        type: notification_response_dto_1.NotificationResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_notification_dto_1.SendNotificationDto]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "sendNotification", null);
__decorate([
    (0, common_1.Post)('send-bulk'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Send bulk notification (Admin only)',
        description: 'Send a push notification to multiple users at once. Useful for promotional campaigns or system announcements.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Bulk notification sent',
        type: notification_response_dto_1.NotificationResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_notification_dto_1.SendBulkNotificationDto]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "sendBulkNotification", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Get notification history',
        description: 'Get the notification history for the authenticated user.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Number of notifications to retrieve (default: 50)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Notification history retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getNotificationHistory", null);
exports.NotificationController = NotificationController = __decorate([
    (0, swagger_1.ApiTags)('Notifications'),
    (0, common_1.Controller)('notifications'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    __metadata("design:paramtypes", [notification_service_1.NotificationService])
], NotificationController);
//# sourceMappingURL=notification.controller.js.map