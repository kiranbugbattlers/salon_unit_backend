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
  Wallet,
  WalletTransaction,
  BusinessApproval,
} from '../database/entities';
import { S3Service } from '../common/services/s3.service';
import {
  ServiceCategoryService,
  ServiceService,
  AdminBookingService,
  VendorStatusService,
  VendorCreditManagementService,
  BusinessOwnerTransactionHistoryService,
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
  BusinessOwnerTransactionHistoryController,
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
      Wallet,
      WalletTransaction,
      BusinessApproval,
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
    BusinessOwnerTransactionHistoryController,
  ],
  providers: [
    ServiceCategoryService,
    ServiceService,
    AdminBookingService,
    VendorStatusService,
    VendorCreditManagementService,
    BusinessOwnerTransactionHistoryService,
    S3Service,
  ],
  exports: [
    ServiceCategoryService,
    ServiceService,
    AdminBookingService,
  ],
})
export class AdminModule {}