"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const config_1 = require("@nestjs/config");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const user_entity_1 = require("../database/entities/user.entity");
const user_role_entity_1 = require("../database/entities/user-role.entity");
const customer_entity_1 = require("../database/entities/customer.entity");
const customer_onboarding_entity_1 = require("../database/entities/customer-onboarding.entity");
const business_owner_entity_1 = require("../database/entities/business-owner.entity");
const business_owner_onboarding_entity_1 = require("../database/entities/business-owner-onboarding.entity");
const refresh_token_entity_1 = require("../database/entities/refresh-token.entity");
const otp_token_entity_1 = require("../database/entities/otp-token.entity");
const admin_entity_1 = require("../database/entities/admin.entity");
const agent_entity_1 = require("../database/entities/agent.entity");
const wallet_entity_1 = require("../database/entities/wallet.entity");
const wallet_transaction_entity_1 = require("../database/entities/wallet-transaction.entity");
const customer_reward_points_entity_1 = require("../database/entities/customer-reward-points.entity");
const customer_favorite_entity_1 = require("../database/entities/customer-favorite.entity");
const booking_entity_1 = require("../database/entities/booking.entity");
const booking_service_entity_1 = require("../database/entities/booking-service.entity");
const booking_request_entity_1 = require("../database/entities/booking-request.entity");
const booking_request_service_entity_1 = require("../database/entities/booking-request-service.entity");
const payment_entity_1 = require("../database/entities/payment.entity");
const commission_transaction_entity_1 = require("../database/entities/commission-transaction.entity");
const user_address_entity_1 = require("../database/entities/user-address.entity");
const staff_entity_1 = require("../database/entities/staff.entity");
const staff_service_entity_1 = require("../database/entities/staff-service.entity");
const staff_schedule_override_entity_1 = require("../database/entities/staff-schedule-override.entity");
const staff_break_entity_1 = require("../database/entities/staff-break.entity");
const staff_working_hours_entity_1 = require("../database/entities/staff-working-hours.entity");
const business_service_entity_1 = require("../database/entities/business-service.entity");
const service_package_entity_1 = require("../database/entities/service-package.entity");
const service_package_item_entity_1 = require("../database/entities/service-package-item.entity");
const monthly_settlement_entity_1 = require("../database/entities/monthly-settlement.entity");
const settlement_transaction_entity_1 = require("../database/entities/settlement-transaction.entity");
const commission_payment_entity_1 = require("../database/entities/commission-payment.entity");
const cod_transaction_entity_1 = require("../database/entities/cod-transaction.entity");
const banking_info_entity_1 = require("../database/entities/banking-info.entity");
const business_media_entity_1 = require("../database/entities/business-media.entity");
const business_operating_hours_entity_1 = require("../database/entities/business-operating-hours.entity");
const business_settings_entity_1 = require("../database/entities/business-settings.entity");
const business_subscription_entity_1 = require("../database/entities/business-subscription.entity");
const business_address_entity_1 = require("../database/entities/business-address.entity");
const business_approval_entity_1 = require("../database/entities/business-approval.entity");
const admin_guard_1 = require("../common/guards/admin.guard");
const otp_service_1 = require("../common/services/otp/otp.service");
const otp_factory_service_1 = require("../common/services/otp/otp-factory.service");
const twilio_otp_service_1 = require("../common/services/otp/twilio-otp.service");
const console_otp_service_1 = require("../common/services/otp/console-otp.service");
const twilio_verify_otp_service_1 = require("../common/services/otp/providers/twilio-verify-otp.service");
const jwt_strategy_1 = require("../common/strategies/jwt.strategy");
const notification_module_1 = require("../notification/notification.module");
const s3_service_1 = require("../common/services/s3.service");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            notification_module_1.NotificationModule,
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.User,
                user_role_entity_1.UserRole,
                customer_entity_1.Customer,
                customer_onboarding_entity_1.CustomerOnboarding,
                business_owner_entity_1.BusinessOwner,
                business_owner_onboarding_entity_1.BusinessOwnerOnboarding,
                refresh_token_entity_1.RefreshToken,
                otp_token_entity_1.OtpToken,
                admin_entity_1.Admin,
                agent_entity_1.Agent,
                wallet_entity_1.Wallet,
                wallet_transaction_entity_1.WalletTransaction,
                customer_reward_points_entity_1.CustomerRewardPoints,
                customer_favorite_entity_1.CustomerFavorite,
                booking_entity_1.Booking,
                booking_service_entity_1.BookingService,
                booking_request_entity_1.BookingRequest,
                booking_request_service_entity_1.BookingRequestService,
                payment_entity_1.Payment,
                commission_transaction_entity_1.CommissionTransaction,
                user_address_entity_1.UserAddress,
                staff_entity_1.Staff,
                staff_service_entity_1.StaffService,
                staff_schedule_override_entity_1.StaffScheduleOverride,
                staff_break_entity_1.StaffBreak,
                staff_working_hours_entity_1.StaffWorkingHours,
                business_service_entity_1.BusinessService,
                service_package_entity_1.ServicePackage,
                service_package_item_entity_1.ServicePackageItem,
                monthly_settlement_entity_1.MonthlySettlement,
                settlement_transaction_entity_1.SettlementTransaction,
                commission_payment_entity_1.CommissionPayment,
                cod_transaction_entity_1.CODTransaction,
                banking_info_entity_1.BankingInfo,
                business_media_entity_1.BusinessMedia,
                business_operating_hours_entity_1.BusinessOperatingHours,
                business_settings_entity_1.BusinessSettings,
                business_subscription_entity_1.BusinessSubscription,
                business_address_entity_1.BusinessAddress,
                business_approval_entity_1.BusinessApproval,
            ]),
            passport_1.PassportModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    secret: configService.get('app.jwt.secret'),
                    signOptions: {
                        expiresIn: configService.get('app.jwt.accessTokenExpiry'),
                    },
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [
            auth_service_1.AuthService,
            otp_service_1.OtpService,
            otp_factory_service_1.OtpFactoryService,
            jwt_strategy_1.JwtStrategy,
            twilio_otp_service_1.TwilioOtpService,
            console_otp_service_1.ConsoleOtpService,
            twilio_verify_otp_service_1.TwilioVerifyOtpService,
            admin_guard_1.AdminGuard,
            s3_service_1.S3Service,
        ],
        exports: [auth_service_1.AuthService],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map