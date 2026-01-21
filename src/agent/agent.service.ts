import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agent, User } from '../database/entities';
import { AgentProfileResponseDto, AgentProfileDto, AgentCreatorDto } from './dto';

@Injectable()
export class AgentService {
  constructor(
    @InjectRepository(Agent)
    private agentRepository: Repository<Agent>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getAgentProfile(agentId: string): Promise<AgentProfileResponseDto> {
    const agent = await this.agentRepository.findOne({
      where: { id: agentId },
      relations: ['user', 'createdByAdmin'],
    });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    const user = agent.user;
    if (!user) {
      throw new NotFoundException('Associated user not found');
    }

    const profileData: AgentProfileDto = {
      id: agent.id,
      userId: agent.userId,
      username: agent.username,
      firstName: agent.firstName,
      lastName: agent.lastName,
      gender: agent.gender,
      dateOfBirth: agent.dateOfBirth,
      employeeId: agent.employeeId,
      department: agent.department,
      position: agent.position,
      hireDate: agent.hireDate,
      isActive: agent.isActive,
      lastLogin: agent.lastLogin,
      permissions: agent.permissions || {},
      latitude: agent.latitude,
      longitude: agent.longitude,
      locationAddress: agent.locationAddress,
      phone: user.phone,
      email: user.email,
      profilePic: user.profilePic,
      profilePicCdnUrl: user.profilePicCdnUrl,
      profilePicS3Key: user.profilePicS3Key,
      isPhoneVerified: user.isPhoneVerified,
      isEmailVerified: user.isEmailVerified,
      createdBy: agent.createdByAdmin ? {
        id: agent.createdByAdmin.id,
        username: agent.createdByAdmin.username,
        email: agent.createdByAdmin.email,
      } : null,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
    };

    return new AgentProfileResponseDto(
      200,
      true,
      'Agent profile retrieved successfully',
      profileData
    );
  }
}
