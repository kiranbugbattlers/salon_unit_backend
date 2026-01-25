import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingHistoryController } from './booking-history.controller';
import { BookingHistoryService } from './booking-history.service';
import { Booking } from '../database/entities/booking.entity';
import { Payment } from '../database/entities/payment.entity';
import { Customer } from '../database/entities/customer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Booking,
      Payment,
      Customer,
    ]),
  ],
  controllers: [BookingHistoryController],
  providers: [BookingHistoryService],
  exports: [BookingHistoryService],
})
export class BookingHistoryModule {}
