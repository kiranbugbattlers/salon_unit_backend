import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsOptional, IsString, MaxLength } from 'class-validator';

export class AssignApprovalDto {
  @ApiProperty({
    description: 'Agent ID to assign the approval request to',
    example: 'agent-uuid-string',
  })
  @IsNotEmpty()
  @IsUUID(4)
  agentId: string;

  @ApiProperty({
    description: 'Optional reason for reassignment',
    example: 'Agent has better expertise in this business type.',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reassignmentReason?: string;
}