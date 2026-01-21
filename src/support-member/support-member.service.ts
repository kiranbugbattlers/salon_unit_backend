import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportMember, CustomerSupportMapping } from '../database/entities';
import { CreateSupportMemberDto } from './dto/create-support-member.dto';
import { UpdateSupportMemberDto } from './dto/update-support-member.dto';
import { SupportMemberQueryDto } from './dto/support-member-query.dto';
import { S3Service } from '../common/services/s3.service';
import { AssignmentService } from './assignment.service';

@Injectable()
export class SupportMemberService {
  constructor(
    @InjectRepository(SupportMember)
    private supportMemberRepository: Repository<SupportMember>,
    @InjectRepository(CustomerSupportMapping)
    private mappingRepository: Repository<CustomerSupportMapping>,
    private s3Service: S3Service,
    private assignmentService: AssignmentService,
  ) {}

  async create(
    createDto: CreateSupportMemberDto,
    adminId: string,
  ): Promise<SupportMember> {
    // Check for duplicate email
    const existingEmail = await this.supportMemberRepository.findOne({
      where: { email: createDto.email },
    });

    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    // Check for duplicate phone
    const existingPhone = await this.supportMemberRepository.findOne({
      where: { phone: createDto.phone },
    });

    if (existingPhone) {
      throw new ConflictException('Phone number already exists');
    }

    const supportMember = this.supportMemberRepository.create({
      ...createDto,
      dateOfBirth: createDto.dateOfBirth ? new Date(createDto.dateOfBirth) : undefined,
      createdBy: adminId,
      joiningDate: new Date(),
    });

    const savedMember = await this.supportMemberRepository.save(supportMember);

    // **AUTO-ASSIGN FEATURE**: After creating support member,
    // check if there are customers assigned to admin and redistribute them
    await this.redistributeAdminAssignedCustomers();

    return savedMember;
  }

  /**
   * Redistribute customers currently assigned to admin to support members
   * This runs automatically when a new support member is created
   */
  private async redistributeAdminAssignedCustomers(): Promise<void> {
    // Find all customers currently assigned to admin (supportMemberId = null)
    const adminAssignedCustomers = await this.mappingRepository.find({
      where: {
        supportMemberId: null, // These are with admin
        isActive: true,
      },
    });

    if (adminAssignedCustomers.length === 0) {
      return; // No customers to redistribute
    }

    // Get all active support members
    const activeMembers = await this.supportMemberRepository.find({
      where: { isActive: true },
    });

    if (activeMembers.length === 0) {
      return; // No support members to assign to
    }

    // Redistribute each admin-assigned customer
    for (const assignment of adminAssignedCustomers) {
      try {
        // Use auto-assignment to assign to member with lowest count
        await this.assignmentService.autoAssignCustomer(assignment.customerId);
      } catch (error) {
        console.error(
          `Failed to reassign customer ${assignment.customerId}:`,
          error.message,
        );
        // Continue with other customers even if one fails
      }
    }

    console.log(
      `✅ Redistributed ${adminAssignedCustomers.length} customers from admin to support members`,
    );
  }

  async findAll(queryDto: SupportMemberQueryDto): Promise<{
    data: SupportMember[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10, isActive, sortBy } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.supportMemberRepository
      .createQueryBuilder('sm')
      .leftJoinAndSelect('sm.admin', 'admin')
      .skip(skip)
      .take(limit);

    // Apply filters
    if (isActive !== undefined) {
      queryBuilder.andWhere('sm.isActive = :isActive', { isActive });
    }

    // Apply sorting
    if (sortBy) {
      queryBuilder.orderBy(`sm.${sortBy}`, 'ASC');
    } else {
      queryBuilder.orderBy('sm.customerCount', 'ASC');
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<SupportMember> {
    const member = await this.supportMemberRepository.findOne({
      where: { id },
      relations: ['admin', 'customerMappings', 'customerMappings.customer'],
    });

    if (!member) {
      throw new NotFoundException(`Support member with ID ${id} not found`);
    }

    return member;
  }

  async update(id: string, updateDto: UpdateSupportMemberDto): Promise<SupportMember> {
    const member = await this.findOne(id);

    // Check for duplicate email if being updated
    if (updateDto.email && updateDto.email !== member.email) {
      const existingEmail = await this.supportMemberRepository.findOne({
        where: { email: updateDto.email },
      });

      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    // Check for duplicate phone if being updated
    if (updateDto.phone && updateDto.phone !== member.phone) {
      const existingPhone = await this.supportMemberRepository.findOne({
        where: { phone: updateDto.phone },
      });

      if (existingPhone) {
        throw new ConflictException('Phone number already exists');
      }
    }

    Object.assign(member, {
      ...updateDto,
      dateOfBirth: updateDto.dateOfBirth ? new Date(updateDto.dateOfBirth) : member.dateOfBirth,
    });

    return await this.supportMemberRepository.save(member);
  }

  async remove(id: string): Promise<void> {
    const member = await this.findOne(id);

    // Reassign all customers before deletion
    await this.assignmentService.reassignAllCustomers(id);

    await this.supportMemberRepository.remove(member);
  }

  async toggleActive(id: string): Promise<SupportMember> {
    const member = await this.findOne(id);
    const wasInactive = !member.isActive;
    member.isActive = !member.isActive;

    // If being deactivated, reassign their customers to other members
    if (!member.isActive) {
      await this.assignmentService.reassignAllCustomers(id);
    }

    // If being activated, redistribute admin-assigned customers
    if (wasInactive && member.isActive) {
      await this.redistributeAdminAssignedCustomers();
    }

    return await this.supportMemberRepository.save(member);
  }

  async uploadProfilePic(
    id: string,
    file: Express.Multer.File,
  ): Promise<SupportMember> {
    const member = await this.findOne(id);

    // Delete old profile pic if exists
    if (member.profilePic) {
      try {
        await this.s3Service.deleteFile(member.profilePic);
      } catch (error) {
        // Log but don't fail
        console.error('Failed to delete old profile picture:', error);
      }
    }

    // Upload new profile pic
    const uploadResult = await this.s3Service.uploadFile(file, {
      folder: 'support-members/profile-pics',
    });

    member.profilePic = uploadResult.url;

    return await this.supportMemberRepository.save(member);
  }

  async getAnalytics(): Promise<{
    totalMembers: number;
    activeMembers: number;
    totalCustomersSupported: number;
    averageCustomersPerMember: number;
    memberDistribution: any[];
  }> {
    const totalMembers = await this.supportMemberRepository.count();
    const activeMembers = await this.supportMemberRepository.count({
      where: { isActive: true },
    });

    const members = await this.supportMemberRepository.find({
      where: { isActive: true },
    });

    const totalCustomersSupported = members.reduce(
      (sum, member) => sum + member.customerCount,
      0,
    );

    const averageCustomersPerMember =
      activeMembers > 0 ? totalCustomersSupported / activeMembers : 0;

    const memberDistribution = members.map((member) => ({
      id: member.id,
      name: member.fullName,
      customerCount: member.customerCount,
    }));

    return {
      totalMembers,
      activeMembers,
      totalCustomersSupported,
      averageCustomersPerMember: Math.round(averageCustomersPerMember * 100) / 100,
      memberDistribution,
    };
  }
}
