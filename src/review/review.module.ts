import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from '../database/entities/review.entity';
import { Booking } from '../database/entities/booking.entity';
import { Customer } from '../database/entities/customer.entity';
import { BusinessOwner } from '../database/entities/business-owner.entity';
import { ReviewService } from './review.service';
import { CustomerReviewController } from './customer-review.controller';
import { BusinessOwnerReviewController } from './business-owner-review.controller';
import { AdminReviewController } from './admin-review.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, Booking, Customer, BusinessOwner]),
  ],
  controllers: [
    CustomerReviewController,
    BusinessOwnerReviewController,
    AdminReviewController,
  ],
  providers: [
    ReviewService,
  ],
  exports: [ReviewService],
})
export class ReviewModule {}
