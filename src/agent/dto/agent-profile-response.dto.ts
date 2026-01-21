import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { AgentProfileDto } from './agent-profile.dto';

export class AgentProfileResponseDto extends ApiResponseDto<AgentProfileDto> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Agent profile retrieved successfully' })
  message: string;

  @ApiProperty({ type: AgentProfileDto })
  data: AgentProfileDto;

  constructor(code: number, success: boolean, message: string, data: AgentProfileDto) {
    super(code, success, message, data);
  }
}
