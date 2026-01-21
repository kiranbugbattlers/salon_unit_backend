import { ApiProperty } from '@nestjs/swagger';

export class ApprovedServiceDto {
  @ApiProperty({ description: 'Booking service ID' })
  id: string;

  @ApiProperty({ description: 'Service name' })
  serviceName: string;

  @ApiProperty({ description: 'Service price' })
  servicePrice: number;

  @ApiProperty({ description: 'Customer approved status', example: true })
  customerApproved: boolean;

  @ApiProperty({ description: 'Timestamp when approved' })
  approvedAt: Date;
}

export class ApproveAddonDataDto {
  @ApiProperty({ description: 'Booking ID' })
  bookingId: string;

  @ApiProperty({ description: 'Total booking amount including approved add-ons' })
  totalAmount: number;

  @ApiProperty({ description: 'Total of all approved add-on services' })
  addOnServicesTotal: number;

  @ApiProperty({ description: 'Details of the approved service' })
  approvedService: ApprovedServiceDto;
}

export class ApproveAddonResponseDto {
  @ApiProperty({ description: 'HTTP status code', example: 200 })
  code: number;

  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'Response data' })
  data: ApproveAddonDataDto;

  @ApiProperty({ description: 'Error code (optional)', required: false })
  error_code?: string;
}
