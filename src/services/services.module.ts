import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import {
  BusinessService,
  BusinessOwner,
  BusinessAddress,
  Service,
  ServiceCategory,
} from '../database/entities';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BusinessService,
      BusinessOwner,
      BusinessAddress,
      Service,
      ServiceCategory,
    ]),
    CommonModule,
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}