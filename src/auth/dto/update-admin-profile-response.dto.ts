import { ApiProperty } from '@nestjs/swagger';

export class UpdateAdminProfileResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 200,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Admin profile updated successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Updated admin profile data',
  })
  data: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    fullName: string;
    isActive: boolean;
    lastLogin?: Date;
    role: string;
    roles: string[];
    type: string;
  };

  constructor(statusCode: number, success: boolean, message: string, data: any) {
    this.statusCode = statusCode;
    this.success = success;
    this.message = message;
    this.data = data;
  }
}
