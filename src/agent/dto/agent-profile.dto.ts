import { ApiProperty } from '@nestjs/swagger';

export class AgentCreatorDto {
  @ApiProperty({ description: 'Admin ID who created this agent' })
  id: string;

  @ApiProperty({ description: 'Admin username' })
  username: string;

  @ApiProperty({ description: 'Admin email' })
  email: string;
}

export class AgentProfileDto {
  @ApiProperty({ description: 'Agent ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Agent username' })
  username: string;

  @ApiProperty({ description: 'First name' })
  firstName: string;

  @ApiProperty({ description: 'Last name' })
  lastName: string;

  @ApiProperty({ description: 'Gender' })
  gender: string;

  @ApiProperty({ description: 'Date of birth' })
  dateOfBirth: Date;

  @ApiProperty({ description: 'Employee ID' })
  employeeId: string;

  @ApiProperty({ description: 'Department' })
  department: string;

  @ApiProperty({ description: 'Position' })
  position: string;

  @ApiProperty({ description: 'Hire date' })
  hireDate: Date;

  @ApiProperty({ description: 'Is agent active' })
  isActive: boolean;

  @ApiProperty({ description: 'Last login timestamp' })
  lastLogin: Date;

  @ApiProperty({ description: 'Agent permissions' })
  permissions: Record<string, any>;

  @ApiProperty({ description: 'Latitude', required: false })
  latitude: number;

  @ApiProperty({ description: 'Longitude', required: false })
  longitude: number;

  @ApiProperty({ description: 'Location address', required: false })
  locationAddress: string;

  @ApiProperty({ description: 'Phone number' })
  phone: string;

  @ApiProperty({ description: 'Email' })
  email: string;

  @ApiProperty({ description: 'Profile picture URL', required: false })
  profilePic: string;

  @ApiProperty({ description: 'Profile picture CDN URL', required: false })
  profilePicCdnUrl: string;

  @ApiProperty({ description: 'Profile picture S3 key', required: false })
  profilePicS3Key: string;

  @ApiProperty({ description: 'Is phone verified' })
  isPhoneVerified: boolean;

  @ApiProperty({ description: 'Is email verified' })
  isEmailVerified: boolean;

  @ApiProperty({ description: 'Admin who created this agent', type: AgentCreatorDto })
  createdBy: AgentCreatorDto;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
