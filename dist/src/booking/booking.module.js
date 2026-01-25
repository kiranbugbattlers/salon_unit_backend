"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const entities_1 = require("../database/entities");
const booking_controller_1 = require("./booking.controller");
const booking_service_1 = require("./booking.service");
const booking_request_controller_1 = require("./booking-request.controller");
const booking_request_service_1 = require("./booking-request.service");
const delivery_charge_service_1 = require("./delivery-charge.service");
const wallet_module_1 = require("../wallet/wallet.module");
const notification_module_1 = require("../notification/notification.module");
const distance_calculator_service_1 = require("../common/services/distance-calculator.service");
let BookingModule = class BookingModule {
};
exports.BookingModule = BookingModule;
exports.BookingModule = BookingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                entities_1.Booking,
                entities_1.Customer,
                entities_1.BusinessOwner,
                entities_1.Staff,
                entities_1.Service,
                entities_1.StaffWorkingHours,
                entities_1.BusinessOperatingHours,
                entities_1.BookingRequest,
                entities_1.BookingRequestService,
                entities_1.BusinessService,
                entities_1.ServicePackage,
                entities_1.ServicePackageItem,
                entities_1.BookingService,
                entities_1.BusinessSettings,
            ]),
            (0, common_1.forwardRef)(() => wallet_module_1.WalletModule),
            notification_module_1.NotificationModule,
        ],
        controllers: [booking_controller_1.BookingController, booking_request_controller_1.BookingRequestController],
        providers: [
            booking_service_1.BookingService,
            booking_request_service_1.BookingRequestService,
            delivery_charge_service_1.DeliveryChargeService,
            distance_calculator_service_1.DistanceCalculatorService,
        ],
        exports: [booking_service_1.BookingService, booking_request_service_1.BookingRequestService, delivery_charge_service_1.DeliveryChargeService],
    })
], BookingModule);
//# sourceMappingURL=booking.module.js.map