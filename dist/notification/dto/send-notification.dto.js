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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendBulkNotificationDto = exports.SendNotificationDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const notification_log_entity_1 = require("../entities/notification-log.entity");
const device_token_entity_1 = require("../entities/device-token.entity");
class SendNotificationDto {
}
exports.SendNotificationDto = SendNotificationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User ID to send notification to',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SendNotificationDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of user',
        enum: device_token_entity_1.UserType,
        example: device_token_entity_1.UserType.CUSTOMER,
    }),
    (0, class_validator_1.IsEnum)(device_token_entity_1.UserType),
    __metadata("design:type", String)
], SendNotificationDto.prototype, "userType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Notification type',
        enum: notification_log_entity_1.NotificationType,
        example: notification_log_entity_1.NotificationType.BOOKING_REQUEST_APPROVED,
    }),
    (0, class_validator_1.IsEnum)(notification_log_entity_1.NotificationType),
    __metadata("design:type", String)
], SendNotificationDto.prototype, "notificationType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Notification title',
        example: 'Booking Request Approved',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendNotificationDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Notification body/message',
        example: 'Your booking request has been approved! Your OTP is: 123456',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendNotificationDto.prototype, "body", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Additional data payload',
        required: false,
        example: {
            bookingId: '123e4567-e89b-12d3-a456-426614174000',
            action: 'view_booking',
        },
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], SendNotificationDto.prototype, "data", void 0);
class SendBulkNotificationDto {
}
exports.SendBulkNotificationDto = SendBulkNotificationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of user IDs to send notification to',
        example: ['123e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174001'],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], SendBulkNotificationDto.prototype, "userIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of users',
        enum: device_token_entity_1.UserType,
        example: device_token_entity_1.UserType.CUSTOMER,
    }),
    (0, class_validator_1.IsEnum)(device_token_entity_1.UserType),
    __metadata("design:type", String)
], SendBulkNotificationDto.prototype, "userType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Notification type',
        enum: notification_log_entity_1.NotificationType,
        example: notification_log_entity_1.NotificationType.PROMOTIONAL,
    }),
    (0, class_validator_1.IsEnum)(notification_log_entity_1.NotificationType),
    __metadata("design:type", String)
], SendBulkNotificationDto.prototype, "notificationType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Notification title',
        example: 'Special Offer',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendBulkNotificationDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Notification body/message',
        example: 'Get 20% off on your next booking!',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendBulkNotificationDto.prototype, "body", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Additional data payload',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], SendBulkNotificationDto.prototype, "data", void 0);
//# sourceMappingURL=send-notification.dto.js.map