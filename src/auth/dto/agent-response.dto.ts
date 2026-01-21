import { ApiProperty } from '@nestjs/swagger';
import { TokensDto } from './auth-response.dto';

export class AgentDto {
  @ApiProperty({ description: 'Agent ID', example: 'uuid' })
  id: string;

  @ApiProperty({ description: 'User ID', example: 'uuid' })
  userId: string;

  @ApiProperty({ description: 'Agent username', example: 'agent_user' })
  username: string;

  @ApiProperty({ description: 'Phone number', example: '9876543210' })
  phone: string;

  @ApiProperty({ description: 'Email address', example: 'agent@salon.com', required: false })
  email?: string;

  @ApiProperty({ description: 'First name', example: 'John' })
  firstName: string;

  @ApiProperty({ description: 'Last name', example: 'Doe', required: false })
  lastName?: string;

  @ApiProperty({ description: 'Full name', example: 'John Doe' })
  fullName: string;

  @ApiProperty({ description: 'Gender', example: 'male', required: false })
  gender?: string;

  @ApiProperty({ description: 'Date of birth', example: '1990-01-15', required: false })
  dateOfBirth?: string;

  @ApiProperty({ description: 'Employee ID', example: 'AGT-001', required: false })
  employeeId?: string;

  @ApiProperty({ description: 'Department', example: 'Customer Service', required: false })
  department?: string;

  @ApiProperty({ description: 'Position', example: 'Senior Agent', required: false })
  position?: string;

  @ApiProperty({ description: 'Hire date', example: '2024-01-01', required: false })
  hireDate?: string;

  @ApiProperty({ description: 'Salary', example: 50000.00, required: false })
  salary?: number;

  @ApiProperty({ description: 'Is active', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Last login timestamp', required: false })
  lastLogin?: Date;

  @ApiProperty({
    description: 'Permissions',
    example: { canManageBookings: true, canViewReports: false },
    required: false
  })
  permissions?: Record<string, any>;

  @ApiProperty({ description: 'Notes', example: 'Experienced agent', required: false })
  notes?: string;

  @ApiProperty({ description: 'Created by admin ID', example: 'uuid' })
  createdByAdminId: string;

  @ApiProperty({ description: 'Created by admin username', example: 'admin_user' })
  createdByAdminUsername: string;

  @ApiProperty({ description: 'Creation date', example: '2024-09-07T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Last updated date', example: '2024-09-07T10:30:00Z' })
  updatedAt: Date;
}

export class AgentListResponseDto {
  @ApiProperty({ type: [AgentDto], description: 'List of agents' })
  agents: AgentDto[];

  @ApiProperty({ description: 'Total count', example: 25 })
  total: number;

  @ApiProperty({ description: 'Current page', example: 1 })
  page: number;

  @ApiProperty({ description: 'Items per page', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Total pages', example: 3 })
  totalPages: number;
}

export class AgentCreateResponseDto {
  @ApiProperty({ description: 'Created agent', type: AgentDto })
  agent: AgentDto;

  @ApiProperty({ description: 'Success message', example: 'Agent created successfully' })
  message: string;
}

export class AgentAuthResponseDto {
  @ApiProperty({ description: 'Agent information', type: AgentDto })
  agent: AgentDto;

  @ApiProperty({ description: 'JWT tokens', type: TokensDto })
  tokens: TokensDto;

  @ApiProperty({ description: 'Whether this is a new agent login', example: false })
  isNewLogin: boolean;
}