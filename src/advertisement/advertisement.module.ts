import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Advertisement, Admin } from '../database/entities';
import { AdvertisementController } from './advertisement.controller';
import { AdvertisementService } from './advertisement.service';
import { S3Service } from '../common/services/s3.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Advertisement, Admin]),
  ],
  controllers: [AdvertisementController],
  providers: [AdvertisementService, S3Service],
  exports: [AdvertisementService],
})
export class AdvertisementModule {}
