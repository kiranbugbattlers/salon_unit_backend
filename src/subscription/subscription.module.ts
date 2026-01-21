import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import {
  SubscriptionPlan,
  BusinessSubscription,
  SubscriptionTransaction,
  BusinessOwner,
} from '../database/entities';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SubscriptionPlan,
      BusinessSubscription,
      SubscriptionTransaction,
      BusinessOwner,
    ]),
    ConfigModule,
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}