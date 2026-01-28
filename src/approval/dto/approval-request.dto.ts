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

  @ApiProperty({ 
    description: 'UPI ID of the business owner',
    required: false
  })
  upiId?: string;

  @ApiProperty({ 
    description: 'Credit limit assigned to the vendor',
    required: false
  })
  creditLimit?: number;

  @ApiProperty({ 
    description: 'Vendor status',
    required: false
  })
  vendorStatus?: string;

  @ApiProperty({ 
    description: 'Alternate contact number for the business owner',
    required: false
  })
  alternateNumber?: string;

  @ApiProperty({ 
    description: 'Additional remarks or notes about the business owner',
    required: false
  })
  remark?: string;
}