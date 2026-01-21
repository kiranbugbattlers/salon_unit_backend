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
exports.NotificationLog = exports.NotificationStatus = exports.NotificationType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../database/entities/user.entity");
const device_token_entity_1 = require("./device-token.entity");
var NotificationType;
(function (NotificationType) {
    NotificationType["BOOKING_REQUEST_CREATED"] = "booking_request_created";
    NotificationType["BOOKING_REQUEST_STAFF_ASSIGNED"] = "booking_request_staff_assigned";
    NotificationType["BOOKING_REQUEST_APPROVED"] = "booking_request_approved";
    NotificationType["BOOKING_REQUEST_REJECTED"] = "booking_request_rejected";
    NotificationType["BOOKING_REQUEST_CANCELLED_BY_CUSTOMER"] = "booking_request_cancelled_by_customer";
    NotificationType["SERVICE_OTP_SENT"] = "service_otp_sent";
    NotificationType["SERVICE_STARTED"] = "service_started";
    NotificationType["SERVICE_COMPLETED"] = "service_completed";
    NotificationType["SERVICE_REMINDER"] = "service_reminder";
    NotificationType["ADDON_SERVICE_PENDING_APPROVAL"] = "addon_service_pending_approval";
    NotificationType["ADDON_SERVICE_APPROVED_BY_CUSTOMER"] = "addon_service_approved_by_customer";
    NotificationType["ADDON_SERVICE_REJECTED_BY_CUSTOMER"] = "addon_service_rejected_by_customer";
    NotificationType["ADDON_SERVICE_ADDED_BY_CUSTOMER"] = "addon_service_added_by_customer";
    NotificationType["BOOKING_RESCHEDULED"] = "booking_rescheduled";
    NotificationType["BOOKING_CANCELLED"] = "booking_cancelled";
    NotificationType["BOOKING_UPDATED"] = "booking_updated";
    NotificationType["PAYMENT_COMPLETED"] = "payment_completed";
    NotificationType["PAYMENT_COD_CONFIRMED"] = "payment_cod_confirmed";
    NotificationType["PAYMENT_FAILED"] = "payment_failed";
    NotificationType["PAYMENT_REMINDER"] = "payment_reminder";
    NotificationType["REFUND_PROCESSED"] = "refund_processed";
    NotificationType["DELIVERY_CHARGE_CALCULATED"] = "delivery_charge_calculated";
    NotificationType["BUSINESS_APPROVED"] = "business_approved";
    NotificationType["BUSINESS_REJECTED"] = "business_rejected";
    NotificationType["WALLET_MONEY_RECEIVED"] = "wallet_money_received";
    NotificationType["WALLET_PAYMENT_PENDING"] = "wallet_payment_pending";
    NotificationType["WALLET_NEGATIVE_BALANCE"] = "wallet_negative_balance";
    NotificationType["WALLET_SETTLEMENT_CREDITED"] = "wallet_settlement_credited";
    NotificationType["WALLET_SETTLEMENT_REQUIRES_PAYMENT"] = "wallet_settlement_requires_payment";
    NotificationType["WALLET_WITHDRAWAL_COMPLETED"] = "wallet_withdrawal_completed";
    NotificationType["WALLET_CREDIT_RECEIVED"] = "wallet_credit_received";
    NotificationType["STAFF_ASSIGNED"] = "staff_assigned";
    NotificationType["SCHEDULE_CHANGED"] = "schedule_changed";
    NotificationType["PROMOTIONAL"] = "promotional";
    NotificationType["SYSTEM_UPDATE"] = "system_update";
    NotificationType["CUSTOM"] = "custom";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var NotificationStatus;
(function (NotificationStatus) {
    NotificationStatus["SENT"] = "sent";
    NotificationStatus["DELIVERED"] = "delivered";
    NotificationStatus["FAILED"] = "failed";
    NotificationStatus["PENDING"] = "pending";
})(NotificationStatus || (exports.NotificationStatus = NotificationStatus = {}));
let NotificationLog = class NotificationLog {
};
exports.NotificationLog = NotificationLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], NotificationLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'uuid' }),
    __metadata("design:type", String)
], NotificationLog.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], NotificationLog.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'user_type',
        type: 'enum',
        enum: device_token_entity_1.UserType,
    }),
    __metadata("design:type", String)
], NotificationLog.prototype, "userType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'notification_type',
        type: 'enum',
        enum: NotificationType,
    }),
    __metadata("design:type", String)
], NotificationLog.prototype, "notificationType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'title', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], NotificationLog.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'body', type: 'text' }),
    __metadata("design:type", String)
], NotificationLog.prototype, "body", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'data', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], NotificationLog.prototype, "data", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'enum',
        enum: NotificationStatus,
        default: NotificationStatus.PENDING,
    }),
    __metadata("design:type", String)
], NotificationLog.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fcm_response', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], NotificationLog.prototype, "fcmResponse", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fcm_tokens', type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], NotificationLog.prototype, "fcmTokens", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sent_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], NotificationLog.prototype, "sentAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'retry_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], NotificationLog.prototype, "retryCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_retries', type: 'int', default: 5 }),
    __metadata("design:type", Number)
], NotificationLog.prototype, "maxRetries", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'next_retry_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], NotificationLog.prototype, "nextRetryAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_retry_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], NotificationLog.prototype, "lastRetryAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'retry_error', type: 'text', nullable: true }),
    __metadata("design:type", String)
], NotificationLog.prototype, "retryError", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], NotificationLog.prototype, "createdAt", void 0);
exports.NotificationLog = NotificationLog = __decorate([
    (0, typeorm_1.Entity)('notification_logs'),
    (0, typeorm_1.Index)(['userId', 'createdAt']),
    (0, typeorm_1.Index)(['notificationType', 'createdAt'])
], NotificationLog);
//# sourceMappingURL=notification-log.entity.js.map