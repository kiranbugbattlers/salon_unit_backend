"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
require("reflect-metadata");
const typeorm_1 = require("@nestjs/typeorm");
const core_1 = require("@nestjs/core");
const app_config_1 = __importDefault(require("./config/app.config"));
const database_service_1 = require("./config/database.service");
const supabase_service_1 = require("./config/supabase.service");
const auth_module_1 = require("./auth/auth.module");
const customer_module_1 = require("./customer/customer.module");
const business_owner_module_1 = require("./business-owner/business-owner.module");
const business_module_1 = require("./business/business.module");
const browse_module_1 = require("./browse/browse.module");
const services_module_1 = require("./services/services.module");
const user_address_module_1 = require("./user-address/user-address.module");
const approval_module_1 = require("./approval/approval.module");
const subscription_module_1 = require("./subscription/subscription.module");
const staff_module_1 = require("./staff/staff.module");
const admin_module_1 = require("./admin/admin.module");
const agent_module_1 = require("./agent/agent.module");
const booking_module_1 = require("./booking/booking.module");
const payment_module_1 = require("./payment/payment.module");
const advertisement_module_1 = require("./advertisement/advertisement.module");
const support_member_module_1 = require("./support-member/support-member.module");
const wallet_module_1 = require("./wallet/wallet.module");
const notification_module_1 = require("./notification/notification.module");
const review_module_1 = require("./review/review.module");
const booking_history_module_1 = require("./booking-history/booking-history.module");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const roles_guard_1 = require("./common/guards/roles.guard");
const request_logger_middleware_1 = require("./common/middleware/request-logger.middleware");
const entities = __importStar(require("./database/entities"));
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(request_logger_middleware_1.RequestLoggerMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [app_config_1.default],
                envFilePath: ['.env.local', '.env'],
            }),
            schedule_1.ScheduleModule.forRoot(),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => {
                    const dbMode = configService.get('app.dbMode');
                    const isSupabase = dbMode === 'supabase';
                    const dbConfig = isSupabase
                        ? configService.get('app.supabase.database')
                        : configService.get('app.database');
                    return {
                        type: 'postgres',
                        host: dbConfig.host,
                        port: dbConfig.port,
                        username: dbConfig.username,
                        password: dbConfig.password,
                        database: dbConfig.database,
                        entities: [
                            entities.User,
                            entities.UserRole,
                            entities.Customer,
                            entities.CustomerMedia,
                            entities.CustomerFavorite,
                            entities.UserAddress,
                            entities.CustomerOnboarding,
                            entities.BusinessOwner,
                            entities.BusinessOwnerOnboarding,
                            entities.BusinessAddress,
                            entities.BusinessMedia,
                            entities.BusinessOperatingHours,
                            entities.BusinessService,
                            entities.ServicePackage,
                            entities.ServicePackageItem,
                            entities.RefreshToken,
                            entities.OtpToken,
                            entities.Admin,
                            entities.Agent,
                            entities.BusinessApproval,
                            entities.SubscriptionPlan,
                            entities.BusinessSubscription,
                            entities.SubscriptionTransaction,
                            entities.Staff,
                            entities.ServiceCategory,
                            entities.Service,
                            entities.StaffService,
                            entities.StaffScheduleOverride,
                            entities.StaffBreak,
                            entities.StaffWorkingHours,
                            entities.Booking,
                            entities.BookingRequest,
                            entities.BookingRequestService,
                            entities.BookingService,
                            entities.Review,
                            entities.BusinessSettings,
                            entities.Payment,
                            entities.Advertisement,
                            entities.SupportMember,
                            entities.CustomerSupportMapping,
                            entities.Wallet,
                            entities.WalletTransaction,
                            entities.CommissionConfig,
                            entities.CommissionTransaction,
                            entities.MonthlySettlement,
                            entities.SettlementTransaction,
                            entities.CODTransaction,
                            entities.CustomerRewardPoints,
                            entities.BankingInfo,
                            entities.IdempotencyKey,
                            entities.AdminActionAudit,
                            entities.CommissionPayment,
                            entities.DailySettlement,
                            entities.VendorDuePayment,
                            entities.BusinessOwnerTransactionHistory,
                            entities.UserBookingHistory,
                            entities.VendorPaymentSummary,
                            entities.BusinessDocument,
                            entities.DeviceToken,
                            entities.NotificationLog,
                            entities.ScheduledNotification,
                        ],
                        synchronize: false,
                        logging: false,
                        ssl: isSupabase ? { rejectUnauthorized: false } : false,
                        extra: isSupabase ? {
                            ssl: {
                                rejectUnauthorized: false,
                            },
                        } : {},
                    };
                },
                inject: [config_1.ConfigService],
            }),
            auth_module_1.AuthModule,
            customer_module_1.CustomerModule,
            business_owner_module_1.BusinessOwnerModule,
            business_module_1.BusinessModule,
            browse_module_1.BrowseModule,
            services_module_1.ServicesModule,
            user_address_module_1.UserAddressModule,
            approval_module_1.ApprovalModule,
            subscription_module_1.SubscriptionModule,
            staff_module_1.StaffModule,
            admin_module_1.AdminModule,
            agent_module_1.AgentModule,
            booking_module_1.BookingModule,
            payment_module_1.PaymentModule,
            advertisement_module_1.AdvertisementModule,
            support_member_module_1.SupportMemberModule,
            wallet_module_1.WalletModule,
            notification_module_1.NotificationModule,
            review_module_1.ReviewModule,
            booking_history_module_1.BookingHistoryModule,
        ],
        providers: [
            database_service_1.DatabaseService,
            supabase_service_1.SupabaseService,
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: roles_guard_1.RolesGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map