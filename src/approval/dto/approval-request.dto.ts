import { ApiProperty } from '@nestjs/swagger';
import { ApprovalStatus } from '../../common/enums';

export class ApprovalRequestDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  businessOwnerId: string;

  @ApiProperty()
  businessName: string;

  @ApiProperty()
  businessDescription: string;

  @ApiProperty()
  businessAddress: string;

  @ApiProperty()
  businessOwnerName: string;

  @ApiProperty()
  businessOwnerPhone: string;

  @ApiProperty({ required: false })
  businessOwnerEmail?: string;

  @ApiProperty()
  assignedAgentId: string;

  @ApiProperty()
  assignedAgentName: string;

  @ApiProperty({ enum: ApprovalStatus })
  status: ApprovalStatus;

  @ApiProperty({ required: false })
  reviewNotes?: string;

  @ApiProperty({ required: false })
  rejectionReason?: string;

  @ApiProperty()
  isAutoAssigned: boolean;

  @ApiProperty({ required: false })
  distanceToAgentKm?: number;

  @ApiProperty({ required: false })
  assignedByAdminId?: string;

  @ApiProperty({ required: false })
  reviewedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}