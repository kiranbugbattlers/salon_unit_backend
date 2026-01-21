import { PartialType } from '@nestjs/swagger';
import { CreateSupportMemberDto } from './create-support-member.dto';

export class UpdateSupportMemberDto extends PartialType(CreateSupportMemberDto) {}
