import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  SupportMember,
  CustomerSupportMapping,
  Admin,
  Customer,
} from '../database/entities';

@Injectable()
export class AssignmentService {
  private readonly logger = new Logger(AssignmentService.name);

  constructor(
    @InjectRepository(SupportMember)
    private supportMemberRepository: Repository<SupportMember>,
    @InjectRepository(CustomerSupportMapping)
    private mappingRepository: Repository<CustomerSupportMapping>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    private dataSource: DataSource,
  ) {}

  /**
   * Auto-assign customer to support member with lowest customer count
   * Falls back to admin if no support members exist
   */
  async autoAssignCustomer(customerId: string): Promise<CustomerSupportMapping> {
    // Check if customer exists
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    // Check if customer already has active assignment
    const existing = await this.findActiveAssignment(customerId);
    if (existing) {
      this.logger.log(`Customer ${customerId} already has active assignment`);
      return existing;
    }

    // Use transaction to ensure data consistency
    return await this.dataSource.transaction(async (manager) => {
      const supportMemberRepo = manager.getRepository(SupportMember);
      const mappingRepo = manager.getRepository(CustomerSupportMapping);

      // Find all active support members, sorted by customer count (ascending)
      const members = await supportMemberRepo.find({
        where: { isActive: true },
        order: { customerCount: 'ASC' },
      });

      let assignment: CustomerSupportMapping;

      if (members.length > 0) {
        // Assign to member with lowest customer count
        const selectedMember = members[0];

        assignment = mappingRepo.create({
          customerId,
          supportMemberId: selectedMember.id,
          adminId: null,
          isActive: true,
          assignedAt: new Date(),
        });

        // Increment member's customer count
        await supportMemberRepo.increment(
          { id: selectedMember.id },
          'customerCount',
          1,
        );

        this.logger.log(
          `Assigned customer ${customerId} to support member ${selectedMember.id} (${selectedMember.fullName})`,
        );
      } else {
        // No support members - assign to admin
        const admin = await this.getDefaultAdmin();

        assignment = mappingRepo.create({
          customerId,
          supportMemberId: null,
          adminId: admin.id,
          isActive: true,
          assignedAt: new Date(),
        });

        this.logger.log(`Assigned customer ${customerId} to admin ${admin.id} (no support members available)`);
      }

      return await mappingRepo.save(assignment);
    });
  }

  /**
   * Manually assign customer to specific support member
   */
  async manualAssignCustomer(
    customerId: string,
    supportMemberId: string | null,
    notes?: string,
  ): Promise<CustomerSupportMapping> {
    // Verify customer exists
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    // If support member specified, verify it exists and is active
    if (supportMemberId) {
      const member = await this.supportMemberRepository.findOne({
        where: { id: supportMemberId },
      });

      if (!member) {
        throw new NotFoundException(`Support member with ID ${supportMemberId} not found`);
      }

      if (!member.isActive) {
        throw new BadRequestException('Cannot assign to inactive support member');
      }
    }

    return await this.dataSource.transaction(async (manager) => {
      const mappingRepo = manager.getRepository(CustomerSupportMapping);
      const supportMemberRepo = manager.getRepository(SupportMember);

      // Deactivate existing assignment
      const existing = await this.findActiveAssignment(customerId);
      if (existing) {
        existing.isActive = false;
        await mappingRepo.save(existing);

        // Decrement old support member's count
        if (existing.supportMemberId) {
          await supportMemberRepo.decrement(
            { id: existing.supportMemberId },
            'customerCount',
            1,
          );
        }
      }

      // Create new assignment
      let assignment: CustomerSupportMapping;

      if (supportMemberId) {
        assignment = mappingRepo.create({
          customerId,
          supportMemberId,
          adminId: null,
          isActive: true,
          notes,
          assignedAt: new Date(),
        });

        // Increment new member's count
        await supportMemberRepo.increment(
          { id: supportMemberId },
          'customerCount',
          1,
        );
      } else {
        // Assign to admin
        const admin = await this.getDefaultAdmin();
        assignment = mappingRepo.create({
          customerId,
          supportMemberId: null,
          adminId: admin.id,
          isActive: true,
          notes,
          assignedAt: new Date(),
        });
      }

      return await mappingRepo.save(assignment);
    });
  }

  /**
   * Reassign all customers from one support member to another (or distribute)
   */
  async reassignAllCustomers(
    fromMemberId: string,
    toMemberId?: string,
  ): Promise<{ reassignedCount: number }> {
    // Get all active assignments for the from member
    const assignments = await this.mappingRepository.find({
      where: {
        supportMemberId: fromMemberId,
        isActive: true,
      },
    });

    if (assignments.length === 0) {
      return { reassignedCount: 0 };
    }

    // Reassign each customer
    for (const assignment of assignments) {
      if (toMemberId) {
        await this.manualAssignCustomer(assignment.customerId, toMemberId, 'Bulk reassignment');
      } else {
        await this.autoAssignCustomer(assignment.customerId);
      }
    }

    this.logger.log(`Reassigned ${assignments.length} customers from member ${fromMemberId}`);

    return { reassignedCount: assignments.length };
  }

  /**
   * Rebalance customer assignments across all active support members
   */
  async rebalanceAssignments(): Promise<{ message: string; details: any }> {
    const members = await this.supportMemberRepository.find({
      where: { isActive: true },
      order: { customerCount: 'ASC' },
    });

    if (members.length === 0) {
      throw new BadRequestException('No active support members to rebalance');
    }

    // Get all active assignments
    const assignments = await this.mappingRepository.find({
      where: { isActive: true, supportMemberId: null }, // Only get admin-assigned customers
    });

    // Redistribute admin-assigned customers to support members
    let redistributed = 0;
    for (const assignment of assignments) {
      await this.autoAssignCustomer(assignment.customerId);
      redistributed++;
    }

    return {
      message: 'Rebalancing completed',
      details: {
        activeSupportMembers: members.length,
        customersRedistributed: redistributed,
      },
    };
  }

  /**
   * Recalculate customer count for a support member
   */
  async recalculateCustomerCount(memberId: string): Promise<number> {
    const count = await this.mappingRepository.count({
      where: {
        supportMemberId: memberId,
        isActive: true,
      },
    });

    await this.supportMemberRepository.update(
      { id: memberId },
      { customerCount: count },
    );

    this.logger.log(`Recalculated customer count for member ${memberId}: ${count}`);

    return count;
  }

  /**
   * Recalculate customer counts for all support members
   */
  async recalculateAllCustomerCounts(): Promise<{ updated: number }> {
    const members = await this.supportMemberRepository.find();

    for (const member of members) {
      await this.recalculateCustomerCount(member.id);
    }

    return { updated: members.length };
  }

  /**
   * Find active assignment for a customer
   */
  async findActiveAssignment(customerId: string): Promise<CustomerSupportMapping | null> {
    return await this.mappingRepository.findOne({
      where: {
        customerId,
        isActive: true,
      },
      relations: ['supportMember', 'admin'],
    });
  }

  /**
   * Get default admin (first active admin)
   */
  private async getDefaultAdmin(): Promise<Admin> {
    const admin = await this.adminRepository.findOne({
      where: { isActive: true },
      order: { createdAt: 'ASC' },
    });

    if (!admin) {
      throw new NotFoundException('No active admin found');
    }

    return admin;
  }
}
