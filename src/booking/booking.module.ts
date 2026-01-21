import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Booking,
  Customer,
  BusinessOwner,
  Staff,
  Service,
  StaffWorkingHours,
  BusinessOperatingHours,
  BookingRequest,
  BookingRequestService,
  BusinessService,
  ServicePackage,
  ServicePackageItem,
  BookingService as BookingServiceEntity,
  BusinessSettings,
} from '../database/entities';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { BookingRequestController } from './booking-request.controller';
import { BookingRequestService as BookingRequestServiceClass } from './booking-request.service';
import { DeliveryChargeService } from './delivery-charge.service';
import { WalletModule } from '../wallet/wallet.module';
import { NotificationModule } from '../notification/notification.module';
import { DistanceCalculatorService } from '../common/services/distance-calculator.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Booking,
      Customer,
      BusinessOwner,
      Staff,
      Service,
      StaffWorkingHours,
      BusinessOperatingHours,
      BookingRequest,
      BookingRequestService,
      BusinessService,
      ServicePackage,
      ServicePackageItem,
      BookingServiceEntity,
      BusinessSettings,
    ]),
    forwardRef(() => WalletModule),
    NotificationModule,
  ],
  controllers: [BookingController, BookingRequestController],
  providers: [
    BookingService,
    BookingRequestServiceClass,
    DeliveryChargeService,
    DistanceCalculatorService,
  ],
  exports: [BookingService, BookingRequestServiceClass, DeliveryChargeService],
})
export class BookingModule {}