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
exports.SupportMemberService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../database/entities");
const s3_service_1 = require("../common/services/s3.service");
const assignment_service_1 = require("./assignment.service");
let SupportMemberService = class SupportMemberService {
    constructor(supportMemberRepository, mappingRepository, s3Service, assignmentService) {
        this.supportMemberRepository = supportMemberRepository;
        this.mappingRepository = mappingRepository;
        this.s3Service = s3Service;
        this.assignmentService = assignmentService;
    }
    async create(createDto, adminId) {
        const existingEmail = await this.supportMemberRepository.findOne({
            where: { email: createDto.email },
        });
        if (existingEmail) {
            throw new common_1.ConflictException('Email already exists');
        }
        const existingPhone = await this.supportMemberRepository.findOne({
            where: { phone: createDto.phone },
        });
        if (existingPhone) {
            throw new common_1.ConflictException('Phone number already exists');
        }
        const supportMember = this.supportMemberRepository.create({
            ...createDto,
            dateOfBirth: createDto.dateOfBirth ? new Date(createDto.dateOfBirth) : undefined,
            createdBy: adminId,
            joiningDate: new Date(),
        });
        const savedMember = await this.supportMemberRepository.save(supportMember);
        await this.redistributeAdminAssignedCustomers();
        return savedMember;
    }
    async redistributeAdminAssignedCustomers() {
        const adminAssignedCustomers = await this.mappingRepository.find({
            where: {
                supportMemberId: null,
                isActive: true,
            },
        });
        if (adminAssignedCustomers.length === 0) {
            return;
        }
        const activeMembers = await this.supportMemberRepository.find({
            where: { isActive: true },
        });
        if (activeMembers.length === 0) {
            return;
        }
        for (const assignment of adminAssignedCustomers) {
            try {
                await this.assignmentService.autoAssignCustomer(assignment.customerId);
            }
            catch (error) {
                console.error(`Failed to reassign customer ${assignment.customerId}:`, error.message);
            }
        }
        console.log(`✅ Redistributed ${adminAssignedCustomers.length} customers from admin to support members`);
    }
    async findAll(queryDto) {
        const { page = 1, limit = 10, isActive, sortBy } = queryDto;
        const skip = (page - 1) * limit;
        const queryBuilder = this.supportMemberRepository
            .createQueryBuilder('sm')
            .leftJoinAndSelect('sm.admin', 'admin')
            .skip(skip)
            .take(limit);
        if (isActive !== undefined) {
            queryBuilder.andWhere('sm.isActive = :isActive', { isActive });
        }
        if (sortBy) {
            queryBuilder.orderBy(`sm.${sortBy}`, 'ASC');
        }
        else {
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
    async findOne(id) {
        const member = await this.supportMemberRepository.findOne({
            where: { id },
            relations: ['admin', 'customerMappings', 'customerMappings.customer'],
        });
        if (!member) {
            throw new common_1.NotFoundException(`Support member with ID ${id} not found`);
        }
        return member;
    }
    async update(id, updateDto) {
        const member = await this.findOne(id);
        if (updateDto.email && updateDto.email !== member.email) {
            const existingEmail = await this.supportMemberRepository.findOne({
                where: { email: updateDto.email },
            });
            if (existingEmail) {
                throw new common_1.ConflictException('Email already exists');
            }
        }
        if (updateDto.phone && updateDto.phone !== member.phone) {
            const existingPhone = await this.supportMemberRepository.findOne({
                where: { phone: updateDto.phone },
            });
            if (existingPhone) {
                throw new common_1.ConflictException('Phone number already exists');
            }
        }
        Object.assign(member, {
            ...updateDto,
            dateOfBirth: updateDto.dateOfBirth ? new Date(updateDto.dateOfBirth) : member.dateOfBirth,
        });
        return await this.supportMemberRepository.save(member);
    }
    async remove(id) {
        const member = await this.findOne(id);
        await this.assignmentService.reassignAllCustomers(id);
        await this.supportMemberRepository.remove(member);
    }
    async toggleActive(id) {
        const member = await this.findOne(id);
        const wasInactive = !member.isActive;
        member.isActive = !member.isActive;
        if (!member.isActive) {
            await this.assignmentService.reassignAllCustomers(id);
        }
        if (wasInactive && member.isActive) {
            await this.redistributeAdminAssignedCustomers();
        }
        return await this.supportMemberRepository.save(member);
    }
    async uploadProfilePic(id, file) {
        const member = await this.findOne(id);
        if (member.profilePic) {
            try {
                await this.s3Service.deleteFile(member.profilePic);
            }
            catch (error) {
                console.error('Failed to delete old profile picture:', error);
            }
        }
        const uploadResult = await this.s3Service.uploadFile(file, {
            folder: 'support-members/profile-pics',
        });
        member.profilePic = uploadResult.url;
        return await this.supportMemberRepository.save(member);
    }
    async getAnalytics() {
        const totalMembers = await this.supportMemberRepository.count();
        const activeMembers = await this.supportMemberRepository.count({
            where: { isActive: true },
        });
        const members = await this.supportMemberRepository.find({
            where: { isActive: true },
        });
        const totalCustomersSupported = members.reduce((sum, member) => sum + member.customerCount, 0);
        const averageCustomersPerMember = activeMembers > 0 ? totalCustomersSupported / activeMembers : 0;
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
};
exports.SupportMemberService = SupportMemberService;
exports.SupportMemberService = SupportMemberService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.SupportMember)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.CustomerSupportMapping)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        s3_service_1.S3Service,
        assignment_service_1.AssignmentService])
], SupportMemberService);
//# sourceMappingURL=support-member.service.js.map