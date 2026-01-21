import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsUUID, ArrayMinSize } from 'class-validator';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

export class DeleteBusinessServicesDto {
  @ApiProperty({
    description: 'Array of business service IDs to delete permanently',
    example: ['uuid-business-service-1', 'uuid-business-service-2'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one business service ID must be provided' })
  @IsUUID(4, { each: true, message: 'Each business service ID must be a valid UUID' })
  @IsNotEmpty({ each: true, message: 'Business service IDs cannot be empty' })
  businessServiceIds: string[];
}

export class DeletedBusinessServiceDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  reason?: string;
}

export class DeleteBusinessServicesDataDto {
  @ApiProperty({ type: [String] })
  deleted: string[];

  @ApiProperty({ type: [DeletedBusinessServiceDto] })
  failed: DeletedBusinessServiceDto[];

  @ApiProperty()
  total: number;
}

export class DeleteBusinessServicesResponseDto extends ApiResponseDto<DeleteBusinessServicesDataDto> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Business services deleted successfully' })
  message: string;

  @ApiProperty({ type: DeleteBusinessServicesDataDto })
  data: DeleteBusinessServicesDataDto;

  constructor(
    code: number = 200,
    success: boolean = true,
    message: string = 'Business services deleted successfully',
    data: DeleteBusinessServicesDataDto
  ) {
    super(code, success, message, data);
  }
}