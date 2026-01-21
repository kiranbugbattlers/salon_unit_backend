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
exports.NotificationModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const notification_service_1 = require("./notification.service");
const notification_controller_1 = require("./notification.controller");
const notification_scheduler_service_1 = require("./notification-scheduler.service");
const notification_retry_service_1 = require("./notification-retry.service");
const device_token_entity_1 = require("./entities/device-token.entity");
const notification_log_entity_1 = require("./entities/notification-log.entity");
const scheduled_notification_entity_1 = require("./entities/scheduled-notification.entity");
const entities_1 = require("../database/entities");
let NotificationModule = class NotificationModule {
    constructor(notificationService, retryService) {
        this.notificationService = notificationService;
        this.retryService = retryService;
        this.notificationService.setRetryService(this.retryService);
    }
};
exports.NotificationModule = NotificationModule;
exports.NotificationModule = NotificationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                device_token_entity_1.DeviceToken,
                notification_log_entity_1.NotificationLog,
                scheduled_notification_entity_1.ScheduledNotification,
                entities_1.Booking,
            ]),
        ],
        controllers: [notification_controller_1.NotificationController],
        providers: [
            notification_service_1.NotificationService,
            notification_scheduler_service_1.NotificationSchedulerService,
            notification_retry_service_1.NotificationRetryService,
        ],
        exports: [
            notification_service_1.NotificationService,
            notification_scheduler_service_1.NotificationSchedulerService,
            notification_retry_service_1.NotificationRetryService,
        ],
    }),
    __metadata("design:paramtypes", [notification_service_1.NotificationService,
        notification_retry_service_1.NotificationRetryService])
], NotificationModule);
//# sourceMappingURL=notification.module.js.map