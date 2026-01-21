import { ApiProperty } from '@nestjs/swagger';
import { CustomerProfileDto } from './customer-profile.dto';

export class UpdateProfileResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 200,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Success indicator',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Customer profile updated successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Updated customer profile data',
    type: CustomerProfileDto,
  })
  data: CustomerProfileDto;

  constructor(statusCode: number, success: boolean, message: string, data: CustomerProfileDto) {
    this.statusCode = statusCode;
    this.success = success;
    this.message = message;
    this.data = data;
  }
}