import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import 'reflect-metadata';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';

import appConfig from './config/app.config';
import { DatabaseService } from './config/database.service';
import { SupabaseService } from './config/supabase.service';

import { AuthModule } from './auth/auth.module';
import { CustomerModule } from './customer/customer.module';
import { BusinessOwnerModule } from './business-owner/business-owner.module';
import { BusinessModule } from './business/business.module';
import { BrowseModule } from './browse/browse.module';
import { ServicesModule } from './services/services.module';
import { UserAddressModule } from './user-address/user-address.module';
import { ApprovalModule } from './approval/approval.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { StaffModule } from './staff/staff.module';
import { AdminModule } from './admin/admin.module';
import { AgentModule } from './agent/agent.module';
import { BookingModule } from './booking/booking.module';
import { PaymentModule } from './payment/payment.module';
import { AdvertisementModule } from './advertisement/advertisement.module';
import { SupportMemberModule } from './support-member/support-member.module';
import { WalletModule } from './wallet/wallet.module';
import { NotificationModule } from './notification/notification.module';
import { ReviewModule } from './review/review.module';
import { BookingHistoryModule } from './booking-history/booking-history.module';

import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';

import * as entities from './database/entities';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: ['.env.local', '.env'],
    }),
    ScheduleModule.forRoot(),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
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
          logging: false, // Disabled to keep terminal clean - only API calls will be shown
          ssl: isSupabase ? { rejectUnauthorized: false } : false,
          extra: isSupabase ? {
            ssl: {
              rejectUnauthorized: false,
            },
          } : {},
        };
      },
      inject: [ConfigService],
    }),

    AuthModule,
    CustomerModule,
    BusinessOwnerModule,
    BusinessModule,
    BrowseModule,
    ServicesModule,
    UserAddressModule,
    ApprovalModule,
    SubscriptionModule,
    StaffModule,
    AdminModule,
    AgentModule,
    BookingModule,
    PaymentModule,
    AdvertisementModule,
    SupportMemberModule,
    WalletModule,
    NotificationModule,
    ReviewModule,
    BookingHistoryModule,
 
  ],
  providers: [
    DatabaseService,
    SupabaseService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}