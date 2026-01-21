import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BrowseController } from './browse.controller';
import { BrowseService } from './browse.service';

import { BusinessOwner } from '../database/entities/business-owner.entity';
import { ServicePackage } from '../database/entities/service-package.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BusinessOwner,
      ServicePackage,
    ]),
  ],
  controllers: [BrowseController],
  providers: [BrowseService],
  exports: [BrowseService],
})
export class BrowseModule {}