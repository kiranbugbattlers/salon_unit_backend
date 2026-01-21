import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from '../database/entities/customer.entity';
import { CustomerOnboarding } from '../database/entities/customer-onboarding.entity';
import { User } from '../database/entities/user.entity';
import { UserAddress } from '../database/entities/user-address.entity';
import { CustomerFavorite } from '../database/entities/customer-favorite.entity';
import { BusinessOwner } from '../database/entities/business-owner.entity';
import { BusinessAddress } from '../database/entities/business-address.entity';
import { BusinessMedia } from '../database/entities/business-media.entity';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { CommonModule } from '../common/common.module';
import { SupportMemberModule } from '../support-member/support-member.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Customer,
      CustomerOnboarding,
      User,
      UserAddress,
      CustomerFavorite,
      BusinessOwner,
      BusinessAddress,
      BusinessMedia,
    ]),
    CommonModule,
    SupportMemberModule,
  ],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}