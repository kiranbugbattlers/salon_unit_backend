import { Repository } from 'typeorm';
import { Agent, User } from '../database/entities';
import { AgentProfileResponseDto } from './dto';
export declare class AgentService {
    private agentRepository;
    private userRepository;
    constructor(agentRepository: Repository<Agent>, userRepository: Repository<User>);
    getAgentProfile(agentId: string): Promise<AgentProfileResponseDto>;
}
