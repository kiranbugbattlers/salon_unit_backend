import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BusinessOwner,
  BusinessAddress,
  BusinessMedia,
  BusinessService as BusinessServiceEntity,
  Service,
  ServiceCategory,
  Staff,
  StaffService,
  Booking,
  StaffWorkingHours,
  BusinessOperatingHours,
  ServicePackage,
  ServicePackageItem,
  Customer,
  CustomerFavorite,
  Review,
} from '../database/entities';

import { BusinessController } from './business.controller';
import { BusinessService as BusinessServiceClass } from './business.service';
import { DistanceCalculatorService } from '../common/services/distance-calculator.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BusinessOwner,
      BusinessAddress,
      BusinessMedia,
      BusinessServiceEntity,
      Service,
      ServiceCategory,
      Staff,
      StaffService,
      Booking,
      StaffWorkingHours,
      BusinessOperatingHours,
      ServicePackage,
      ServicePackageItem,
      Customer,
      CustomerFavorite,
      Review,
    ]),
  ],
  controllers: [BusinessController],
  providers: [BusinessServiceClass, DistanceCalculatorService],
  exports: [BusinessServiceClass],
})
export class BusinessModule {}