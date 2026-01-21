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
var AssignmentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../database/entities");
let AssignmentService = AssignmentService_1 = class AssignmentService {
    constructor(supportMemberRepository, mappingRepository, adminRepository, customerRepository, dataSource) {
        this.supportMemberRepository = supportMemberRepository;
        this.mappingRepository = mappingRepository;
        this.adminRepository = adminRepository;
        this.customerRepository = customerRepository;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(AssignmentService_1.name);
    }
    async autoAssignCustomer(customerId) {
        const customer = await this.customerRepository.findOne({
            where: { id: customerId },
        });
        if (!customer) {
            throw new common_1.NotFoundException(`Customer with ID ${customerId} not found`);
        }
        const existing = await this.findActiveAssignment(customerId);
        if (existing) {
            this.logger.log(`Customer ${customerId} already has active assignment`);
            return existing;
        }
        return await this.dataSource.transaction(async (manager) => {
            const supportMemberRepo = manager.getRepository(entities_1.SupportMember);
            const mappingRepo = manager.getRepository(entities_1.CustomerSupportMapping);
            const members = await supportMemberRepo.find({
                where: { isActive: true },
                order: { customerCount: 'ASC' },
            });
            let assignment;
            if (members.length > 0) {
                const selectedMember = members[0];
                assignment = mappingRepo.create({
                    customerId,
                    supportMemberId: selectedMember.id,
                    adminId: null,
                    isActive: true,
                    assignedAt: new Date(),
                });
                await supportMemberRepo.increment({ id: selectedMember.id }, 'customerCount', 1);
                this.logger.log(`Assigned customer ${customerId} to support member ${selectedMember.id} (${selectedMember.fullName})`);
            }
            else {
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
    async manualAssignCustomer(customerId, supportMemberId, notes) {
        const customer = await this.customerRepository.findOne({
            where: { id: customerId },
        });
        if (!customer) {
            throw new common_1.NotFoundException(`Customer with ID ${customerId} not found`);
        }
        if (supportMemberId) {
            const member = await this.supportMemberRepository.findOne({
                where: { id: supportMemberId },
            });
            if (!member) {
                throw new common_1.NotFoundException(`Support member with ID ${supportMemberId} not found`);
            }
            if (!member.isActive) {
                throw new common_1.BadRequestException('Cannot assign to inactive support member');
            }
        }
        return await this.dataSource.transaction(async (manager) => {
            const mappingRepo = manager.getRepository(entities_1.CustomerSupportMapping);
            const supportMemberRepo = manager.getRepository(entities_1.SupportMember);
            const existing = await this.findActiveAssignment(customerId);
            if (existing) {
                existing.isActive = false;
                await mappingRepo.save(existing);
                if (existing.supportMemberId) {
                    await supportMemberRepo.decrement({ id: existing.supportMemberId }, 'customerCount', 1);
                }
            }
            let assignment;
            if (supportMemberId) {
                assignment = mappingRepo.create({
                    customerId,
                    supportMemberId,
                    adminId: null,
                    isActive: true,
                    notes,
                    assignedAt: new Date(),
                });
                await supportMemberRepo.increment({ id: supportMemberId }, 'customerCount', 1);
            }
            else {
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
    async reassignAllCustomers(fromMemberId, toMemberId) {
        const assignments = await this.mappingRepository.find({
            where: {
                supportMemberId: fromMemberId,
                isActive: true,
            },
        });
        if (assignments.length === 0) {
            return { reassignedCount: 0 };
        }
        for (const assignment of assignments) {
            if (toMemberId) {
                await this.manualAssignCustomer(assignment.customerId, toMemberId, 'Bulk reassignment');
            }
            else {
                await this.autoAssignCustomer(assignment.customerId);
            }
        }
        this.logger.log(`Reassigned ${assignments.length} customers from member ${fromMemberId}`);
        return { reassignedCount: assignments.length };
    }
    async rebalanceAssignments() {
        const members = await this.supportMemberRepository.find({
            where: { isActive: true },
            order: { customerCount: 'ASC' },
        });
        if (members.length === 0) {
            throw new common_1.BadRequestException('No active support members to rebalance');
        }
        const assignments = await this.mappingRepository.find({
            where: { isActive: true, supportMemberId: null },
        });
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
    async recalculateCustomerCount(memberId) {
        const count = await this.mappingRepository.count({
            where: {
                supportMemberId: memberId,
                isActive: true,
            },
        });
        await this.supportMemberRepository.update({ id: memberId }, { customerCount: count });
        this.logger.log(`Recalculated customer count for member ${memberId}: ${count}`);
        return count;
    }
    async recalculateAllCustomerCounts() {
        const members = await this.supportMemberRepository.find();
        for (const member of members) {
            await this.recalculateCustomerCount(member.id);
        }
        return { updated: members.length };
    }
    async findActiveAssignment(customerId) {
        return await this.mappingRepository.findOne({
            where: {
                customerId,
                isActive: true,
            },
            relations: ['supportMember', 'admin'],
        });
    }
    async getDefaultAdmin() {
        const admin = await this.adminRepository.findOne({
            where: { isActive: true },
            order: { createdAt: 'ASC' },
        });
        if (!admin) {
            throw new common_1.NotFoundException('No active admin found');
        }
        return admin;
    }
};
exports.AssignmentService = AssignmentService;
exports.AssignmentService = AssignmentService = AssignmentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.SupportMember)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.CustomerSupportMapping)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.Admin)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.Customer)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], AssignmentService);
//# sourceMappingURL=assignment.service.js.map