"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const approval_controller_1 = require("./approval.controller");
const approval_service_1 = require("./approval.service");
const distance_calculator_service_1 = require("../common/services/distance-calculator.service");
const notification_service_1 = require("../common/services/notification.service");
const entities_1 = require("../database/entities");
let ApprovalModule = class ApprovalModule {
};
exports.ApprovalModule = ApprovalModule;
exports.ApprovalModule = ApprovalModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                entities_1.BusinessApproval,
                entities_1.BusinessOwner,
                entities_1.Agent,
                entities_1.BusinessAddress,
                entities_1.BusinessMedia,
                entities_1.BusinessDocument,
                entities_1.BankingInfo,
                entities_1.Review,
                entities_1.User,
                entities_1.Admin,
            ]),
        ],
        controllers: [approval_controller_1.ApprovalController],
        providers: [approval_service_1.ApprovalService, distance_calculator_service_1.DistanceCalculatorService, notification_service_1.NotificationService],
        exports: [approval_service_1.ApprovalService],
    })
], ApprovalModule);
//# sourceMappingURL=approval.module.js.map