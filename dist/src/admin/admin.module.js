"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const entities_1 = require("../database/entities");
const s3_service_1 = require("../common/services/s3.service");
const services_1 = require("./services");
const controllers_1 = require("./controllers");
const wallet_module_1 = require("../wallet/wallet.module");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                entities_1.ServiceCategory,
                entities_1.Service,
                entities_1.Booking,
                entities_1.BookingRequest,
                entities_1.Customer,
                entities_1.BusinessOwner,
                entities_1.Staff,
                entities_1.Payment,
                entities_1.CommissionTransaction,
                entities_1.VendorDuePayment,
                entities_1.Wallet,
                entities_1.WalletTransaction,
                entities_1.BusinessApproval,
            ]),
            wallet_module_1.WalletModule,
        ],
        controllers: [
            controllers_1.ServiceCategoryController,
            controllers_1.ServiceController,
            controllers_1.AdminBookingController,
            controllers_1.AdminBookingAnalyticsController,
            controllers_1.VendorStatusController,
            controllers_1.AdminSettlementController,
            controllers_1.AdminDuePaymentsController,
            controllers_1.AdminVendorController,
            controllers_1.BusinessOwnerTransactionHistoryController,
        ],
        providers: [
            services_1.ServiceCategoryService,
            services_1.ServiceService,
            services_1.AdminBookingService,
            services_1.VendorStatusService,
            services_1.VendorCreditManagementService,
            services_1.BusinessOwnerTransactionHistoryService,
            s3_service_1.S3Service,
        ],
        exports: [
            services_1.ServiceCategoryService,
            services_1.ServiceService,
            services_1.AdminBookingService,
        ],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map