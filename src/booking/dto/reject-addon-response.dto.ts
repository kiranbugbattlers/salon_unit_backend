import { ApiProperty } from '@nestjs/swagger';

export class RemovedServiceDto {
  @ApiProperty({ description: 'Booking service ID' })
  id: string;

  @ApiProperty({ description: 'Service name' })
  serviceName: string;

  @ApiProperty({ description: 'Service price' })
  servicePrice: number;
}

export class RejectAddonDataDto {
  @ApiProperty({ description: 'Booking ID' })
  bookingId: string;

  @ApiProperty({ description: 'Total booking amount after rejection' })
  totalAmount: number;

  @ApiProperty({ description: 'Total of all approved add-on services' })
  addOnServicesTotal: number;

  @ApiProperty({ description: 'Details of the removed service' })
  removedService: RemovedServiceDto;
}

export class RejectAddonResponseDto {
  @ApiProperty({ description: 'HTTP status code', example: 200 })
  code: number;

  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'Response data' })
  data: RejectAddonDataDto;

  @ApiProperty({ description: 'Error code (optional)', required: false })
  error_code?: string;
}
