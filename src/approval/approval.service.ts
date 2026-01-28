import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BusinessApproval,
  BusinessOwner,
  Agent,
  BusinessAddress,
  BusinessMedia,
  BusinessDocument,
  BankingInfo,
  Review,
  User,
  Admin,
  Customer,
} from '../database/entities';
import { ApprovalStatus } from '../common/enums';
import { VendorStatus } from '../common/enums/vendor-status.enum';
import {
  ApprovalRequestDto,
  ApproveBusinessDto,
  RejectBusinessDto,
  AssignApprovalDto,
  ApprovalListResponseDto,
  BusinessApprovalStatusDto,
  BusinessApprovalStatusDataDto,
  SendApprovalRequestResponseDto,
  SendApprovalRequestDataDto,
  AssignedAgentDto,
  AssignedAdminDto,
  ApprovalRequestInfoDto,
} from './dto';
import { DistanceCalculatorService, AgentWithDistance, Coordinates } from '../common/services/distance-calculator.service';
import { NotificationService } from '../common/services/notification.service';
import { PaginationMetaDto } from '../common/dto/pagination.dto';
import { ApiResponseDto } from '../common/dto/api-response.dto';

@Injectable()
export class ApprovalService {
  constructor(
    @InjectRepository(BusinessApproval)
    private approvalRepository: Repository<BusinessApproval>,
    @InjectRepository(BusinessOwner)
    private businessOwnerRepository: Repository<BusinessOwner>,
    @InjectRepository(Agent)
    private agentRepository: Repository<Agent>,
    @InjectRepository(BusinessAddress)
    private addressRepository: Repository<BusinessAddress>,
    @InjectRepository(BusinessMedia)
    private mediaRepository: Repository<BusinessMedia>,
    @InjectRepository(BusinessDocument)
    private documentRepository: Repository<BusinessDocument>,
    @InjectRepository(BankingInfo)
    private bankingInfoRepository: Repository<BankingInfo>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    private distanceCalculatorService: DistanceCalculatorService,
    private notificationService: NotificationService,
  ) {}

  /**
   * Create approval request after business onboarding completion
   * Automatically assigns to nearest available agent
   */
  async createApprovalRequest(businessOwnerId: string): Promise<BusinessApproval> {
    // Check if approval request already exists
    const existingApproval = await this.approvalRepository.findOne({
      where: { businessOwnerId, status: ApprovalStatus.PENDING },
    });

    if (existingApproval) {
      throw new ConflictException('Approval request already exists for this business');
    }

    // Get business address for location-based assignment
    const businessAddress = await this.addressRepository.findOne({
      where: { businessOwnerId, isPrimary: true, isActive: true },
    });

    if (!businessAddress) {
      throw new BadRequestException('Business address not found. Cannot assign agent.');
    }

    // Find and assign nearest agent
    const nearestAgent = await this.findNearestAvailableAgent({
      latitude: Number(businessAddress.latitude),
      longitude: Number(businessAddress.longitude),
    });

    if (!nearestAgent.agent) {
      throw new BadRequestException('No available agents found. Please contact admin.');
    }

    // Create approval request
    const approval = this.approvalRepository.create({
      businessOwnerId,
      assignedAgentId: nearestAgent.agent.id,
      status: ApprovalStatus.PENDING,
      isAutoAssigned: true,
      distanceToAgentKm: nearestAgent.distance,
    });

    const savedApproval = await this.approvalRepository.save(approval);

    // Send notification to assigned agent
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { id: businessOwnerId },
      select: ['businessName'],
    });

    if (businessOwner?.businessName) {
      await this.notificationService.notifyAgentOfNewApproval(
        nearestAgent.agent.userId,
        businessOwner.businessName,
        savedApproval.id,
      );
    }

    return savedApproval;
  }

  /**
   * Send approval request to nearest agent with detailed response
   * Returns agent info if available, admin info if no agents available
   */
  async sendApprovalRequestWithResponse(businessOwnerId: string): Promise<SendApprovalRequestResponseDto> {
    // Check if approval request already exists
    const existingApproval = await this.approvalRepository.findOne({
      where: { businessOwnerId, status: ApprovalStatus.PENDING },
    });

    if (existingApproval) {
      throw new ConflictException('Approval request already exists for this business');
    }

    // Get business owner and address information
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { id: businessOwnerId },
      relations: ['user'],
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    const businessAddress = await this.addressRepository.findOne({
      where: { businessOwnerId, isPrimary: true, isActive: true },
    });

    if (!businessAddress) {
      throw new BadRequestException('Business address not found. Cannot assign agent.');
    }

    // Find nearest agent
    const nearestAgent = await this.findNearestAvailableAgent({
      latitude: Number(businessAddress.latitude),
      longitude: Number(businessAddress.longitude),
    });

    // If no agent available, throw an error
    if (!nearestAgent.agent) {
      throw new BadRequestException('No available agents found. Please contact admin or try again later.');
    }

    // Create approval request assigned to agent
    const approval = this.approvalRepository.create({
      businessOwnerId,
      assignedAgentId: nearestAgent.agent.id,
      status: ApprovalStatus.PENDING,
      isAutoAssigned: true,
      distanceToAgentKm: nearestAgent.distance,
    });

    const savedApproval = await this.approvalRepository.save(approval);

    // Prepare agent info
    const assignedAgent: AssignedAgentDto = {
      id: nearestAgent.agent.id,
      name: nearestAgent.agent.fullName,
      email: nearestAgent.agent.user?.email,
      phone: nearestAgent.agent.user?.phone,
      employeeId: nearestAgent.agent.employeeId,
      department: nearestAgent.agent.department,
      distanceKm: nearestAgent.distance,
    };

    // Send notification to agent
    if (businessOwner?.businessName) {
      try {
        await this.notificationService.notifyAgentOfNewApproval(
          nearestAgent.agent.userId,
          businessOwner.businessName,
          savedApproval.id,
        );
      } catch (error) {
        console.error('Failed to send notification to agent:', error.message);
      }
    }

    // Prepare request info
    const requestInfo: ApprovalRequestInfoDto = {
      id: savedApproval.id,
      businessOwnerId: businessOwner.id,
      businessName: businessOwner.businessName || 'N/A',
      businessAddress: `${businessAddress.streetAddress}, ${businessAddress.city}, ${businessAddress.state}`,
      businessOwnerName: `${businessOwner.firstName || ''} ${businessOwner.lastName || ''}`.trim() || 'N/A',
      status: savedApproval.status,
      createdAt: savedApproval.createdAt,
      isAutoAssigned: savedApproval.isAutoAssigned,
    };

    // Prepare response data
    const responseData: SendApprovalRequestDataDto = {
      requestInfo,
      assignmentType: 'agent',
      assignedAgent,
    };

    return {
      code: 200,
      success: true,
      message: 'Step completed successfully',
      data: responseData,
    };
  }

  /**
   * Get approval requests for an agent
   */
  async getAgentApprovalRequests(
    agentId: string,
    page: number = 1,
    limit: number = 10,
    status?: ApprovalStatus
  ): Promise<ApprovalListResponseDto> {
    const query = this.approvalRepository
      .createQueryBuilder('approval')
      .leftJoinAndSelect('approval.businessOwner', 'business_owner')
      .leftJoinAndSelect('business_owner.user', 'user')
      .leftJoinAndSelect('business_owner.addresses', 'address', 'address.isPrimary = true')
      .leftJoinAndSelect('approval.assignedAgent', 'agent')
      .leftJoinAndSelect('agent.user', 'agentUser')
      .where('approval.assignedAgentId = :agentId', { agentId });

    if (status) {
      query.andWhere('approval.status = :status', { status });
    }

    const [approvals, totalItems] = await query
      .orderBy('approval.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const mappedData = approvals.map(this.mapToApprovalRequestDto);
    const listData = {
      data: mappedData,
      meta: this.createPaginationMeta(page, limit, totalItems),
    };

    return new ApprovalListResponseDto(200, true, 'Agent approval requests retrieved successfully', listData);
  }

  /**
   * Get all approval requests (admin only)
   */
  async getAllApprovalRequests(
    page: number = 1,
    limit: number = 10,
    status?: ApprovalStatus,
    agentId?: string
  ): Promise<ApprovalListResponseDto> {
    const query = this.approvalRepository
      .createQueryBuilder('approval')
      .leftJoinAndSelect('approval.businessOwner', 'business_owner')
      .leftJoinAndSelect('business_owner.user', 'user')
      .leftJoinAndSelect('business_owner.addresses', 'address', 'address.isPrimary = true')
      .leftJoinAndSelect('approval.assignedAgent', 'agent')
      .leftJoinAndSelect('agent.user', 'agentUser');

    if (status) {
      query.andWhere('approval.status = :status', { status });
    }

    if (agentId) {
      query.andWhere('approval.assignedAgentId = :agentId', { agentId });
    }

    const [approvals, totalItems] = await query
      .orderBy('approval.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const mappedData = approvals.map(this.mapToApprovalRequestDto);
    const listData = {
      data: mappedData,
      meta: this.createPaginationMeta(page, limit, totalItems),
    };

    return new ApprovalListResponseDto(200, true, 'All approval requests retrieved successfully', listData);
  }

  /**
   * Approve a business (agent only)
   */
  async approveBusiness(
    approvalId: string,
    agentId: string,
    approveDto: ApproveBusinessDto
  ): Promise<ApiResponseDto<null>> {
    const approval = await this.getApprovalForAgent(approvalId, agentId);

    if (approval.status !== ApprovalStatus.PENDING) {
      throw new BadRequestException('Approval request has already been processed');
    }

    // Update approval status
    approval.status = ApprovalStatus.APPROVED;
    approval.reviewNotes = approveDto.reviewNotes;
    approval.reviewedAt = new Date();

    // Update business approval status
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { id: approval.businessOwnerId },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business not found');
    }

    businessOwner.isApproved = true;
    businessOwner.approvedAt = new Date();
    
    // Set vendor status to ACTIVE when business is approved
    businessOwner.vendorStatus = VendorStatus.ACTIVE;
    console.log('Setting vendorStatus to ACTIVE for approved business:', approval.businessOwnerId);

    // Save approval first
    await this.approvalRepository.save(approval);
    
    // Save business owner with vendorStatus handling
    try {
      // Save without vendorStatus first
      const businessOwnerCopy = { ...businessOwner };
      delete (businessOwnerCopy as any).vendorStatus;
      
      await this.businessOwnerRepository.save(businessOwnerCopy);
      console.log('Business owner saved successfully without vendorStatus');
      
      // Now update vendorStatus separately
      try {
        await this.businessOwnerRepository.update(approval.businessOwnerId, {
          vendorStatus: VendorStatus.ACTIVE
        });
        console.log('vendorStatus updated successfully to ACTIVE');
      } catch (statusUpdateError) {
        console.error('Failed to update vendorStatus separately:', statusUpdateError.message);
        console.log('Business approved but vendorStatus could not be updated');
      }
    } catch (error) {
      console.error('Error saving business owner:', error.message);
      throw new BadRequestException(`Failed to approve business: ${error.message}`);
    }

    // Send notification to business owner
    await this.notificationService.notifyBusinessOfApprovalStatus(
      businessOwner.userId,
      businessOwner.businessName || 'Your Business',
      true,
      approveDto.reviewNotes,
    );

    return new ApiResponseDto(200, true, 'Business approved successfully and vendor status set to ACTIVE', null);
  }

  /**
   * Reject a business (agent only)
   */
  async rejectBusiness(
    approvalId: string,
    agentId: string,
    rejectDto: RejectBusinessDto
  ): Promise<ApiResponseDto<null>> {
    const approval = await this.getApprovalForAgent(approvalId, agentId);

    if (approval.status !== ApprovalStatus.PENDING) {
      throw new BadRequestException('Approval request has already been processed');
    }

    // Update approval status
    approval.status = ApprovalStatus.REJECTED;
    approval.rejectionReason = rejectDto.rejectionReason;
    approval.reviewNotes = rejectDto.reviewNotes;
    approval.reviewedAt = new Date();

    await this.approvalRepository.save(approval);

    // Update business owner vendor status to HOLD_ACCOUNT when rejected
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { id: approval.businessOwnerId },
    });

    if (businessOwner) {
      businessOwner.vendorStatus = VendorStatus.HOLD_ACCOUNT;
      await this.businessOwnerRepository.save(businessOwner);
    }

    // Send notification to business owner
    const businessOwnerForNotification = await this.businessOwnerRepository.findOne({
      where: { id: approval.businessOwnerId },
      select: ['userId', 'businessName'],
    });

    if (businessOwnerForNotification) {
      await this.notificationService.notifyBusinessOfApprovalStatus(
        businessOwnerForNotification.userId,
        businessOwnerForNotification.businessName || 'Your Business',
        false,
        rejectDto.reviewNotes,
        rejectDto.rejectionReason,
      );
    }

    return new ApiResponseDto(200, true, 'Business rejected successfully and vendor status set to HOLD_ACCOUNT', null);
  }

  /**
   * Assign approval request to different agent (admin only)
   */
  async assignApprovalToAgent(
    approvalId: string,
    assignDto: AssignApprovalDto,
    adminId: string
  ): Promise<ApiResponseDto<null>> {
    const approval = await this.approvalRepository.findOne({
      where: { id: approvalId },
      relations: ['businessOwner', 'assignedAgent'],
    });

    if (!approval) {
      throw new NotFoundException('Approval request not found');
    }

    if (approval.status !== ApprovalStatus.PENDING) {
      throw new BadRequestException('Can only reassign pending approval requests');
    }

    // Verify new agent exists and is active
    const newAgent = await this.agentRepository.findOne({
      where: { id: assignDto.agentId, isActive: true },
    });

    if (!newAgent) {
      throw new NotFoundException('Agent not found or inactive');
    }

    // Calculate distance to new agent if business has address
    let newDistance: number | undefined;
    const businessAddress = await this.addressRepository.findOne({
      where: { businessOwnerId: approval.businessOwnerId, isPrimary: true },
    });

    if (businessAddress) {
      // In a real implementation, you would get agent's location
      // For now, we'll set it as null and let the system calculate it later
      newDistance = undefined;
    }

    // Update approval assignment
    approval.assignedAgentId = assignDto.agentId;
    approval.assignedByAdminId = adminId;
    approval.isAutoAssigned = false;
    approval.distanceToAgentKm = newDistance;

    await this.approvalRepository.save(approval);

    // Send notification to newly assigned agent
    await this.notificationService.notifyAgentOfApprovalReassignment(
      newAgent.userId,
      approval.businessOwner.businessName || 'Business',
      approval.id,
      assignDto.reassignmentReason,
    );

    return new ApiResponseDto(200, true, 'Approval request reassigned successfully', null);
  }

  /**
   * Get approval request details
   */
  async getApprovalRequest(approvalId: string): Promise<ApprovalRequestDto> {
    const approval = await this.approvalRepository
      .createQueryBuilder('approval')
      .leftJoinAndSelect('approval.businessOwner', 'business_owner')
      .leftJoinAndSelect('business_owner.user', 'user')
      .leftJoinAndSelect('business_owner.addresses', 'address', 'address.isPrimary = true')
      .leftJoinAndSelect('approval.assignedAgent', 'agent')
      .leftJoinAndSelect('agent.user', 'agentUser')
      .where('approval.id = :id', { id: approvalId })
      .getOne();

    if (!approval) {
      throw new NotFoundException('Approval request not found');
    }

    return this.mapToApprovalRequestDto(approval);
  }

  private async findNearestAvailableAgent(businessCoordinates: Coordinates): Promise<{
    agent: Agent | null;
    distance: number;
  }> {
    // Get all active agents
    const agents = await this.agentRepository.find({
      where: { isActive: true },
      relations: ['user'],
    });

    if (!agents.length) {
      return { agent: null, distance: 0 };
    }

    // Calculate distances and pending counts for each agent
    const agentsWithInfo = await Promise.all(
      agents.map(async (agent) => {
        const pendingCount = await this.approvalRepository.count({
          where: { assignedAgentId: agent.id, status: ApprovalStatus.PENDING },
        });

        let distance = 0;

        // Calculate actual distance if agent has location coordinates
        if (agent.latitude && agent.longitude) {
          distance = this.distanceCalculatorService.calculateDistance(
            businessCoordinates,
            { latitude: Number(agent.latitude), longitude: Number(agent.longitude) }
          );
        } else {
          // If agent doesn't have coordinates, assign a high distance penalty
          distance = 999999; // Very high distance to deprioritize agents without location
        }

        return { agent, pendingCount, distance };
      })
    );

    // Filter out agents with unreasonable distances (more than 200km)
    const availableAgents = agentsWithInfo.filter(item => item.distance <= 200);

    if (!availableAgents.length) {
      // If no agents within reasonable distance, fall back to load balancing
      agentsWithInfo.sort((a, b) => a.pendingCount - b.pendingCount);
      return {
        agent: agentsWithInfo[0].agent,
        distance: agentsWithInfo[0].distance,
      };
    }

    // Sort by distance first, then by pending count for tie-breaking
    availableAgents.sort((a, b) => {
      if (Math.abs(a.distance - b.distance) < 5) { // If distances are very close (within 5km)
        return a.pendingCount - b.pendingCount; // Prefer agent with fewer pending requests
      }
      return a.distance - b.distance; // Otherwise prefer closest agent
    });

    return {
      agent: availableAgents[0].agent,
      distance: availableAgents[0].distance,
    };
  }

  private async getApprovalForAgent(approvalId: string, agentId: string): Promise<BusinessApproval> {
    const approval = await this.approvalRepository.findOne({
      where: { id: approvalId, assignedAgentId: agentId },
      relations: ['businessOwner', 'assignedAgent'],
    });

    if (!approval) {
      throw new NotFoundException('Approval request not found or not assigned to you');
    }

    return approval;
  }

  private mapToApprovalRequestDto(approval: BusinessApproval): ApprovalRequestDto {
    const address = approval.businessOwner?.addresses?.find(addr => addr.isPrimary);
    
    return {
      id: approval.id,
      businessOwnerId: approval.businessOwnerId,
      businessName: approval.businessOwner?.businessName || 'N/A',
      businessDescription: approval.businessOwner?.businessDescription || 'N/A',
      businessAddress: address ? 
        `${address.streetAddress}, ${address.city}, ${address.state}` : 
        'Address not available',
      businessOwnerName: `${approval.businessOwner?.firstName || ''} ${approval.businessOwner?.lastName || ''}`.trim() || 'N/A',
      businessOwnerPhone: approval.businessOwner?.user?.phone || 'N/A',
      businessOwnerEmail: approval.businessOwner?.user?.email,
      assignedAgentId: approval.assignedAgentId,
      assignedAgentName: approval.assignedAgent?.fullName || 'N/A',
      status: approval.status,
      reviewNotes: approval.reviewNotes,
      rejectionReason: approval.rejectionReason,
      isAutoAssigned: approval.isAutoAssigned,
      distanceToAgentKm: approval.distanceToAgentKm,
      assignedByAdminId: approval.assignedByAdminId,
      reviewedAt: approval.reviewedAt,
      createdAt: approval.createdAt,
      updatedAt: approval.updatedAt,
      upiId: approval.businessOwner?.upiId,
      creditLimit: approval.businessOwner?.creditLimit,
      vendorStatus: approval.businessOwner?.vendorStatus,
      alternateNumber: approval.businessOwner?.alternateNumber,
      remark: approval.businessOwner?.remark,
    };
  }

  /**
   * Get business approval status for business owner
   */
  async getBusinessApprovalStatus(businessOwnerId: string): Promise<BusinessApprovalStatusDto> {
    // Get business information
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { id: businessOwnerId },
      select: ['isApproved', 'approvedAt'],
    });

    if (!businessOwner) {
      throw new NotFoundException('Business not found');
    }

    // Find the latest approval request
    const approval = await this.approvalRepository.findOne({
      where: { businessOwnerId },
      relations: ['assignedAgent', 'assignedAgent.user'],
      order: { createdAt: 'DESC' },
    });

    // If no approval request exists
    if (!approval) {
      const statusData: BusinessApprovalStatusDataDto = {
        hasApprovalRequested: false,
        isApproved: businessOwner.isApproved || false,
        statusMessage: 'No approval request found. Please complete your business onboarding first.',
      };
      return new BusinessApprovalStatusDto(200, true, 'Business approval status retrieved successfully', statusData);
    }

    // Generate status message based on current state
    let statusMessage: string;
    switch (approval.status) {
      case ApprovalStatus.PENDING:
        statusMessage = 'Your business registration is being reviewed by our team. You will be notified once a decision is made.';
        break;
      case ApprovalStatus.UNDER_REVIEW:
        statusMessage = 'Your business registration is currently under detailed review. This may take a bit longer.';
        break;
      case ApprovalStatus.APPROVED:
        statusMessage = 'Congratulations! Your business has been approved and is now live on our platform.';
        break;
      case ApprovalStatus.REJECTED:
        statusMessage = 'Unfortunately, your business registration was not approved. Please review the feedback and reapply.';
        break;
      default:
        statusMessage = 'Unknown approval status.';
    }

    // Build response object based on status
    const statusData: BusinessApprovalStatusDataDto = {
      hasApprovalRequested: true,
      status: approval.status,
      isApproved: businessOwner.isApproved || false,
      requestedAt: approval.createdAt,
      statusMessage,
    };

    // Add agent information if available
    if (approval.assignedAgent) {
      statusData.assignedAgent = {
        id: approval.assignedAgent.id,
        name: approval.assignedAgent.fullName || approval.assignedAgent.user?.email?.split('@')[0] || 'Unknown Agent',
        email: approval.assignedAgent.user?.email,
        phone: approval.assignedAgent.user?.phone,
      };
    }

    // Only include rejectionReason if status is REJECTED
    if (approval.status === ApprovalStatus.REJECTED && approval.rejectionReason) {
      statusData.rejectionReason = approval.rejectionReason;
    }

    return new BusinessApprovalStatusDto(200, true, 'Business approval status retrieved successfully', statusData);
  }

  /**
   * Admin Methods
   */

  async getAdminPendingApprovals(page: number = 1, limit: number = 10): Promise<ApprovalListResponseDto> {
    const query = this.approvalRepository
      .createQueryBuilder('approval')
      .leftJoinAndSelect('approval.businessOwner', 'business_owner')
      .leftJoinAndSelect('business_owner.user', 'user')
      .leftJoinAndSelect('business_owner.addresses', 'address', 'address.isPrimary = true')
      .leftJoinAndSelect('approval.assignedAgent', 'agent')
      .leftJoinAndSelect('agent.user', 'agentUser')
      .where('approval.status = :status', { status: ApprovalStatus.PENDING });

    const [approvals, totalItems] = await query
      .orderBy('approval.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const mappedData = approvals.map(this.mapToApprovalRequestDto);
    const listData = {
      data: mappedData,
      meta: this.createPaginationMeta(page, limit, totalItems),
    };

    return new ApprovalListResponseDto(200, true, 'Pending approval requests retrieved successfully', listData);
  }

  async getAdminAllApprovals(page: number = 1, limit: number = 10, status?: ApprovalStatus): Promise<ApprovalListResponseDto> {
    const query = this.approvalRepository
      .createQueryBuilder('approval')
      .leftJoinAndSelect('approval.businessOwner', 'business_owner')
      .leftJoinAndSelect('business_owner.user', 'user')
      .leftJoinAndSelect('business_owner.addresses', 'address', 'address.isPrimary = true')
      .leftJoinAndSelect('approval.assignedAgent', 'agent')
      .leftJoinAndSelect('agent.user', 'agentUser');

    if (status) {
      query.where('approval.status = :status', { status });
    }

    const [approvals, totalItems] = await query
      .orderBy('approval.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const mappedData = approvals.map(this.mapToApprovalRequestDto);
    const listData = {
      data: mappedData,
      meta: this.createPaginationMeta(page, limit, totalItems),
    };

    return new ApprovalListResponseDto(200, true, 'Admin approval requests retrieved successfully', listData);
  }

  async adminApproveBusiness(businessOwnerId: string, adminId: string, approveDto: ApproveBusinessDto): Promise<ApiResponseDto<null>> {
    // Find the business owner
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { id: businessOwnerId },
      relations: ['user'],
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    // Check if business is already approved
    if (businessOwner.isApproved) {
      throw new BadRequestException('Business is already approved');
    }

    // Find the pending approval request
    const approval = await this.approvalRepository.findOne({
      where: { businessOwnerId, status: ApprovalStatus.PENDING },
    });

    if (!approval) {
      throw new NotFoundException('No pending approval request found for this business');
    }

    // Update approval status
    approval.status = ApprovalStatus.APPROVED;
    approval.reviewNotes = approveDto.reviewNotes;
    approval.reviewedAt = new Date();
    
    // Update approval with additional fields
    if (approveDto.creditLimit !== undefined && approveDto.creditLimit !== null) {
      // approval.creditLimit = approveDto.creditLimit;
    }
    
    // Note: upiId and vendorStatus would need to be added to ApproveBusinessDto
    // For now, we'll update them if they exist in the business owner
    if (businessOwner.upiId) {
      // approval.upiId = businessOwner.upiId;
    }
    
    if (businessOwner.vendorStatus) {
      // approval.vendorStatus = businessOwner.vendorStatus;
    }
    
    await this.approvalRepository.save(approval);

    // Update business owner approval status
    businessOwner.isApproved = true;
    businessOwner.approvedAt = new Date();
    
    // Set vendor status to ACTIVE when business is approved
    businessOwner.vendorStatus = VendorStatus.ACTIVE;
    console.log('Setting vendorStatus to ACTIVE for admin approved business:', businessOwnerId);
    
    // Set credit limit if provided
    if (approveDto.creditLimit !== undefined && approveDto.creditLimit !== null) {
      businessOwner.creditLimit = approveDto.creditLimit;
    }
    
    // Save business owner with vendorStatus handling
    try {
      // Save without vendorStatus first
      const businessOwnerCopy = { ...businessOwner };
      delete (businessOwnerCopy as any).vendorStatus;
      
      await this.businessOwnerRepository.save(businessOwnerCopy);
      console.log('Business owner saved successfully without vendorStatus');
      
      // Now update vendorStatus separately
      try {
        await this.businessOwnerRepository.update(businessOwnerId, {
          vendorStatus: VendorStatus.ACTIVE
        });
        console.log('vendorStatus updated successfully to ACTIVE');
      } catch (statusUpdateError) {
        console.error('Failed to update vendorStatus separately:', statusUpdateError.message);
        console.log('Business approved but vendorStatus could not be updated');
      }
    } catch (error) {
      console.error('Error saving business owner:', error.message);
      throw new BadRequestException(`Failed to approve business: ${error.message}`);
    }

    // Send approval notification
    await this.notificationService.notifyBusinessOfApprovalStatus(
      businessOwner.userId,
      businessOwner.businessName || 'Your Business',
      true,
      approveDto.reviewNotes,
    );

    return new ApiResponseDto(200, true, 'Business approved successfully and vendor status set to ACTIVE', null);
  }

  async adminRejectBusiness(businessOwnerId: string, adminId: string, rejectDto: RejectBusinessDto): Promise<ApiResponseDto<null>> {
    // Find the business owner
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { id: businessOwnerId },
      relations: ['user'],
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    // Find the pending approval request
    const approval = await this.approvalRepository.findOne({
      where: { businessOwnerId, status: ApprovalStatus.PENDING },
    });

    if (!approval) {
      throw new NotFoundException('No pending approval request found for this business');
    }

    // Update approval status
    approval.status = ApprovalStatus.REJECTED;
    approval.rejectionReason = rejectDto.rejectionReason;
    approval.reviewNotes = rejectDto.reviewNotes;
    approval.reviewedAt = new Date();
    await this.approvalRepository.save(approval);

    // Update business owner vendor status to HOLD_ACCOUNT when rejected
    businessOwner.vendorStatus = VendorStatus.HOLD_ACCOUNT;
    await this.businessOwnerRepository.save(businessOwner);

    // Send rejection notification
    await this.notificationService.notifyBusinessOfApprovalStatus(
      businessOwner.userId,
      businessOwner.businessName || 'Your Business',
      false,
      rejectDto.reviewNotes,
      rejectDto.rejectionReason,
    );

    return new ApiResponseDto(200, true, 'Business rejected successfully and vendor status set to HOLD_ACCOUNT', null);
  }

  private createPaginationMeta(page: number, limit: number, totalItems: number): PaginationMetaDto {
    const totalPages = Math.ceil(totalItems / limit);

    return {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  /**
   * Get all businesses with comprehensive details for approval
   */
  async getAllBusinessesWithDetails(
    page: number = 1,
    limit: number = 10,
    status?: ApprovalStatus
  ): Promise<any> {
    const query = this.approvalRepository
      .createQueryBuilder('approval')
      .leftJoinAndSelect('approval.businessOwner', 'businessOwner')
      .leftJoinAndSelect('businessOwner.user', 'user')
      .leftJoinAndSelect('businessOwner.addresses', 'addresses', 'addresses.isPrimary = true')
      .leftJoinAndSelect('businessOwner.media', 'media')
      .leftJoinAndSelect('businessOwner.documents', 'documents')
      .leftJoinAndSelect('businessOwner.bankingInfo', 'bankingInfo')
      .leftJoinAndSelect('approval.assignedAgent', 'agent')
      .leftJoinAndSelect('agent.user', 'agentUser');

    if (status) {
      query.andWhere('approval.status = :status', { status });
    }

    const [approvals, totalItems] = await query
      .orderBy('approval.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const businessDetails = await Promise.all(
      approvals.map(async (approval) => {
        // Get reviews for this business
        const reviews = await this.reviewRepository.find({
          where: { businessOwnerId: approval.businessOwnerId },
          select: ['id', 'rating', 'comment', 'createdAt'],
          relations: ['customer'],
          take: 10,
        });

        return this.mapToBusinessApprovalDetails(approval, reviews);
      })
    );

    return {
      data: businessDetails,
      meta: this.createPaginationMeta(page, limit, totalItems),
    };
  }

  /**
   * Get business by ID with comprehensive details
   */
  async getBusinessByIdWithDetails(businessOwnerId: string): Promise<any> {
    const approval = await this.approvalRepository
      .createQueryBuilder('approval')
      .leftJoinAndSelect('approval.businessOwner', 'businessOwner')
      .leftJoinAndSelect('businessOwner.user', 'user')
      .leftJoinAndSelect('businessOwner.addresses', 'addresses')
      .leftJoinAndSelect('businessOwner.media', 'media')
      .leftJoinAndSelect('businessOwner.documents', 'documents')
      .leftJoinAndSelect('businessOwner.bankingInfo', 'bankingInfo')
      .leftJoinAndSelect('approval.assignedAgent', 'agent')
      .leftJoinAndSelect('agent.user', 'agentUser')
      .where('approval.businessOwnerId = :businessOwnerId', { businessOwnerId })
      .getOne();

    if (!approval) {
      throw new NotFoundException('Business not found');
    }

    // Get reviews for this business
    const reviews = await this.reviewRepository.find({
      where: { businessOwnerId: businessOwnerId },
      select: ['id', 'rating', 'comment', 'createdAt'],
      relations: ['customer'],
      take: 50,
    });

    return this.mapToBusinessApprovalDetails(approval, reviews);
  }

  /**
   * Update business approval details (PUT endpoint)
   */
  async updateBusinessApproval(
    businessOwnerId: string,
    updateDto: any,
    adminId: string
  ): Promise<any> {
    console.log('Updating business owner:', businessOwnerId, 'with data:', updateDto);
    
    // Check if trying to update restricted fields
    if (updateDto.email || updateDto.mobileNumber || updateDto.phone) {
      throw new BadRequestException('Email and mobile number cannot be changed');
    }

    // Get business owner and related entities
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { id: businessOwnerId },
      relations: ['user', 'addresses', 'media', 'documents', 'bankingInfo'],
    });

    if (!businessOwner) {
      throw new NotFoundException('Business not found');
    }

    console.log('Found business owner:', businessOwner.id);

    // Get approval record
    const approval = await this.approvalRepository.findOne({
      where: { businessOwnerId },
    });

    if (!approval) {
      throw new NotFoundException('Approval record not found');
    }

    console.log('Found approval:', approval.id, 'current status:', approval.status);

    // Track if any changes were made
    let hasChanges = false;

    // Update business owner details (excluding email and mobile number)
    if (updateDto.businessName) {
      businessOwner.businessName = updateDto.businessName;
      hasChanges = true;
      console.log('Updated businessName to:', updateDto.businessName);
    }
    if (updateDto.businessDescription !== undefined) {
      businessOwner.businessDescription = updateDto.businessDescription;
      hasChanges = true;
      console.log('Updated businessDescription');
    }

    // Update new fields
    if (updateDto.upiId !== undefined) {
      businessOwner.upiId = updateDto.upiId;
      // approval.upiId = updateDto.upiId;
      hasChanges = true;
      console.log('Updated upiId to:', updateDto.upiId);
    }
    if (updateDto.creditLimit !== undefined) {
      businessOwner.creditLimit = updateDto.creditLimit;
      // approval.creditLimit = updateDto.creditLimit;
      hasChanges = true;
      console.log('Updated creditLimit to:', updateDto.creditLimit);
    }

    // Handle vendorStatus update with proper validation
    if (updateDto.vendorStatus !== undefined) {
      console.log('Processing vendorStatus update:', updateDto.vendorStatus);
      
      // Convert string to enum value
      const statusString = String(updateDto.vendorStatus).toLowerCase().trim();
      console.log('Normalized status string:', statusString);
      
      // Map string to enum
      const statusMap: { [key: string]: VendorStatus } = {
        'hold_account': VendorStatus.HOLD_ACCOUNT,
        'active': VendorStatus.ACTIVE,
        'inactive': VendorStatus.INACTIVE,
        'suspended': VendorStatus.SUSPENDED,
        'services_hidden': VendorStatus.SERVICES_HIDDEN,
      };
      
      if (statusMap[statusString]) {
        businessOwner.vendorStatus = statusMap[statusString];
        console.log('vendorStatus set to:', businessOwner.vendorStatus);
        hasChanges = true;
        console.log('Updated vendorStatus to (enum):', businessOwner.vendorStatus);
      } else {
        console.warn('Invalid vendorStatus value:', updateDto.vendorStatus, 'Using default ACTIVE');
        businessOwner.vendorStatus = VendorStatus.ACTIVE;
        hasChanges = true;
        console.log('Updated vendorStatus to default (ACTIVE):', VendorStatus.ACTIVE);
      }
    }

    // Update alternateNumber and remark fields
    if (updateDto.alternateNumber !== undefined) {
      businessOwner.alternateNumber = updateDto.alternateNumber;
      hasChanges = true;
      console.log('Updated alternateNumber to:', updateDto.alternateNumber);
    }
    if (updateDto.remark !== undefined) {
      businessOwner.remark = updateDto.remark;
      hasChanges = true;
      console.log('Updated remark to:', updateDto.remark);
    }

    // Handle nested businessOwner object
    if (updateDto.businessOwner) {
      const ownerData = updateDto.businessOwner;
      if (ownerData.businessName) {
        businessOwner.businessName = ownerData.businessName;
        hasChanges = true;
        console.log('Updated businessName (nested) to:', ownerData.businessName);
      }
      if (ownerData.businessDescription !== undefined) {
        businessOwner.businessDescription = ownerData.businessDescription;
        hasChanges = true;
        console.log('Updated businessDescription (nested)');
      }
      if (ownerData.firstName !== undefined) {
        businessOwner.firstName = ownerData.firstName;
        hasChanges = true;
        console.log('Updated firstName (nested) to:', ownerData.firstName);
      }
      if (ownerData.lastName !== undefined) {
        businessOwner.lastName = ownerData.lastName;
        hasChanges = true;
        console.log('Updated lastName (nested) to:', ownerData.lastName);
      }
      if (ownerData.upiId !== undefined) {
        businessOwner.upiId = ownerData.upiId;
        // approval.upiId = ownerData.upiId;
        hasChanges = true;
        console.log('Updated upiId (nested) to:', ownerData.upiId);
      }
      if (ownerData.creditLimit !== undefined) {
        businessOwner.creditLimit = ownerData.creditLimit;
        // approval.creditLimit = ownerData.creditLimit;
        hasChanges = true;
        console.log('Updated creditLimit (nested) to:', ownerData.creditLimit);
      }
      if (ownerData.vendorStatus !== undefined) {
        console.log('vendorStatus input (nested):', ownerData.vendorStatus, 'type:', typeof ownerData.vendorStatus);
        console.log('Available VendorStatus values (nested):', Object.values(VendorStatus));
        
        // Convert string to enum value if needed
        if (typeof ownerData.vendorStatus === 'string') {
          // Find matching enum value (case-insensitive)
          const statusValue = Object.values(VendorStatus).find(
            status => status.toLowerCase() === ownerData.vendorStatus.toLowerCase()
          );
          console.log('Found statusValue (nested):', statusValue);
          
          if (statusValue) {
            businessOwner.vendorStatus = statusValue as VendorStatus;
            hasChanges = true;
            console.log('Updated vendorStatus (nested) to:', statusValue);
          } else {
            console.warn('Invalid vendorStatus value (nested):', ownerData.vendorStatus);
            // Instead of throwing error, try to use a safe default
            console.log('Using default vendorStatus (nested): ACTIVE');
            businessOwner.vendorStatus = VendorStatus.ACTIVE;
            hasChanges = true;
            console.log('Updated vendorStatus (nested) to default (ACTIVE):', VendorStatus.ACTIVE);
          }
        } else {
          businessOwner.vendorStatus = ownerData.vendorStatus;
          hasChanges = true;
          console.log('Updated vendorStatus (nested) to (enum):', ownerData.vendorStatus);
        }
      }
      if (ownerData.alternateNumber !== undefined) {
        businessOwner.alternateNumber = ownerData.alternateNumber;
        hasChanges = true;
        console.log('Updated alternateNumber (nested) to:', ownerData.alternateNumber);
      }
      if (ownerData.remark !== undefined) {
        businessOwner.remark = ownerData.remark;
        hasChanges = true;
        console.log('Updated remark (nested) to:', ownerData.remark);
      }
    }

    // Update business address if provided
    if (updateDto.streetAddress || updateDto.city || updateDto.state || updateDto.pincode || updateDto.address) {
      const primaryAddress = businessOwner.addresses?.find(addr => addr.isPrimary);
      if (primaryAddress) {
        // Handle flat address fields
        if (updateDto.streetAddress) primaryAddress.streetAddress = updateDto.streetAddress;
        if (updateDto.city) primaryAddress.city = updateDto.city;
        if (updateDto.state) primaryAddress.state = updateDto.state;
        if (updateDto.pincode) primaryAddress.postalCode = updateDto.pincode;
        if (updateDto.latitude !== undefined) primaryAddress.latitude = updateDto.latitude;
        if (updateDto.longitude !== undefined) primaryAddress.longitude = updateDto.longitude;
        
        // Handle nested address object
        if (updateDto.address) {
          const addressData = updateDto.address;
          if (addressData.streetAddress) primaryAddress.streetAddress = addressData.streetAddress;
          if (addressData.city) primaryAddress.city = addressData.city;
          if (addressData.state) primaryAddress.state = addressData.state;
          if (addressData.pincode) primaryAddress.postalCode = addressData.pincode;
          if (addressData.latitude !== undefined) primaryAddress.latitude = addressData.latitude;
          if (addressData.longitude !== undefined) primaryAddress.longitude = addressData.longitude;
          console.log('Updated address (nested)');
        }
        
        await this.addressRepository.save(primaryAddress);
        hasChanges = true;
        console.log('Saved address updates');
      }
    }

    // Update banking info if provided
    if (updateDto.bankName || updateDto.accountHolderName || updateDto.ifscCode || updateDto.branchName || updateDto.bankingInfo) {
      const bankingInfo = businessOwner.bankingInfo;
      if (bankingInfo) {
        console.log('Updating banking info, current:', bankingInfo);
        
        // Handle nested bankingInfo object
        if (updateDto.bankingInfo) {
          const bankData = updateDto.bankingInfo;
          if (bankData.bankName) {
            bankingInfo.bankName = bankData.bankName;
            console.log('Updated bankName to:', bankData.bankName);
            hasChanges = true;
          }
          if (bankData.accountHolderName) {
            bankingInfo.accountHolderName = bankData.accountHolderName;
            console.log('Updated accountHolderName to:', bankData.accountHolderName);
            hasChanges = true;
          }
          if (bankData.ifscCode) {
            bankingInfo.ifscCode = bankData.ifscCode;
            console.log('Updated ifscCode to:', bankData.ifscCode);
            hasChanges = true;
          }
          if (bankData.branch || bankData.branchName) {
            bankingInfo.branch = bankData.branch || bankData.branchName;
            console.log('Updated branch to:', bankData.branch || bankData.branchName);
            console.log('Banking info branch field after update:', bankingInfo.branch);
            hasChanges = true;
          }
          if (bankData.accountNumber) {
            bankingInfo.accountNumber = bankData.accountNumber;
            console.log('Updated accountNumber to:', bankData.accountNumber);
            hasChanges = true;
          }
        }
        
        // Handle individual fields (legacy format)
        if (updateDto.bankName) {
          bankingInfo.bankName = updateDto.bankName;
          console.log('Updated bankName to:', updateDto.bankName);
          hasChanges = true;
        }
        if (updateDto.accountHolderName) {
          bankingInfo.accountHolderName = updateDto.accountHolderName;
          console.log('Updated accountHolderName to:', updateDto.accountHolderName);
          hasChanges = true;
        }
        if (updateDto.ifscCode) {
          bankingInfo.ifscCode = updateDto.ifscCode;
          console.log('Updated ifscCode to:', updateDto.ifscCode);
          hasChanges = true;
        }
        if (updateDto.branchName) {
          bankingInfo.branch = updateDto.branchName;
          console.log('Updated branch to:', updateDto.branchName);
          hasChanges = true;
        }
        
        if (hasChanges) {
          await this.bankingInfoRepository.save(bankingInfo);
          console.log('Saved banking info');
        }
      } else {
        console.log('No banking info found for business owner');
      }
    }

    // Update media if provided
    if (updateDto.media && Array.isArray(updateDto.media)) {
      // Handle media updates - add new media items or update existing ones
      for (const mediaItem of updateDto.media) {
        if (mediaItem.id) {
          // Update existing media
          const existingMedia = businessOwner.media?.find(m => m.id === mediaItem.id);
          if (existingMedia) {
            if (mediaItem.mediaUrl) existingMedia.mediaUrl = mediaItem.mediaUrl;
            if (mediaItem.mediaType) existingMedia.mediaType = mediaItem.mediaType;
            if (mediaItem.cdnUrl !== undefined) existingMedia.cdnUrl = mediaItem.cdnUrl;
            if (mediaItem.thumbnailUrl !== undefined) existingMedia.thumbnailUrl = mediaItem.thumbnailUrl;
            if (mediaItem.fileName !== undefined) existingMedia.fileName = mediaItem.fileName;
            if (mediaItem.displayOrder !== undefined) existingMedia.displayOrder = mediaItem.displayOrder;
            if (mediaItem.isActive !== undefined) existingMedia.isActive = mediaItem.isActive;
            await this.mediaRepository.save(existingMedia);
          }
        } else {
          // Add new media item
          const newMedia = this.mediaRepository.create({
            businessOwnerId: businessOwnerId,
            mediaUrl: mediaItem.mediaUrl,
            mediaType: mediaItem.mediaType,
            cdnUrl: mediaItem.cdnUrl,
            thumbnailUrl: mediaItem.thumbnailUrl,
            fileName: mediaItem.fileName,
            displayOrder: mediaItem.displayOrder || 0,
            isActive: mediaItem.isActive !== undefined ? mediaItem.isActive : true,
          });
          await this.mediaRepository.save(newMedia);
        }
      }
    }

    // Update documents if provided
    if (updateDto.documents && Array.isArray(updateDto.documents)) {
      // Handle document updates - add new documents or update existing ones
      for (const docItem of updateDto.documents) {
        if (docItem.id) {
          // Update existing document
          const existingDoc = businessOwner.documents?.find(d => d.id === docItem.id);
          if (existingDoc) {
            if (docItem.documentUrl) existingDoc.documentUrl = docItem.documentUrl;
            if (docItem.documentType) existingDoc.documentType = docItem.documentType;
            if (docItem.status !== undefined) existingDoc.status = docItem.status;
            if (docItem.rejectionReason !== undefined) existingDoc.rejectionReason = docItem.rejectionReason;
            await this.documentRepository.save(existingDoc);
          }
        } else {
          // Add new document
          const newDoc = this.documentRepository.create({
            businessOwnerId: businessOwnerId,
            documentUrl: docItem.documentUrl,
            documentType: docItem.documentType,
            status: docItem.status || 'PENDING',
          });
          await this.documentRepository.save(newDoc);
        }
      }
    }

    // Update approval status if provided
    if (updateDto.approvalStatus) {
      approval.status = updateDto.approvalStatus as ApprovalStatus;
      if (updateDto.reviewNotes) approval.reviewNotes = updateDto.reviewNotes;
      if (updateDto.rejectionReason) approval.rejectionReason = updateDto.rejectionReason;
      approval.reviewedAt = new Date();
      await this.approvalRepository.save(approval);

      // Update business owner approval status
      if (updateDto.approvalStatus === ApprovalStatus.APPROVED) {
        businessOwner.isApproved = true;
        businessOwner.approvedAt = new Date();
      } else if (updateDto.approvalStatus === ApprovalStatus.REJECTED) {
        businessOwner.isApproved = false;
      }
    } else {
      // Sync approval status with business owner status if no approval status provided
      if (businessOwner.isApproved && approval.status !== ApprovalStatus.APPROVED) {
        approval.status = ApprovalStatus.APPROVED;
        approval.reviewedAt = businessOwner.approvedAt || new Date();
        await this.approvalRepository.save(approval);
      }
    }

    console.log('Has changes:', hasChanges);
    console.log('Final business owner state:', {
      businessName: businessOwner.businessName,
      firstName: businessOwner.firstName,
      lastName: businessOwner.lastName,
      isApproved: businessOwner.isApproved
    });
    
    // Show banking info state if it was updated
    if (businessOwner.bankingInfo) {
      console.log('Final banking info state:', {
        bankName: businessOwner.bankingInfo.bankName,
        accountHolderName: businessOwner.bankingInfo.accountHolderName,
        ifscCode: businessOwner.bankingInfo.ifscCode,
        branch: businessOwner.bankingInfo.branch,
        accountNumber: businessOwner.bankingInfo.accountNumber
      });
    }

    // Save business owner changes
    if (hasChanges) {
      console.log('Saving business owner...');
      console.log('Final vendorStatus value before save:', businessOwner.vendorStatus, 'type:', typeof businessOwner.vendorStatus);
      
      // Check if vendorStatus is being updated
      const hasVendorStatusChange = updateDto.vendorStatus !== undefined || (updateDto.businessOwner && updateDto.businessOwner.vendorStatus !== undefined);
      const vendorStatusValue = businessOwner.vendorStatus;
      
      try {
        if (hasVendorStatusChange) {
          console.log('vendorStatus was changed, saving without it first...');
          
          // Save without vendorStatus first
          const businessOwnerCopy = { ...businessOwner };
          delete (businessOwnerCopy as any).vendorStatus;
          
          await this.businessOwnerRepository.save(businessOwnerCopy);
          console.log('Business owner saved successfully without vendorStatus');
          
          // Now update vendorStatus separately
          try {
            console.log('Updating vendorStatus separately...');
            console.log('vendorStatus value to update:', vendorStatusValue, 'type:', typeof vendorStatusValue);
            
            // Try multiple approaches for vendorStatus update
            let vendorStatusUpdated = false;
            
            // Approach 1: Standard update
            try {
              await this.businessOwnerRepository.update(businessOwnerId, {
                vendorStatus: vendorStatusValue
              });
              console.log('vendorStatus updated successfully with standard update');
              vendorStatusUpdated = true;
            } catch (updateError1) {
              console.error('Standard update failed:', updateError1.message);
              
              // Approach 2: QueryBuilder update
              try {
                await this.businessOwnerRepository
                  .createQueryBuilder()
                  .update(BusinessOwner)
                  .set({ vendorStatus: vendorStatusValue })
                  .where('id = :id', { id: businessOwnerId })
                  .execute();
                console.log('vendorStatus updated successfully with QueryBuilder');
                vendorStatusUpdated = true;
              } catch (updateError2) {
                console.error('QueryBuilder update failed:', updateError2.message);
                
                // Approach 3: Raw SQL with parameter binding
                try {
                  const result = await this.businessOwnerRepository.query(
                    `UPDATE business_owner SET vendor_status = $1 WHERE id = $2`,
                    [vendorStatusValue, businessOwnerId]
                  );
                  console.log('Raw SQL update result:', result);
                  vendorStatusUpdated = true;
                } catch (updateError3) {
                  console.error('Raw SQL update failed:', updateError3.message);
                  
                  // Approach 4: Try with ACTIVE as fallback
                  try {
                    await this.businessOwnerRepository
                      .createQueryBuilder()
                      .update(BusinessOwner)
                      .set({ vendorStatus: VendorStatus.ACTIVE })
                      .where('id = :id', { id: businessOwnerId })
                      .execute();
                    console.log('vendorStatus updated to ACTIVE as fallback');
                    vendorStatusUpdated = true;
                  } catch (updateError4) {
                    console.error('Fallback to ACTIVE failed:', updateError4.message);
                    console.log('Could not update vendorStatus, but business owner was saved');
                  }
                }
              }
            }
            
            // Refresh the entity to get updated values
            if (vendorStatusUpdated) {
              const updatedBusinessOwner = await this.businessOwnerRepository.findOne({
                where: { id: businessOwnerId }
              });
              if (updatedBusinessOwner) {
                Object.assign(businessOwner, updatedBusinessOwner);
                console.log('Business owner refreshed with updated vendorStatus');
              }
            }
          } catch (separateUpdateError) {
            console.error('Failed to update vendorStatus separately:', separateUpdateError.message);
            console.log('Business owner saved but vendorStatus could not be updated');
          }
        } else {
          // If vendorStatus wasn't changed, save normally
          await this.businessOwnerRepository.save(businessOwner);
          console.log('Business owner saved successfully (no vendorStatus change)');
        }
      } catch (error) {
        console.error('Error in save process:', error.message);
        
        // Final fallback - try to save without any vendorStatus
        try {
          console.log('Final fallback: saving without vendorStatus field...');
          const businessOwnerCopy = { ...businessOwner };
          delete (businessOwnerCopy as any).vendorStatus;
          
          await this.businessOwnerRepository.save(businessOwnerCopy);
          console.log('Business owner saved successfully in final fallback');
          
          // Try one last time to set vendorStatus to ACTIVE
          try {
            await this.businessOwnerRepository
              .createQueryBuilder()
              .update(BusinessOwner)
              .set({ vendorStatus: VendorStatus.ACTIVE })
              .where('id = :id', { id: businessOwnerId })
              .execute();
            console.log('vendorStatus set to ACTIVE in final fallback');
          } catch (finalError) {
            console.error('Final vendorStatus update failed:', finalError.message);
            console.log('Business owner saved but vendorStatus remains unchanged');
          }
        } catch (finalFallbackError) {
          console.error('Final fallback failed:', finalFallbackError.message);
          throw new BadRequestException(`Failed to update business: ${finalFallbackError.message}`);
        }
      }
    } else {
      console.log('No changes to save');
    }

    console.log('Returning updated details...');
    // Return updated details
    return this.getApprovedBusinessOwnerById(businessOwnerId);
  }

  /**
   * Get approved business owner by ID
   */
  async getApprovedBusinessOwnerById(businessOwnerId: string): Promise<any> {
    console.log('Getting approved business owner by ID:', businessOwnerId);
    
    const businessOwner = await this.businessOwnerRepository
      .createQueryBuilder('businessOwner')
      .leftJoinAndSelect('businessOwner.user', 'user')
      .leftJoinAndSelect('businessOwner.addresses', 'addresses')
      .leftJoinAndSelect('businessOwner.documents', 'documents')
      .leftJoinAndSelect('businessOwner.bankingInfo', 'bankingInfo')
      .leftJoinAndSelect('businessOwner.media', 'media')
      .where('businessOwner.id = :businessOwnerId', { businessOwnerId })
      .andWhere('businessOwner.isApproved = :isApproved', { isApproved: true })
      .andWhere('businessOwner.isActive = :isActive', { isActive: true })
      .getOne();

    if (!businessOwner) {
      throw new NotFoundException('Approved business owner not found');
    }

    console.log('Found business owner for response:', {
      id: businessOwner.id,
      businessName: businessOwner.businessName,
      firstName: businessOwner.firstName,
      lastName: businessOwner.lastName
    });

    // Debug: Check if user is loaded
    if (!businessOwner.user) {
      console.warn(`User not loaded for business owner: ${businessOwnerId}`);
      // Try to load user separately
      const user = await this.userRepository.findOne({
        where: { id: businessOwner.userId }
      });
      businessOwner.user = user;
    }

    // Debug banking info
    if (businessOwner.bankingInfo) {
      console.log('Banking info loaded for response:', {
        bankName: businessOwner.bankingInfo.bankName,
        ifscCode: businessOwner.bankingInfo.ifscCode,
        branch: businessOwner.bankingInfo.branch
      });
    }

    // Get reviews for this business
    const reviews = await this.reviewRepository.find({
      where: { businessOwnerId: businessOwnerId },
      select: ['id', 'rating', 'comment', 'createdAt'],
      relations: ['customer'],
      take: 50,
    });

    console.log('Mapping to response format...');
    const result = this.mapToBusinessOwnerDetails(businessOwner, businessOwner.media || [], reviews);
    console.log('Response banking info:', result.bankingInfo);
    
    return result;
  }

  private mapToBusinessApprovalDetails(approval: any, reviews: any[]): any {
    const businessOwner = approval.businessOwner;
    const user = businessOwner.user;

    return {
      businessOwner: {
        id: businessOwner.id,
        firstName: businessOwner.firstName,
        lastName: businessOwner.lastName,
        email: user?.email || null, // Read-only
        mobileNumber: user?.phone || null, // Read-only
        businessName: businessOwner.businessName,
        businessDescription: businessOwner.businessDescription,
        isApproved: businessOwner.isApproved,
        approvedAt: businessOwner.approvedAt,
        createdAt: businessOwner.createdAt,
        upiId: approval.upiId || businessOwner.upiId,
        creditLimit: approval.creditLimit || businessOwner.creditLimit,
        vendorStatus: approval.vendorStatus || businessOwner.vendorStatus,
        alternateNumber: businessOwner.alternateNumber,
        remark: businessOwner.remark,
      },
      business: {
        id: businessOwner.id,
        name: businessOwner.businessName,
        description: businessOwner.businessDescription,
        phone: user?.phone || null,
        email: user?.email || null,
        isActive: businessOwner.isActive,
        createdAt: businessOwner.createdAt,
        updatedAt: businessOwner.updatedAt,
      },
      media: businessOwner.media?.map(media => ({
        id: media.id,
        mediaUrl: media.mediaUrl,
        mediaType: media.mediaType,
        cdnUrl: media.cdnUrl,
        thumbnailUrl: media.thumbnailUrl,
        fileName: media.fileName,
        displayOrder: media.displayOrder,
        isActive: media.isActive,
        createdAt: media.createdAt,
      })) || [],
      addresses: businessOwner.addresses?.map(addr => ({
        id: addr.id,
        streetAddress: addr.streetAddress,
        city: addr.city,
        state: addr.state,
        pincode: addr.postalCode, // Fixed field name
        latitude: addr.latitude,
        longitude: addr.longitude,
        isPrimary: addr.isPrimary,
        isActive: addr.isActive,
      })) || [],
      documents: businessOwner.documents?.map(doc => ({
        id: doc.id,
        documentType: doc.documentType,
        documentUrl: doc.documentUrl,
        status: doc.status,
        rejectionReason: doc.rejectionReason,
        uploadedAt: doc.uploadedAt,
        verifiedAt: doc.verifiedAt,
      })) || [],
      bankingInfo: businessOwner.bankingInfo ? {
        id: businessOwner.bankingInfo.id,
        bankName: businessOwner.bankingInfo.bankName,
        accountHolderName: businessOwner.bankingInfo.accountHolderName,
        accountNumber: businessOwner.bankingInfo.accountNumber, // Show clear account number
        ifscCode: businessOwner.bankingInfo.ifscCode,
        branchName: businessOwner.bankingInfo.branch,
        isVerified: businessOwner.bankingInfo.isVerified,
        createdAt: businessOwner.bankingInfo.createdAt,
      } : null,
      reviews: reviews.map(review => ({
        id: review.id,
        customerName: review.customer?.firstName + ' ' + review.customer?.lastName || 'Anonymous',
        rating: review.rating,
        comment: review.comment,
        reviewDate: review.createdAt,
        isVerifiedPurchase: true,
      })),
      approval: {
        id: approval.id,
        status: approval.status,
        assignedAgent: approval.assignedAgent ? {
          id: approval.assignedAgent.id,
          name: approval.assignedAgent.fullName,
          email: approval.assignedAgent.user?.email,
        } : null,
        reviewNotes: approval.reviewNotes,
        rejectionReason: approval.rejectionReason,
        reviewedAt: approval.reviewedAt,
        createdAt: approval.createdAt,
      },
    };
  }

  private mapToBusinessOwnerDetails(businessOwner: any, media: any[], reviews: any[]): any {
    const user = businessOwner.user;

    return {
      businessOwner: {
        id: businessOwner.id,
        firstName: businessOwner.firstName,
        lastName: businessOwner.lastName,
        email: user?.email || null,
        mobileNumber: user?.phone || null,
        businessName: businessOwner.businessName,
        businessDescription: businessOwner.businessDescription,
        isApproved: businessOwner.isApproved,
        approvedAt: businessOwner.approvedAt,
        createdAt: businessOwner.createdAt,
        updatedAt: businessOwner.updatedAt,
        upiId: businessOwner.upiId,
        creditLimit: businessOwner.creditLimit,
        vendorStatus: businessOwner.vendorStatus,
        alternateNumber: businessOwner.alternateNumber,
        remark: businessOwner.remark,
      },
      business: {
        id: businessOwner.id,
        name: businessOwner.businessName,
        description: businessOwner.businessDescription,
        phone: user?.phone || null,
        email: user?.email || null,
        isActive: businessOwner.isActive,
        createdAt: businessOwner.createdAt,
        updatedAt: businessOwner.updatedAt,
      },
      media: media?.map(mediaItem => ({
        id: mediaItem.id,
        mediaUrl: mediaItem.mediaUrl,
        mediaType: mediaItem.mediaType,
        cdnUrl: mediaItem.cdnUrl,
        thumbnailUrl: mediaItem.thumbnailUrl,
        fileName: mediaItem.fileName,
        displayOrder: mediaItem.displayOrder,
        isActive: mediaItem.isActive,
        createdAt: mediaItem.createdAt,
      })) || [],
      addresses: businessOwner.addresses?.map(addr => ({
        id: addr.id,
        streetAddress: addr.streetAddress,
        city: addr.city,
        state: addr.state,
        pincode: addr.postalCode,
        latitude: addr.latitude,
        longitude: addr.longitude,
        isPrimary: addr.isPrimary,
        isActive: addr.isActive,
      })) || [],
      documents: businessOwner.documents?.map(doc => ({
        id: doc.id,
        documentType: doc.documentType,
        documentUrl: doc.documentUrl,
        status: doc.status,
        rejectionReason: doc.rejectionReason,
        uploadedAt: doc.uploadedAt,
        verifiedAt: doc.verifiedAt,
      })) || [],
      bankingInfo: businessOwner.bankingInfo ? {
        id: businessOwner.bankingInfo.id,
        bankName: businessOwner.bankingInfo.bankName,
        accountHolderName: businessOwner.bankingInfo.accountHolderName,
        accountNumber: businessOwner.bankingInfo.accountNumber,
        ifscCode: businessOwner.bankingInfo.ifscCode,
        branchName: businessOwner.bankingInfo.branch,
        isVerified: businessOwner.bankingInfo.isVerified,
        createdAt: businessOwner.bankingInfo.createdAt,
      } : null,
      reviews: reviews.map(review => ({
        id: review.id,
        customerName: review.customer?.firstName + ' ' + review.customer?.lastName || 'Anonymous',
        rating: review.rating,
        comment: review.comment,
        reviewDate: review.createdAt,
        isVerifiedPurchase: true,
      })),
      approval: {
        status: businessOwner.isApproved ? 'approved' : 'pending',
        reviewedAt: businessOwner.approvedAt,
        createdAt: businessOwner.createdAt,
      },
    };
  }

  /**
   * Get all approved business owners
   */
  async getApprovedBusinessOwners(
    page: number = 1,
    limit: number = 10
  ): Promise<any> {
    // First get the basic business owners with primary relations
    const [businessOwners, totalItems] = await this.businessOwnerRepository.findAndCount({
      where: { 
        isApproved: true, 
        isActive: true 
      },
      relations: ['user', 'addresses', 'documents', 'bankingInfo', 'media'],
      order: { approvedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Then get reviews separately for each business (media is already loaded)
    const businessDetails: any[] = [];
    for (let i = 0; i < businessOwners.length; i++) {
      const businessOwner = businessOwners[i];
      const reviews = await this.reviewRepository.find({
        where: { businessOwnerId: businessOwner.id },
        select: ['id', 'rating', 'comment', 'createdAt'],
        relations: ['customer'],
        take: 10,
      });

      businessDetails.push(this.mapToBusinessOwnerDetails(businessOwner, businessOwner.media || [], reviews));
    }

    return {
      data: businessDetails,
      meta: this.createPaginationMeta(page, limit, totalItems),
    };
  }
}
