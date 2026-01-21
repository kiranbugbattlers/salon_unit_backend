import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { S3Service } from './services/s3.service';
import { DistanceCalculatorService } from './services/distance-calculator.service';
import { OtpService } from './services/otp/otp.service';
import { OtpFactoryService } from './services/otp/otp-factory.service';
import { TwilioVerifyOtpService } from './services/otp/providers/twilio-verify-otp.service';
import { OtpToken } from '../database/entities';

@Global()
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([OtpToken]),
  ],
  controllers: [],
  providers: [
    S3Service,
    DistanceCalculatorService,
    OtpService,
    OtpFactoryService,
    TwilioVerifyOtpService,
  ],
  exports: [
    S3Service,
    DistanceCalculatorService,
    OtpService,
    OtpFactoryService,
    TwilioVerifyOtpService,
  ],
})
export class CommonModule {}