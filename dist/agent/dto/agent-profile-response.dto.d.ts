import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { AgentProfileDto } from './agent-profile.dto';
export declare class AgentProfileResponseDto extends ApiResponseDto<AgentProfileDto> {
    code: number;
    success: boolean;
    message: string;
    data: AgentProfileDto;
    constructor(code: number, success: boolean, message: string, data: AgentProfileDto);
}
