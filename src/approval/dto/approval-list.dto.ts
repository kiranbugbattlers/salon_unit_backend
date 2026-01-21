import { ApiProperty } from '@nestjs/swagger';
import { ApprovalRequestDto } from './approval-request.dto';
import { PaginationMetaDto } from '../../common/dto/pagination.dto';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

export class ApprovalListDataDto {
  @ApiProperty({ type: [ApprovalRequestDto] })
  data: ApprovalRequestDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}

export class ApprovalListResponseDto extends ApiResponseDto<ApprovalListDataDto> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Approval requests retrieved successfully' })
  message: string;

  @ApiProperty({ type: ApprovalListDataDto })
  data: ApprovalListDataDto;

  constructor(code: number = 200, success: boolean = true, message: string = 'Approval requests retrieved successfully', data: ApprovalListDataDto) {
    super(code, success, message, data);
  }
}