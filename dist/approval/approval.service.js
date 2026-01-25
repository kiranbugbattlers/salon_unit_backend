"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../database/entities");
const enums_1 = require("../common/enums");
const dto_1 = require("./dto");
const distance_calculator_service_1 = require("../common/services/distance-calculator.service");
const notification_service_1 = require("../common/services/notification.service");
const api_response_dto_1 = require("../common/dto/api-response.dto");
let ApprovalService = class ApprovalService {
    constructor(approvalRepository, businessOwnerRepository, agentRepository, addressRepository, mediaRepository, documentRepository, bankingInfoRepository, reviewRepository, userRepository, adminRepository, distanceCalculatorService, notificationService) {
        this.approvalRepository = approvalRepository;
        this.businessOwnerRepository = businessOwnerRepository;
        this.agentRepository = agentRepository;
        this.addressRepository = addressRepository;
        this.mediaRepository = mediaRepository;
        this.documentRepository = documentRepository;
        this.bankingInfoRepository = bankingInfoRepository;
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.adminRepository = adminRepository;
        this.distanceCalculatorService = distanceCalculatorService;
        this.notificationService = notificationService;
    }
    async createApprovalRequest(businessOwnerId) {
        const existingApproval = await this.approvalRepository.findOne({
            where: { businessOwnerId, status: enums_1.ApprovalStatus.PENDING },
        });
        if (existingApproval) {
            throw new common_1.ConflictException('Approval request already exists for this business');
        }
        const businessAddress = await this.addressRepository.findOne({
            where: { businessOwnerId, isPrimary: true, isActive: true },
        });
        if (!businessAddress) {
            throw new common_1.BadRequestException('Business address not found. Cannot assign agent.');
        }
        const nearestAgent = await this.findNearestAvailableAgent({
            latitude: Number(businessAddress.latitude),
            longitude: Number(businessAddress.longitude),
        });
        if (!nearestAgent.agent) {
            throw new common_1.BadRequestException('No available agents found. Please contact admin.');
        }
        const approval = this.approvalRepository.create({
            businessOwnerId,
            assignedAgentId: nearestAgent.agent.id,
            status: enums_1.ApprovalStatus.PENDING,
            isAutoAssigned: true,
            distanceToAgentKm: nearestAgent.distance,
        });
        const savedApproval = await this.approvalRepository.save(approval);
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { id: businessOwnerId },
            select: ['businessName'],
        });
        if (businessOwner?.businessName) {
            await this.notificationService.notifyAgentOfNewApproval(nearestAgent.agent.userId, businessOwner.businessName, savedApproval.id);
        }
        return savedApproval;
    }
    async sendApprovalRequestWithResponse(businessOwnerId) {
        const existingApproval = await this.approvalRepository.findOne({
            where: { businessOwnerId, status: enums_1.ApprovalStatus.PENDING },
        });
        if (existingApproval) {
            throw new common_1.ConflictException('Approval request already exists for this business');
        }
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { id: businessOwnerId },
            relations: ['user'],
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner not found');
        }
        const businessAddress = await this.addressRepository.findOne({
            where: { businessOwnerId, isPrimary: true, isActive: true },
        });
        if (!businessAddress) {
            throw new common_1.BadRequestException('Business address not found. Cannot assign agent.');
        }
        const nearestAgent = await this.findNearestAvailableAgent({
            latitude: Number(businessAddress.latitude),
            longitude: Number(businessAddress.longitude),
        });
        if (!nearestAgent.agent) {
            throw new common_1.BadRequestException('No available agents found. Please contact admin or try again later.');
        }
        const approval = this.approvalRepository.create({
            businessOwnerId,
            assignedAgentId: nearestAgent.agent.id,
            status: enums_1.ApprovalStatus.PENDING,
            isAutoAssigned: true,
            distanceToAgentKm: nearestAgent.distance,
        });
        const savedApproval = await this.approvalRepository.save(approval);
        const assignedAgent = {
            id: nearestAgent.agent.id,
            name: nearestAgent.agent.fullName,
            email: nearestAgent.agent.user?.email,
            phone: nearestAgent.agent.user?.phone,
            employeeId: nearestAgent.agent.employeeId,
            department: nearestAgent.agent.department,
            distanceKm: nearestAgent.distance,
        };
        if (businessOwner?.businessName) {
            try {
                await this.notificationService.notifyAgentOfNewApproval(nearestAgent.agent.userId, businessOwner.businessName, savedApproval.id);
            }
            catch (error) {
                console.error('Failed to send notification to agent:', error.message);
            }
        }
        const requestInfo = {
            id: savedApproval.id,
            businessOwnerId: businessOwner.id,
            businessName: businessOwner.businessName || 'N/A',
            businessAddress: `${businessAddress.streetAddress}, ${businessAddress.city}, ${businessAddress.state}`,
            businessOwnerName: `${businessOwner.firstName || ''} ${businessOwner.lastName || ''}`.trim() || 'N/A',
            status: savedApproval.status,
            createdAt: savedApproval.createdAt,
            isAutoAssigned: savedApproval.isAutoAssigned,
        };
        const responseData = {
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
    async getAgentApprovalRequests(agentId, page = 1, limit = 10, status) {
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
        return new dto_1.ApprovalListResponseDto(200, true, 'Agent approval requests retrieved successfully', listData);
    }
    async getAllApprovalRequests(page = 1, limit = 10, status, agentId) {
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
        return new dto_1.ApprovalListResponseDto(200, true, 'All approval requests retrieved successfully', listData);
    }
    async approveBusiness(approvalId, agentId, approveDto) {
        const approval = await this.getApprovalForAgent(approvalId, agentId);
        if (approval.status !== enums_1.ApprovalStatus.PENDING) {
            throw new common_1.BadRequestException('Approval request has already been processed');
        }
        approval.status = enums_1.ApprovalStatus.APPROVED;
        approval.reviewNotes = approveDto.reviewNotes;
        approval.reviewedAt = new Date();
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { id: approval.businessOwnerId },
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business not found');
        }
        businessOwner.isApproved = true;
        businessOwner.approvedAt = new Date();
        await Promise.all([
            this.approvalRepository.save(approval),
            this.businessOwnerRepository.save(businessOwner),
        ]);
        await this.notificationService.notifyBusinessOfApprovalStatus(businessOwner.userId, businessOwner.businessName || 'Your Business', true, approveDto.reviewNotes);
        return new api_response_dto_1.ApiResponseDto(200, true, 'Business approved successfully', null);
    }
    async rejectBusiness(approvalId, agentId, rejectDto) {
        const approval = await this.getApprovalForAgent(approvalId, agentId);
        if (approval.status !== enums_1.ApprovalStatus.PENDING) {
            throw new common_1.BadRequestException('Approval request has already been processed');
        }
        approval.status = enums_1.ApprovalStatus.REJECTED;
        approval.rejectionReason = rejectDto.rejectionReason;
        approval.reviewNotes = rejectDto.reviewNotes;
        approval.reviewedAt = new Date();
        await this.approvalRepository.save(approval);
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { id: approval.businessOwnerId },
            select: ['userId', 'businessName'],
        });
        if (businessOwner) {
            await this.notificationService.notifyBusinessOfApprovalStatus(businessOwner.userId, businessOwner.businessName || 'Your Business', false, rejectDto.reviewNotes, rejectDto.rejectionReason);
        }
        return new api_response_dto_1.ApiResponseDto(200, true, 'Business rejected successfully', null);
    }
    async assignApprovalToAgent(approvalId, assignDto, adminId) {
        const approval = await this.approvalRepository.findOne({
            where: { id: approvalId },
            relations: ['businessOwner', 'assignedAgent'],
        });
        if (!approval) {
            throw new common_1.NotFoundException('Approval request not found');
        }
        if (approval.status !== enums_1.ApprovalStatus.PENDING) {
            throw new common_1.BadRequestException('Can only reassign pending approval requests');
        }
        const newAgent = await this.agentRepository.findOne({
            where: { id: assignDto.agentId, isActive: true },
        });
        if (!newAgent) {
            throw new common_1.NotFoundException('Agent not found or inactive');
        }
        let newDistance;
        const businessAddress = await this.addressRepository.findOne({
            where: { businessOwnerId: approval.businessOwnerId, isPrimary: true },
        });
        if (businessAddress) {
            newDistance = undefined;
        }
        approval.assignedAgentId = assignDto.agentId;
        approval.assignedByAdminId = adminId;
        approval.isAutoAssigned = false;
        approval.distanceToAgentKm = newDistance;
        await this.approvalRepository.save(approval);
        await this.notificationService.notifyAgentOfApprovalReassignment(newAgent.userId, approval.businessOwner.businessName || 'Business', approval.id, assignDto.reassignmentReason);
        return new api_response_dto_1.ApiResponseDto(200, true, 'Approval request reassigned successfully', null);
    }
    async getApprovalRequest(approvalId) {
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
            throw new common_1.NotFoundException('Approval request not found');
        }
        return this.mapToApprovalRequestDto(approval);
    }
    async findNearestAvailableAgent(businessCoordinates) {
        const agents = await this.agentRepository.find({
            where: { isActive: true },
            relations: ['user'],
        });
        if (!agents.length) {
            return { agent: null, distance: 0 };
        }
        const agentsWithInfo = await Promise.all(agents.map(async (agent) => {
            const pendingCount = await this.approvalRepository.count({
                where: { assignedAgentId: agent.id, status: enums_1.ApprovalStatus.PENDING },
            });
            let distance = 0;
            if (agent.latitude && agent.longitude) {
                distance = this.distanceCalculatorService.calculateDistance(businessCoordinates, { latitude: Number(agent.latitude), longitude: Number(agent.longitude) });
            }
            else {
                distance = 999999;
            }
            return { agent, pendingCount, distance };
        }));
        const availableAgents = agentsWithInfo.filter(item => item.distance <= 200);
        if (!availableAgents.length) {
            agentsWithInfo.sort((a, b) => a.pendingCount - b.pendingCount);
            return {
                agent: agentsWithInfo[0].agent,
                distance: agentsWithInfo[0].distance,
            };
        }
        availableAgents.sort((a, b) => {
            if (Math.abs(a.distance - b.distance) < 5) {
                return a.pendingCount - b.pendingCount;
            }
            return a.distance - b.distance;
        });
        return {
            agent: availableAgents[0].agent,
            distance: availableAgents[0].distance,
        };
    }
    async getApprovalForAgent(approvalId, agentId) {
        const approval = await this.approvalRepository.findOne({
            where: { id: approvalId, assignedAgentId: agentId },
            relations: ['businessOwner', 'assignedAgent'],
        });
        if (!approval) {
            throw new common_1.NotFoundException('Approval request not found or not assigned to you');
        }
        return approval;
    }
    mapToApprovalRequestDto(approval) {
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
        };
    }
    async getBusinessApprovalStatus(businessOwnerId) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { id: businessOwnerId },
            select: ['isApproved', 'approvedAt'],
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business not found');
        }
        const approval = await this.approvalRepository.findOne({
            where: { businessOwnerId },
            relations: ['assignedAgent', 'assignedAgent.user'],
            order: { createdAt: 'DESC' },
        });
        if (!approval) {
            const statusData = {
                hasApprovalRequested: false,
                isApproved: businessOwner.isApproved || false,
                statusMessage: 'No approval request found. Please complete your business onboarding first.',
            };
            return new dto_1.BusinessApprovalStatusDto(200, true, 'Business approval status retrieved successfully', statusData);
        }
        let statusMessage;
        switch (approval.status) {
            case enums_1.ApprovalStatus.PENDING:
                statusMessage = 'Your business registration is being reviewed by our team. You will be notified once a decision is made.';
                break;
            case enums_1.ApprovalStatus.UNDER_REVIEW:
                statusMessage = 'Your business registration is currently under detailed review. This may take a bit longer.';
                break;
            case enums_1.ApprovalStatus.APPROVED:
                statusMessage = 'Congratulations! Your business has been approved and is now live on our platform.';
                break;
            case enums_1.ApprovalStatus.REJECTED:
                statusMessage = 'Unfortunately, your business registration was not approved. Please review the feedback and reapply.';
                break;
            default:
                statusMessage = 'Unknown approval status.';
        }
        const statusData = {
            hasApprovalRequested: true,
            status: approval.status,
            isApproved: businessOwner.isApproved || false,
            requestedAt: approval.createdAt,
            statusMessage,
        };
        if (approval.assignedAgent) {
            statusData.assignedAgent = {
                id: approval.assignedAgent.id,
                name: approval.assignedAgent.fullName || approval.assignedAgent.user?.email?.split('@')[0] || 'Unknown Agent',
                email: approval.assignedAgent.user?.email,
                phone: approval.assignedAgent.user?.phone,
            };
        }
        if (approval.status === enums_1.ApprovalStatus.REJECTED && approval.rejectionReason) {
            statusData.rejectionReason = approval.rejectionReason;
        }
        return new dto_1.BusinessApprovalStatusDto(200, true, 'Business approval status retrieved successfully', statusData);
    }
    async getAdminPendingApprovals(page = 1, limit = 10) {
        const query = this.approvalRepository
            .createQueryBuilder('approval')
            .leftJoinAndSelect('approval.businessOwner', 'business_owner')
            .leftJoinAndSelect('business_owner.user', 'user')
            .leftJoinAndSelect('business_owner.addresses', 'address', 'address.isPrimary = true')
            .leftJoinAndSelect('approval.assignedAgent', 'agent')
            .leftJoinAndSelect('agent.user', 'agentUser')
            .where('approval.status = :status', { status: enums_1.ApprovalStatus.PENDING });
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
        return new dto_1.ApprovalListResponseDto(200, true, 'Pending approval requests retrieved successfully', listData);
    }
    async getAdminAllApprovals(page = 1, limit = 10, status) {
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
        return new dto_1.ApprovalListResponseDto(200, true, 'Admin approval requests retrieved successfully', listData);
    }
    async adminApproveBusiness(businessOwnerId, adminId, approveDto) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { id: businessOwnerId },
            relations: ['user'],
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner not found');
        }
        if (businessOwner.isApproved) {
            throw new common_1.BadRequestException('Business is already approved');
        }
        const approval = await this.approvalRepository.findOne({
            where: { businessOwnerId, status: enums_1.ApprovalStatus.PENDING },
        });
        if (!approval) {
            throw new common_1.NotFoundException('No pending approval request found for this business');
        }
        approval.status = enums_1.ApprovalStatus.APPROVED;
        approval.reviewNotes = approveDto.reviewNotes;
        approval.reviewedAt = new Date();
        if (approveDto.creditLimit !== undefined && approveDto.creditLimit !== null) {
        }
        if (businessOwner.upiId) {
        }
        if (businessOwner.vendorStatus) {
        }
        await this.approvalRepository.save(approval);
        businessOwner.isApproved = true;
        businessOwner.approvedAt = new Date();
        if (approveDto.creditLimit !== undefined && approveDto.creditLimit !== null) {
            businessOwner.creditLimit = approveDto.creditLimit;
        }
        await this.businessOwnerRepository.save(businessOwner);
        return new api_response_dto_1.ApiResponseDto(200, true, 'Business approved successfully', null);
    }
    async adminRejectBusiness(businessOwnerId, adminId, rejectDto) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { id: businessOwnerId },
            relations: ['user'],
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner not found');
        }
        const approval = await this.approvalRepository.findOne({
            where: { businessOwnerId, status: enums_1.ApprovalStatus.PENDING },
        });
        if (!approval) {
            throw new common_1.NotFoundException('No pending approval request found for this business');
        }
        approval.status = enums_1.ApprovalStatus.REJECTED;
        approval.rejectionReason = rejectDto.rejectionReason;
        approval.reviewNotes = rejectDto.reviewNotes;
        approval.reviewedAt = new Date();
        await this.approvalRepository.save(approval);
        return new api_response_dto_1.ApiResponseDto(200, true, 'Business rejected successfully', null);
    }
    createPaginationMeta(page, limit, totalItems) {
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
    async getAllBusinessesWithDetails(page = 1, limit = 10, status) {
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
        const businessDetails = await Promise.all(approvals.map(async (approval) => {
            const reviews = await this.reviewRepository.find({
                where: { businessOwnerId: approval.businessOwnerId },
                select: ['id', 'rating', 'comment', 'createdAt'],
                relations: ['customer'],
                take: 10,
            });
            return this.mapToBusinessApprovalDetails(approval, reviews);
        }));
        return {
            data: businessDetails,
            meta: this.createPaginationMeta(page, limit, totalItems),
        };
    }
    async getBusinessByIdWithDetails(businessOwnerId) {
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
            throw new common_1.NotFoundException('Business not found');
        }
        const reviews = await this.reviewRepository.find({
            where: { businessOwnerId: businessOwnerId },
            select: ['id', 'rating', 'comment', 'createdAt'],
            relations: ['customer'],
            take: 50,
        });
        return this.mapToBusinessApprovalDetails(approval, reviews);
    }
    async updateBusinessApproval(businessOwnerId, updateDto, adminId) {
        console.log('Updating business owner:', businessOwnerId, 'with data:', updateDto);
        if (updateDto.email || updateDto.mobileNumber || updateDto.phone) {
            throw new common_1.BadRequestException('Email and mobile number cannot be changed');
        }
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { id: businessOwnerId },
            relations: ['user', 'addresses', 'media', 'documents', 'bankingInfo'],
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business not found');
        }
        console.log('Found business owner:', businessOwner.id);
        const approval = await this.approvalRepository.findOne({
            where: { businessOwnerId },
        });
        if (!approval) {
            throw new common_1.NotFoundException('Approval record not found');
        }
        console.log('Found approval:', approval.id, 'current status:', approval.status);
        let hasChanges = false;
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
        if (updateDto.upiId !== undefined) {
            businessOwner.upiId = updateDto.upiId;
            hasChanges = true;
            console.log('Updated upiId to:', updateDto.upiId);
        }
        if (updateDto.creditLimit !== undefined) {
            businessOwner.creditLimit = updateDto.creditLimit;
            hasChanges = true;
            console.log('Updated creditLimit to:', updateDto.creditLimit);
        }
        if (updateDto.vendorStatus !== undefined) {
            businessOwner.vendorStatus = updateDto.vendorStatus;
            hasChanges = true;
            console.log('Updated vendorStatus to:', updateDto.vendorStatus);
        }
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
                hasChanges = true;
                console.log('Updated upiId (nested) to:', ownerData.upiId);
            }
            if (ownerData.creditLimit !== undefined) {
                businessOwner.creditLimit = ownerData.creditLimit;
                hasChanges = true;
                console.log('Updated creditLimit (nested) to:', ownerData.creditLimit);
            }
            if (ownerData.vendorStatus !== undefined) {
                businessOwner.vendorStatus = ownerData.vendorStatus;
                hasChanges = true;
                console.log('Updated vendorStatus (nested) to:', ownerData.vendorStatus);
            }
        }
        if (updateDto.streetAddress || updateDto.city || updateDto.state || updateDto.pincode || updateDto.address) {
            const primaryAddress = businessOwner.addresses?.find(addr => addr.isPrimary);
            if (primaryAddress) {
                if (updateDto.streetAddress)
                    primaryAddress.streetAddress = updateDto.streetAddress;
                if (updateDto.city)
                    primaryAddress.city = updateDto.city;
                if (updateDto.state)
                    primaryAddress.state = updateDto.state;
                if (updateDto.pincode)
                    primaryAddress.postalCode = updateDto.pincode;
                if (updateDto.latitude !== undefined)
                    primaryAddress.latitude = updateDto.latitude;
                if (updateDto.longitude !== undefined)
                    primaryAddress.longitude = updateDto.longitude;
                if (updateDto.address) {
                    const addressData = updateDto.address;
                    if (addressData.streetAddress)
                        primaryAddress.streetAddress = addressData.streetAddress;
                    if (addressData.city)
                        primaryAddress.city = addressData.city;
                    if (addressData.state)
                        primaryAddress.state = addressData.state;
                    if (addressData.pincode)
                        primaryAddress.postalCode = addressData.pincode;
                    if (addressData.latitude !== undefined)
                        primaryAddress.latitude = addressData.latitude;
                    if (addressData.longitude !== undefined)
                        primaryAddress.longitude = addressData.longitude;
                    console.log('Updated address (nested)');
                }
                await this.addressRepository.save(primaryAddress);
                hasChanges = true;
                console.log('Saved address updates');
            }
        }
        if (updateDto.bankName || updateDto.accountHolderName || updateDto.ifscCode || updateDto.branchName || updateDto.bankingInfo) {
            const bankingInfo = businessOwner.bankingInfo;
            if (bankingInfo) {
                console.log('Updating banking info, current:', bankingInfo);
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
            }
            else {
                console.log('No banking info found for business owner');
            }
        }
        if (updateDto.media && Array.isArray(updateDto.media)) {
            for (const mediaItem of updateDto.media) {
                if (mediaItem.id) {
                    const existingMedia = businessOwner.media?.find(m => m.id === mediaItem.id);
                    if (existingMedia) {
                        if (mediaItem.mediaUrl)
                            existingMedia.mediaUrl = mediaItem.mediaUrl;
                        if (mediaItem.mediaType)
                            existingMedia.mediaType = mediaItem.mediaType;
                        if (mediaItem.cdnUrl !== undefined)
                            existingMedia.cdnUrl = mediaItem.cdnUrl;
                        if (mediaItem.thumbnailUrl !== undefined)
                            existingMedia.thumbnailUrl = mediaItem.thumbnailUrl;
                        if (mediaItem.fileName !== undefined)
                            existingMedia.fileName = mediaItem.fileName;
                        if (mediaItem.displayOrder !== undefined)
                            existingMedia.displayOrder = mediaItem.displayOrder;
                        if (mediaItem.isActive !== undefined)
                            existingMedia.isActive = mediaItem.isActive;
                        await this.mediaRepository.save(existingMedia);
                    }
                }
                else {
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
        if (updateDto.documents && Array.isArray(updateDto.documents)) {
            for (const docItem of updateDto.documents) {
                if (docItem.id) {
                    const existingDoc = businessOwner.documents?.find(d => d.id === docItem.id);
                    if (existingDoc) {
                        if (docItem.documentUrl)
                            existingDoc.documentUrl = docItem.documentUrl;
                        if (docItem.documentType)
                            existingDoc.documentType = docItem.documentType;
                        if (docItem.status !== undefined)
                            existingDoc.status = docItem.status;
                        if (docItem.rejectionReason !== undefined)
                            existingDoc.rejectionReason = docItem.rejectionReason;
                        await this.documentRepository.save(existingDoc);
                    }
                }
                else {
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
        if (updateDto.approvalStatus) {
            approval.status = updateDto.approvalStatus;
            if (updateDto.reviewNotes)
                approval.reviewNotes = updateDto.reviewNotes;
            if (updateDto.rejectionReason)
                approval.rejectionReason = updateDto.rejectionReason;
            approval.reviewedAt = new Date();
            await this.approvalRepository.save(approval);
            if (updateDto.approvalStatus === enums_1.ApprovalStatus.APPROVED) {
                businessOwner.isApproved = true;
                businessOwner.approvedAt = new Date();
            }
            else if (updateDto.approvalStatus === enums_1.ApprovalStatus.REJECTED) {
                businessOwner.isApproved = false;
            }
        }
        else {
            if (businessOwner.isApproved && approval.status !== enums_1.ApprovalStatus.APPROVED) {
                approval.status = enums_1.ApprovalStatus.APPROVED;
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
        if (businessOwner.bankingInfo) {
            console.log('Final banking info state:', {
                bankName: businessOwner.bankingInfo.bankName,
                accountHolderName: businessOwner.bankingInfo.accountHolderName,
                ifscCode: businessOwner.bankingInfo.ifscCode,
                branch: businessOwner.bankingInfo.branch,
                accountNumber: businessOwner.bankingInfo.accountNumber
            });
        }
        if (hasChanges) {
            console.log('Saving business owner...');
            await this.businessOwnerRepository.save(businessOwner);
            console.log('Business owner saved successfully');
        }
        else {
            console.log('No changes to save');
        }
        console.log('Returning updated details...');
        return this.getApprovedBusinessOwnerById(businessOwnerId);
    }
    async getApprovedBusinessOwnerById(businessOwnerId) {
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
            throw new common_1.NotFoundException('Approved business owner not found');
        }
        console.log('Found business owner for response:', {
            id: businessOwner.id,
            businessName: businessOwner.businessName,
            firstName: businessOwner.firstName,
            lastName: businessOwner.lastName
        });
        if (!businessOwner.user) {
            console.warn(`User not loaded for business owner: ${businessOwnerId}`);
            const user = await this.userRepository.findOne({
                where: { id: businessOwner.userId }
            });
            businessOwner.user = user;
        }
        if (businessOwner.bankingInfo) {
            console.log('Banking info loaded for response:', {
                bankName: businessOwner.bankingInfo.bankName,
                ifscCode: businessOwner.bankingInfo.ifscCode,
                branch: businessOwner.bankingInfo.branch
            });
        }
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
    mapToBusinessApprovalDetails(approval, reviews) {
        const businessOwner = approval.businessOwner;
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
                upiId: approval.upiId || businessOwner.upiId,
                creditLimit: approval.creditLimit || businessOwner.creditLimit,
                vendorStatus: approval.vendorStatus || businessOwner.vendorStatus,
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
    mapToBusinessOwnerDetails(businessOwner, media, reviews) {
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
    async getApprovedBusinessOwners(page = 1, limit = 10) {
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
        const businessDetails = [];
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
};
exports.ApprovalService = ApprovalService;
exports.ApprovalService = ApprovalService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.BusinessApproval)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.BusinessOwner)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.Agent)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.BusinessAddress)),
    __param(4, (0, typeorm_1.InjectRepository)(entities_1.BusinessMedia)),
    __param(5, (0, typeorm_1.InjectRepository)(entities_1.BusinessDocument)),
    __param(6, (0, typeorm_1.InjectRepository)(entities_1.BankingInfo)),
    __param(7, (0, typeorm_1.InjectRepository)(entities_1.Review)),
    __param(8, (0, typeorm_1.InjectRepository)(entities_1.User)),
    __param(9, (0, typeorm_1.InjectRepository)(entities_1.Admin)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        distance_calculator_service_1.DistanceCalculatorService,
        notification_service_1.NotificationService])
], ApprovalService);
//# sourceMappingURL=approval.service.js.map