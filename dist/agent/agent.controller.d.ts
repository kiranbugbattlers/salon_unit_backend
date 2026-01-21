import { AgentService } from './agent.service';
import { AgentProfileResponseDto } from './dto';
export declare class AgentController {
    private agentService;
    constructor(agentService: AgentService);
    getProfile(req: any): Promise<AgentProfileResponseDto>;
}
