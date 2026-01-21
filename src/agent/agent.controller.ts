import { Controller, Get, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums';
import { AgentService } from './agent.service';
import { AgentProfileResponseDto } from './dto';

@ApiTags('Agent')
@Controller('agent')
export class AgentController {
  constructor(private agentService: AgentService) {}

  @Get('profile')
  @Roles(UserRole.AGENT)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get agent profile',
    description: 'Retrieves the complete agent profile including personal information, employment details, and associated user information',
  })
  @ApiResponse({
    status: 200,
    description: 'Agent profile retrieved successfully',
    type: AgentProfileResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have agent role',
  })
  @ApiResponse({
    status: 404,
    description: 'Agent not found',
  })
  async getProfile(@Req() req: any): Promise<AgentProfileResponseDto> {
    return this.agentService.getAgentProfile(req.user.agentId);
  }
}
