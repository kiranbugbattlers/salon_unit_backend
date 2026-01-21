import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { User } from '../database/entities/user.entity';
import { UserRole } from '../database/entities/user-role.entity';
import { Customer } from '../database/entities/customer.entity';
import { CustomerOnboarding } from '../database/entities/customer-onboarding.entity';
import { BusinessOwner } from '../database/entities/business-owner.entity';
import { BusinessOwnerOnboarding } from '../database/entities/business-owner-onboarding.entity';
import { RefreshToken } from '../database/entities/refresh-token.entity';
import { OtpToken } from '../database/entities/otp-token.entity';
import { Admin } from '../database/entities/admin.entity';
import { Agent } from '../database/entities/agent.entity';
import { Wallet } from '../database/entities/wallet.entity';
import { WalletTransaction } from '../database/entities/wallet-transaction.entity';
import { CustomerRewardPoints } from '../database/entities/customer-reward-points.entity';
import { CustomerFavorite } from '../database/entities/customer-favorite.entity';
import { Booking } from '../database/entities/booking.entity';
import { BookingService } from '../database/entities/booking-service.entity';
import { BookingRequest } from '../database/entities/booking-request.entity';
import { BookingRequestService } from '../database/entities/booking-request-service.entity';
import { Payment } from '../database/entities/payment.entity';
import { CommissionTransaction } from '../database/entities/commission-transaction.entity';
import { UserAddress } from '../database/entities/user-address.entity';
import { Staff } from '../database/entities/staff.entity';
import { StaffService } from '../database/entities/staff-service.entity';
import { StaffScheduleOverride } from '../database/entities/staff-schedule-override.entity';
import { StaffBreak } from '../database/entities/staff-break.entity';
import { StaffWorkingHours } from '../database/entities/staff-working-hours.entity';
import { BusinessService } from '../database/entities/business-service.entity';
import { ServicePackage } from '../database/entities/service-package.entity';
import { ServicePackageItem } from '../database/entities/service-package-item.entity';
import { MonthlySettlement } from '../database/entities/monthly-settlement.entity';
import { SettlementTransaction } from '../database/entities/settlement-transaction.entity';
import { CommissionPayment } from '../database/entities/commission-payment.entity';
import { CODTransaction } from '../database/entities/cod-transaction.entity';
import { BankingInfo } from '../database/entities/banking-info.entity';
import { BusinessMedia } from '../database/entities/business-media.entity';
import { BusinessOperatingHours } from '../database/entities/business-operating-hours.entity';
import { BusinessSettings } from '../database/entities/business-settings.entity';
import { BusinessSubscription } from '../database/entities/business-subscription.entity';
import { BusinessAddress } from '../database/entities/business-address.entity';
import { BusinessApproval } from '../database/entities/business-approval.entity';
import { AdminGuard } from '../common/guards/admin.guard';

import { OtpService } from '../common/services/otp/otp.service';
import { OtpFactoryService } from '../common/services/otp/otp-factory.service';
import { TwilioOtpService } from '../common/services/otp/twilio-otp.service';
import { ConsoleOtpService } from '../common/services/otp/console-otp.service';
import { TwilioVerifyOtpService } from '../common/services/otp/providers/twilio-verify-otp.service';

import { JwtStrategy } from '../common/strategies/jwt.strategy';
import { NotificationModule } from '../notification/notification.module';
import { S3Service } from '../common/services/s3.service';

@Module({
  imports: [
    NotificationModule,
    TypeOrmModule.forFeature([
      User,
      UserRole,
      Customer,
      CustomerOnboarding,
      BusinessOwner,
      BusinessOwnerOnboarding,
      RefreshToken,
      OtpToken,
      Admin,
      Agent,
      Wallet,
      WalletTransaction,
      CustomerRewardPoints,
      CustomerFavorite,
      Booking,
      BookingService,
      BookingRequest,
      BookingRequestService,
      Payment,
      CommissionTransaction,
      UserAddress,
      Staff,
      StaffService,
      StaffScheduleOverride,
      StaffBreak,
      StaffWorkingHours,
      BusinessService,
      ServicePackage,
      ServicePackageItem,
      MonthlySettlement,
      SettlementTransaction,
      CommissionPayment,
      CODTransaction,
      BankingInfo,
      BusinessMedia,
      BusinessOperatingHours,
      BusinessSettings,
      BusinessSubscription,
      BusinessAddress,
      BusinessApproval,
    ]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('app.jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('app.jwt.accessTokenExpiry') as StringValue,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    OtpService,
    OtpFactoryService,
    JwtStrategy,
    TwilioOtpService,
    ConsoleOtpService,
    TwilioVerifyOtpService,
    AdminGuard,
    S3Service,
  ],
  exports: [AuthService],
})
export class AuthModule {}