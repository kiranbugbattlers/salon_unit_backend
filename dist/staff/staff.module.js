"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const staff_service_1 = require("./staff.service");
const staff_controller_1 = require("./staff.controller");
const staff_service_management_service_1 = require("./services/staff-service-management.service");
const staff_service_management_controller_1 = require("./controllers/staff-service-management.controller");
const staff_schedule_management_service_1 = require("./services/staff-schedule-management.service");
const staff_schedule_management_controller_1 = require("./controllers/staff-schedule-management.controller");
const entities_1 = require("../database/entities");
const common_module_1 = require("../common/common.module");
let StaffModule = class StaffModule {
};
exports.StaffModule = StaffModule;
exports.StaffModule = StaffModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                entities_1.Staff,
                entities_1.BusinessOwner,
                entities_1.ServiceCategory,
                entities_1.Service,
                entities_1.StaffService,
                entities_1.StaffScheduleOverride,
                entities_1.StaffBreak,
                entities_1.BookingRequest,
                entities_1.Booking,
            ]),
            common_module_1.CommonModule,
        ],
        controllers: [
            staff_controller_1.StaffController,
            staff_service_management_controller_1.StaffServiceManagementController,
            staff_schedule_management_controller_1.StaffScheduleManagementController,
        ],
        providers: [
            staff_service_1.StaffService,
            staff_service_management_service_1.StaffServiceManagementService,
            staff_schedule_management_service_1.StaffScheduleManagementService,
        ],
        exports: [
            staff_service_1.StaffService,
            staff_service_management_service_1.StaffServiceManagementService,
            staff_schedule_management_service_1.StaffScheduleManagementService,
        ],
    })
], StaffModule);
//# sourceMappingURL=staff.module.js.map