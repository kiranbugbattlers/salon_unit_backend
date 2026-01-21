import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { StaffServiceManagementService } from './services/staff-service-management.service';
import { StaffServiceManagementController } from './controllers/staff-service-management.controller';
import { StaffScheduleManagementService } from './services/staff-schedule-management.service';
import { StaffScheduleManagementController } from './controllers/staff-schedule-management.controller';
import {
  Staff,
  BusinessOwner,
  ServiceCategory,
  Service,
  StaffService as StaffServiceEntity,
  StaffScheduleOverride,
  StaffBreak,
  BookingRequest,
  Booking,
} from '../database/entities';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Staff,
      BusinessOwner,
      ServiceCategory,
      Service,
      StaffServiceEntity,
      StaffScheduleOverride,
      StaffBreak,
      BookingRequest,
      Booking,
    ]),
    CommonModule,
  ],
  controllers: [
    StaffController,
    StaffServiceManagementController,
    StaffScheduleManagementController,
  ],
  providers: [
    StaffService,
    StaffServiceManagementService,
    StaffScheduleManagementService,
  ],
  exports: [
    StaffService,
    StaffServiceManagementService,
    StaffScheduleManagementService,
  ],
})
export class StaffModule {}