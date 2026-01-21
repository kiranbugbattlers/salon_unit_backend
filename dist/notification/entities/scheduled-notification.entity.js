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
exports.ScheduledNotification = exports.ReminderType = exports.ScheduledNotificationStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../database/entities/user.entity");
const booking_entity_1 = require("../../database/entities/booking.entity");
const device_token_entity_1 = require("./device-token.entity");
const notification_log_entity_1 = require("./notification-log.entity");
var ScheduledNotificationStatus;
(function (ScheduledNotificationStatus) {
    ScheduledNotificationStatus["PENDING"] = "pending";
    ScheduledNotificationStatus["SENT"] = "sent";
    ScheduledNotificationStatus["CANCELLED"] = "cancelled";
    ScheduledNotificationStatus["FAILED"] = "failed";
})(ScheduledNotificationStatus || (exports.ScheduledNotificationStatus = ScheduledNotificationStatus = {}));
var ReminderType;
(function (ReminderType) {
    ReminderType["REMINDER_24H"] = "24h";
    ReminderType["REMINDER_2H"] = "2h";
})(ReminderType || (exports.ReminderType = ReminderType = {}));
let ScheduledNotification = class ScheduledNotification {
};
exports.ScheduledNotification = ScheduledNotification;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ScheduledNotification.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'booking_id', type: 'uuid' }),
    __metadata("design:type", String)
], ScheduledNotification.prototype, "bookingId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => booking_entity_1.Booking, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'booking_id' }),
    __metadata("design:type", booking_entity_1.Booking)
], ScheduledNotification.prototype, "booking", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'uuid' }),
    __metadata("design:type", String)
], ScheduledNotification.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], ScheduledNotification.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'user_type',
        type: 'enum',
        enum: device_token_entity_1.UserType,
    }),
    __metadata("design:type", String)
], ScheduledNotification.prototype, "userType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'notification_type',
        type: 'enum',
        enum: notification_log_entity_1.NotificationType,
    }),
    __metadata("design:type", String)
], ScheduledNotification.prototype, "notificationType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'reminder_type',
        type: 'enum',
        enum: ReminderType,
    }),
    __metadata("design:type", String)
], ScheduledNotification.prototype, "reminderType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'scheduled_for', type: 'timestamptz' }),
    __metadata("design:type", Date)
], ScheduledNotification.prototype, "scheduledFor", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'enum',
        enum: ScheduledNotificationStatus,
        default: ScheduledNotificationStatus.PENDING,
    }),
    __metadata("design:type", String)
], ScheduledNotification.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sent_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], ScheduledNotification.prototype, "sentAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'attempts', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], ScheduledNotification.prototype, "attempts", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notification_data', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], ScheduledNotification.prototype, "notificationData", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'error_message', type: 'text', nullable: true }),
    __metadata("design:type", String)
], ScheduledNotification.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], ScheduledNotification.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], ScheduledNotification.prototype, "updatedAt", void 0);
exports.ScheduledNotification = ScheduledNotification = __decorate([
    (0, typeorm_1.Entity)('scheduled_notifications'),
    (0, typeorm_1.Index)(['scheduledFor', 'status']),
    (0, typeorm_1.Index)(['bookingId', 'reminderType'])
], ScheduledNotification);
//# sourceMappingURL=scheduled-notification.entity.js.map