import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ServiceCategory,
  Service,
  Booking,
  BookingRequest,
  Customer,
  BusinessOwner,
  Staff,
  Payment,
  CommissionTransaction,
  VendorDuePayment,
} from '../database/entities';
import { S3Service } from '../common/services/s3.service';
import {
  ServiceCategoryService,
  ServiceService,
  AdminBookingService,
  VendorStatusService,
  VendorCreditManagementService,
} from './services';
import {
  ServiceCategoryController,
  ServiceController,
  AdminBookingController,
  AdminBookingAnalyticsController,
  VendorStatusController,
  AdminSettlementController,
  AdminDuePaymentsController,
  AdminVendorController,
} from './controllers';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ServiceCategory,
      Service,
      Booking,
      BookingRequest,
      Customer,
      BusinessOwner,
      Staff,
      Payment,
      CommissionTransaction,
      VendorDuePayment,
    ]),
    WalletModule,
  ],
  controllers: [
    ServiceCategoryController,
    ServiceController,
    AdminBookingController,
    AdminBookingAnalyticsController,
    VendorStatusController,
    AdminSettlementController,
    AdminDuePaymentsController,
    AdminVendorController,
  ],
  providers: [
    ServiceCategoryService,
    ServiceService,
    AdminBookingService,
    VendorStatusService,
    VendorCreditManagementService,
    S3Service,
  ],
  exports: [
    ServiceCategoryService,
    ServiceService,
    AdminBookingService,
  ],
})
export class AdminModule {}