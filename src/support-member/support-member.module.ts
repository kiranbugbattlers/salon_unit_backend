import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  SupportMember,
  CustomerSupportMapping,
  Admin,
  Customer,
} from '../database/entities';
import { SupportMemberController } from './support-member.controller';
import { SupportMemberService } from './support-member.service';
import { AssignmentService } from './assignment.service';
import { S3Service } from '../common/services/s3.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SupportMember,
      CustomerSupportMapping,
      Admin,
      Customer,
    ]),
  ],
  controllers: [SupportMemberController],
  providers: [SupportMemberService, AssignmentService, S3Service],
  exports: [SupportMemberService, AssignmentService],
})
export class SupportMemberModule {}
