import { ApiProperty } from '@nestjs/swagger';

export class AssignedAgentDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty({ required: false })
  phone?: string;

  @ApiProperty({ required: false })
  employeeId?: string;

  @ApiProperty({ required: false })
  department?: string;

  @ApiProperty({ required: false })
  distanceKm?: number;
}

export class AssignedAdminDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty()
  username: string;
}

export class ApprovalRequestInfoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  businessOwnerId: string;

  @ApiProperty()
  businessName: string;

  @ApiProperty()
  businessAddress: string;

  @ApiProperty()
  businessOwnerName: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  isAutoAssigned: boolean;
}

export class SendApprovalRequestDataDto {
  @ApiProperty({ type: ApprovalRequestInfoDto })
  requestInfo: ApprovalRequestInfoDto;

  @ApiProperty({ type: AssignedAgentDto, required: false })
  assignedAgent?: AssignedAgentDto;

  @ApiProperty({ type: AssignedAdminDto, required: false })
  assignedAdmin?: AssignedAdminDto;

  @ApiProperty({
    enum: ['agent', 'admin'],
    description: 'Type of assignee - agent when assigned to agent, admin when no agents available'
  })
  assignmentType: 'agent' | 'admin';

  @ApiProperty({ required: false })
  fallbackReason?: string;
}

export class SendApprovalRequestResponseDto {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Step completed successfully' })
  message: string;

  @ApiProperty({ type: SendApprovalRequestDataDto })
  data: SendApprovalRequestDataDto;
}