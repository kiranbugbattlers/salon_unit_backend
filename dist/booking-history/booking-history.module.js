"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingHistoryModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const booking_history_controller_1 = require("./booking-history.controller");
const booking_history_service_1 = require("./booking-history.service");
const booking_entity_1 = require("../database/entities/booking.entity");
const payment_entity_1 = require("../database/entities/payment.entity");
const customer_entity_1 = require("../database/entities/customer.entity");
let BookingHistoryModule = class BookingHistoryModule {
};
exports.BookingHistoryModule = BookingHistoryModule;
exports.BookingHistoryModule = BookingHistoryModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                booking_entity_1.Booking,
                payment_entity_1.Payment,
                customer_entity_1.Customer,
            ]),
        ],
        controllers: [booking_history_controller_1.BookingHistoryController],
        providers: [booking_history_service_1.BookingHistoryService],
        exports: [booking_history_service_1.BookingHistoryService],
    })
], BookingHistoryModule);
//# sourceMappingURL=booking-history.module.js.map