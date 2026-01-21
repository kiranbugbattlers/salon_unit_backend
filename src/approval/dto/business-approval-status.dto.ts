import { ApiProperty } from '@nestjs/swagger';
import { ApprovalStatus } from '../../common/enums';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

export class AgentInfo {
  @ApiProperty({
    description: 'Agent ID',
    example: 'agent-uuid-123',
  })
  id: string;

  @ApiProperty({
    description: 'Agent full name',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'Agent email',
    example: 'john.doe@company.com',
    required: false,
  })
  email?: string;

  @ApiProperty({
    description: 'Agent phone number',
    example: '+1234567890',
    required: false,
  })
  phone?: string;
}

export class BusinessApprovalStatusDataDto {
  @ApiProperty({
    description: 'Indicates if the business has an approval request',
    example: true,
  })
  hasApprovalRequested: boolean;

  @ApiProperty({
    description: 'Current approval status',
    enum: ApprovalStatus,
    example: ApprovalStatus.PENDING,
    required: false,
  })
  status?: ApprovalStatus;

  @ApiProperty({
    description: 'Indicates if the business is approved',
    example: false,
  })
  isApproved: boolean;

  @ApiProperty({
    description: 'Information about the assigned agent',
    type: AgentInfo,
    required: false,
  })
  assignedAgent?: AgentInfo;

  @ApiProperty({
    description: 'Rejection reason if business was rejected',
    example: 'Missing required documents',
    required: false,
  })
  rejectionReason?: string;

  @ApiProperty({
    description: 'When the approval request was created',
    example: '2024-01-15T10:30:00Z',
    required: false,
  })
  requestedAt?: Date;

  @ApiProperty({
    description: 'Human-readable status message',
    example: 'Your business registration is being reviewed by our team.',
  })
  statusMessage: string;
}

export class BusinessApprovalStatusDto extends ApiResponseDto<BusinessApprovalStatusDataDto> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Business approval status retrieved successfully' })
  message: string;

  @ApiProperty({ type: BusinessApprovalStatusDataDto })
  data: BusinessApprovalStatusDataDto;

  constructor(code: number = 200, success: boolean = true, message: string = 'Business approval status retrieved successfully', data: BusinessApprovalStatusDataDto) {
    super(code, success, message, data);
  }
}