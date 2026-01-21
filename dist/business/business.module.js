"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const entities_1 = require("../database/entities");
const business_controller_1 = require("./business.controller");
const business_service_1 = require("./business.service");
const distance_calculator_service_1 = require("../common/services/distance-calculator.service");
let BusinessModule = class BusinessModule {
};
exports.BusinessModule = BusinessModule;
exports.BusinessModule = BusinessModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                entities_1.BusinessOwner,
                entities_1.BusinessAddress,
                entities_1.BusinessMedia,
                entities_1.BusinessService,
                entities_1.Service,
                entities_1.ServiceCategory,
                entities_1.Staff,
                entities_1.StaffService,
                entities_1.Booking,
                entities_1.StaffWorkingHours,
                entities_1.BusinessOperatingHours,
                entities_1.ServicePackage,
                entities_1.ServicePackageItem,
                entities_1.Customer,
                entities_1.CustomerFavorite,
                entities_1.Review,
            ]),
        ],
        controllers: [business_controller_1.BusinessController],
        providers: [business_service_1.BusinessService, distance_calculator_service_1.DistanceCalculatorService],
        exports: [business_service_1.BusinessService],
    })
], BusinessModule);
//# sourceMappingURL=business.module.js.map