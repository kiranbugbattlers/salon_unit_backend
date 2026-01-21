import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BusinessOwnerController } from './business-owner.controller';
import { BusinessOwnerService } from './business-owner.service';
import { ApprovalModule } from '../approval/approval.module';
import { CommonModule } from '../common/common.module';

import { BusinessOwner } from '../database/entities/business-owner.entity';
import { BusinessOwnerOnboarding } from '../database/entities/business-owner-onboarding.entity';
import { BusinessAddress } from '../database/entities/business-address.entity';
import { BusinessMedia } from '../database/entities/business-media.entity';
import { BusinessOperatingHours } from '../database/entities/business-operating-hours.entity';
import { BusinessService } from '../database/entities/business-service.entity';
import { ServicePackage } from '../database/entities/service-package.entity';
import { ServicePackageItem } from '../database/entities/service-package-item.entity';
import { Service } from '../database/entities/service.entity';
import { ServiceCategory } from '../database/entities/service-category.entity';
import { User } from '../database/entities/user.entity';
import { Customer } from '../database/entities/customer.entity';
import { BankingInfo } from '../database/entities/banking-info.entity';
import { BusinessSettings } from '../database/entities/business-settings.entity';
import { Review } from '../database/entities/review.entity';
import { BusinessDocument } from '../database/entities/business-document.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BusinessOwner,
      BusinessOwnerOnboarding,
      BusinessAddress,
      BusinessMedia,
      BusinessOperatingHours,
      BusinessService,
      ServicePackage,
      ServicePackageItem,
      Service,
      ServiceCategory,
      User,
      Customer,
      BankingInfo,
      BusinessSettings,
      Review,
      BusinessDocument,
    ]),
    forwardRef(() => ApprovalModule),
    CommonModule,
  ],
  controllers: [BusinessOwnerController],
  providers: [BusinessOwnerService],
  exports: [BusinessOwnerService],
})
export class BusinessOwnerModule {}