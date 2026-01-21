import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprovalController } from './approval.controller';
import { ApprovalService } from './approval.service';
import { DistanceCalculatorService } from '../common/services/distance-calculator.service';
import { NotificationService } from '../common/services/notification.service';
import {
  BusinessApproval,
  BusinessOwner,
  Agent,
  BusinessAddress,
  BusinessMedia,
  BusinessDocument,
  BankingInfo,
  Review,
  User,
  Admin,
} from '../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BusinessApproval,
      BusinessOwner,
      Agent,
      BusinessAddress,
      BusinessMedia,
      BusinessDocument,
      BankingInfo,
      Review,
      User,
      Admin,
    ]),
  ],
  controllers: [ApprovalController],
  providers: [ApprovalService, DistanceCalculatorService, NotificationService],
  exports: [ApprovalService],
})
export class ApprovalModule {}