import { ApiProperty } from '@nestjs/swagger';

export class StaffServiceCategoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  isActive: boolean;
}

export class StaffBasicServiceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  basePrice: number;

  @ApiProperty()
  baseDurationMinutes: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ type: StaffServiceCategoryResponseDto })
  category: StaffServiceCategoryResponseDto;
}

export class StaffServiceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  staffId: string;

  @ApiProperty()
  serviceId: string;

  @ApiProperty()
  customPrice: number;

  @ApiProperty()
  customDurationMinutes: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: StaffBasicServiceResponseDto })
  service: StaffBasicServiceResponseDto;
}

export class StaffServiceListResponseDto {
  @ApiProperty({ type: [StaffServiceResponseDto] })
  data: StaffServiceResponseDto[];

  @ApiProperty()
  total: number;
}