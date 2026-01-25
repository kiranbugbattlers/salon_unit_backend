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
exports.StaffServiceManagementService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../../database/entities");
let StaffServiceManagementService = class StaffServiceManagementService {
    constructor(staffRepository, businessOwnerRepository, serviceRepository, staffServiceRepository) {
        this.staffRepository = staffRepository;
        this.businessOwnerRepository = businessOwnerRepository;
        this.serviceRepository = serviceRepository;
        this.staffServiceRepository = staffServiceRepository;
    }
    async assignService(userId, staffId, assignServiceDto) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { userId },
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner not found');
        }
        const staff = await this.staffRepository.findOne({
            where: { id: staffId, businessOwnerId: businessOwner.id },
        });
        if (!staff) {
            throw new common_1.NotFoundException('Staff member not found');
        }
        const service = await this.serviceRepository.findOne({
            where: { id: assignServiceDto.serviceId, isActive: true },
            relations: ['category'],
        });
        if (!service) {
            throw new common_1.NotFoundException('Service not found');
        }
        const existingAssignment = await this.staffServiceRepository.findOne({
            where: { staffId, serviceId: assignServiceDto.serviceId },
        });
        if (existingAssignment && existingAssignment.isActive) {
            throw new common_1.ConflictException('Service already assigned to this staff member');
        }
        let staffService;
        if (existingAssignment && !existingAssignment.isActive) {
            staffService = await this.staffServiceRepository.save({
                ...existingAssignment,
                customPrice: assignServiceDto.customPrice,
                customDurationMinutes: assignServiceDto.customDurationMinutes,
                isActive: true,
            });
        }
        else {
            staffService = this.staffServiceRepository.create({
                staffId,
                serviceId: assignServiceDto.serviceId,
                customPrice: assignServiceDto.customPrice,
                customDurationMinutes: assignServiceDto.customDurationMinutes,
            });
            staffService = await this.staffServiceRepository.save(staffService);
        }
        return this.mapToResponseDto(staffService, service);
    }
    async getStaffServices(userId, staffId) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { userId },
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner not found');
        }
        const staff = await this.staffRepository.findOne({
            where: { id: staffId, businessOwnerId: businessOwner.id },
        });
        if (!staff) {
            throw new common_1.NotFoundException('Staff member not found');
        }
        const [staffServices, total] = await this.staffServiceRepository
            .createQueryBuilder('staffService')
            .leftJoinAndSelect('staffService.service', 'service')
            .leftJoinAndSelect('service.category', 'category')
            .where('staffService.staffId = :staffId', { staffId })
            .andWhere('staffService.isActive = :isActive', { isActive: true })
            .orderBy('staffService.createdAt', 'DESC')
            .getManyAndCount();
        return {
            data: staffServices.map(ss => this.mapToResponseDto(ss, ss.service)),
            total,
        };
    }
    async updateStaffService(userId, staffId, serviceId, updateStaffServiceDto) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { userId },
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner not found');
        }
        const staff = await this.staffRepository.findOne({
            where: { id: staffId, businessOwnerId: businessOwner.id },
        });
        if (!staff) {
            throw new common_1.NotFoundException('Staff member not found');
        }
        const staffService = await this.staffServiceRepository.findOne({
            where: { staffId, serviceId, isActive: true },
            relations: ['service', 'service.category'],
        });
        if (!staffService) {
            throw new common_1.NotFoundException('Service assignment not found');
        }
        const updatedStaffService = await this.staffServiceRepository.save({
            ...staffService,
            ...updateStaffServiceDto,
        });
        return this.mapToResponseDto(updatedStaffService, updatedStaffService.service);
    }
    async removeStaffService(userId, staffId, serviceId) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { userId },
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner not found');
        }
        const staff = await this.staffRepository.findOne({
            where: { id: staffId, businessOwnerId: businessOwner.id },
        });
        if (!staff) {
            throw new common_1.NotFoundException('Staff member not found');
        }
        const staffService = await this.staffServiceRepository.findOne({
            where: { staffId, serviceId, isActive: true },
        });
        if (!staffService) {
            throw new common_1.NotFoundException('Service assignment not found');
        }
        await this.staffServiceRepository.update(staffService.id, { isActive: false });
    }
    mapToResponseDto(staffService, service) {
        return {
            id: staffService.id,
            staffId: staffService.staffId,
            serviceId: staffService.serviceId,
            customPrice: staffService.customPrice,
            customDurationMinutes: staffService.customDurationMinutes,
            isActive: staffService.isActive,
            createdAt: staffService.createdAt,
            service: {
                id: service.id,
                name: service.name,
                description: service.description,
                basePrice: service.basePrice,
                baseDurationMinutes: service.defaultDuration,
                isActive: service.isActive,
                category: {
                    id: service.category.id,
                    name: service.category.name,
                    description: service.category.description,
                    isActive: service.category.isActive,
                },
            },
        };
    }
};
exports.StaffServiceManagementService = StaffServiceManagementService;
exports.StaffServiceManagementService = StaffServiceManagementService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Staff)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.BusinessOwner)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.Service)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.StaffService)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], StaffServiceManagementService);
//# sourceMappingURL=staff-service-management.service.js.map