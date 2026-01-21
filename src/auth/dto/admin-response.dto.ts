import { ApiProperty } from '@nestjs/swagger';
import { TokensDto } from './auth-response.dto';

export class AdminDto {
  @ApiProperty({ description: 'Admin ID', example: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Admin username', example: 'admin_user' })
  username: string;

  @ApiProperty({ description: 'Admin first name', example: 'Admin', required: false })
  firstName?: string;

  @ApiProperty({ description: 'Admin last name', example: 'User', required: false })
  lastName?: string;

  @ApiProperty({ description: 'Admin email', example: 'admin@salon.com', required: false })
  email?: string;

  @ApiProperty({ description: 'Admin full name', example: 'Admin User' })
  fullName: string;

  @ApiProperty({ description: 'Is admin active', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Last login timestamp', required: false })
  lastLogin?: Date;

  @ApiProperty({ description: 'Admin role', example: 'admin' })
  role: string;
}

export class AdminAuthResponseDto {
  @ApiProperty({ description: 'Admin information', type: AdminDto })
  admin: AdminDto;

  @ApiProperty({ description: 'JWT tokens', type: TokensDto })
  tokens: TokensDto;

  @ApiProperty({ description: 'Whether this is a new admin login', example: false })
  isNewLogin: boolean;
}