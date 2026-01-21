import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import {
  Wallet,
  WalletTransaction,
  CommissionConfig,
  CommissionTransaction,
  MonthlySettlement,
  SettlementTransaction,
  CODTransaction,
  CustomerRewardPoints,
  Booking,
  Payment,
  BusinessOwner,
  Customer,
  BankingInfo,
  DailySettlement,
  BusinessAddress,
} from '../database/entities';
import { IdempotencyKey } from '../database/entities/idempotency-key.entity';
import { CommissionPayment } from '../database/entities/commission-payment.entity';
import { WalletService } from './wallet.service';
import { CommissionService } from './commission.service';
import { SettlementService } from './settlement.service';
import { RewardPointsService } from './reward-points.service';
import { WalletScheduler } from './wallet.scheduler';
import { WalletMonitorService } from './wallet-monitor.service';
import { IdempotencyService } from './idempotency.service';
import { RazorpayPayoutService } from './razorpay-payout.service';
import { EncryptionService } from './encryption.service';
import { CommissionPaymentService } from './commission-payment.service';
import { DailyPayoutService } from './daily-payout.service';
import { DailySettlementService } from './daily-settlement.service';
import { AdminCommissionController } from './controllers/admin-commission.controller';
import { BusinessOwnerWalletController } from './controllers/business-owner-wallet.controller';
import { CustomerWalletController } from './controllers/customer-wallet.controller';
import { AdminDefaulterController } from './controllers/admin-defaulter.controller';
import { RazorpayWebhookController } from './controllers/razorpay-webhook.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Wallet,
      WalletTransaction,
      CommissionConfig,
      CommissionTransaction,
      MonthlySettlement,
      SettlementTransaction,
      CODTransaction,
      CustomerRewardPoints,
      Booking,
      Payment,
      BusinessOwner,
      Customer,
      BankingInfo,
      IdempotencyKey,
      CommissionPayment,
      DailySettlement,
      BusinessAddress,
    ]),
    ConfigModule,
  ],
  controllers: [
    AdminCommissionController,
    BusinessOwnerWalletController,
    CustomerWalletController,
    AdminDefaulterController,
    RazorpayWebhookController,
  ],
  providers: [
    WalletService,
    CommissionService,
    SettlementService,
    RewardPointsService,
    WalletScheduler,
    WalletMonitorService,
    IdempotencyService,
    RazorpayPayoutService,
    EncryptionService,
    CommissionPaymentService,
    DailyPayoutService,
    DailySettlementService,
  ],
  exports: [
    WalletService,
    CommissionService,
    SettlementService,
    RewardPointsService,
    WalletMonitorService,
    IdempotencyService,
    RazorpayPayoutService,
    EncryptionService,
    DailyPayoutService,
    DailySettlementService,
  ],
})
export class WalletModule {}
