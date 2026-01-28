import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettlementController } from './settlement.controller';
import { SettlementService } from './settlement.service';
import { BusinessOwner } from '../database/entities/business-owner.entity';
import { BusinessOwnerTransactionHistory } from '../database/entities/business-owner-transaction-history.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BusinessOwner, BusinessOwnerTransactionHistory]),
    AuthModule,
  ],
  controllers: [SettlementController],
  providers: [SettlementService],
  exports: [SettlementService],
})
export class SettlementModule {}
