"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const entities_1 = require("../database/entities");
const idempotency_key_entity_1 = require("../database/entities/idempotency-key.entity");
const commission_payment_entity_1 = require("../database/entities/commission-payment.entity");
const wallet_service_1 = require("./wallet.service");
const commission_service_1 = require("./commission.service");
const settlement_service_1 = require("./settlement.service");
const reward_points_service_1 = require("./reward-points.service");
const wallet_scheduler_1 = require("./wallet.scheduler");
const wallet_monitor_service_1 = require("./wallet-monitor.service");
const idempotency_service_1 = require("./idempotency.service");
const razorpay_payout_service_1 = require("./razorpay-payout.service");
const encryption_service_1 = require("./encryption.service");
const commission_payment_service_1 = require("./commission-payment.service");
const daily_payout_service_1 = require("./daily-payout.service");
const daily_settlement_service_1 = require("./daily-settlement.service");
const admin_commission_controller_1 = require("./controllers/admin-commission.controller");
const business_owner_wallet_controller_1 = require("./controllers/business-owner-wallet.controller");
const customer_wallet_controller_1 = require("./controllers/customer-wallet.controller");
const admin_defaulter_controller_1 = require("./controllers/admin-defaulter.controller");
const razorpay_webhook_controller_1 = require("./controllers/razorpay-webhook.controller");
let WalletModule = class WalletModule {
};
exports.WalletModule = WalletModule;
exports.WalletModule = WalletModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                entities_1.Wallet,
                entities_1.WalletTransaction,
                entities_1.CommissionConfig,
                entities_1.CommissionTransaction,
                entities_1.MonthlySettlement,
                entities_1.SettlementTransaction,
                entities_1.CODTransaction,
                entities_1.CustomerRewardPoints,
                entities_1.Booking,
                entities_1.Payment,
                entities_1.BusinessOwner,
                entities_1.Customer,
                entities_1.BankingInfo,
                idempotency_key_entity_1.IdempotencyKey,
                commission_payment_entity_1.CommissionPayment,
                entities_1.DailySettlement,
                entities_1.BusinessAddress,
            ]),
            config_1.ConfigModule,
        ],
        controllers: [
            admin_commission_controller_1.AdminCommissionController,
            business_owner_wallet_controller_1.BusinessOwnerWalletController,
            customer_wallet_controller_1.CustomerWalletController,
            admin_defaulter_controller_1.AdminDefaulterController,
            razorpay_webhook_controller_1.RazorpayWebhookController,
        ],
        providers: [
            wallet_service_1.WalletService,
            commission_service_1.CommissionService,
            settlement_service_1.SettlementService,
            reward_points_service_1.RewardPointsService,
            wallet_scheduler_1.WalletScheduler,
            wallet_monitor_service_1.WalletMonitorService,
            idempotency_service_1.IdempotencyService,
            razorpay_payout_service_1.RazorpayPayoutService,
            encryption_service_1.EncryptionService,
            commission_payment_service_1.CommissionPaymentService,
            daily_payout_service_1.DailyPayoutService,
            daily_settlement_service_1.DailySettlementService,
        ],
        exports: [
            wallet_service_1.WalletService,
            commission_service_1.CommissionService,
            settlement_service_1.SettlementService,
            reward_points_service_1.RewardPointsService,
            wallet_monitor_service_1.WalletMonitorService,
            idempotency_service_1.IdempotencyService,
            razorpay_payout_service_1.RazorpayPayoutService,
            encryption_service_1.EncryptionService,
            daily_payout_service_1.DailyPayoutService,
            daily_settlement_service_1.DailySettlementService,
        ],
    })
], WalletModule);
//# sourceMappingURL=wallet.module.js.map