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
exports.StaffScheduleManagementService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../../database/entities");
let StaffScheduleManagementService = class StaffScheduleManagementService {
    constructor(staffRepository, businessOwnerRepository, scheduleOverrideRepository, staffBreakRepository) {
        this.staffRepository = staffRepository;
        this.businessOwnerRepository = businessOwnerRepository;
        this.scheduleOverrideRepository = scheduleOverrideRepository;
        this.staffBreakRepository = staffBreakRepository;
    }
    async createScheduleOverride(userId, staffId, createOverrideDto) {
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
        const date = new Date(createOverrideDto.date);
        const existingOverride = await this.scheduleOverrideRepository.findOne({
            where: { staffId, date },
        });
        if (existingOverride) {
            throw new common_1.ConflictException('Schedule override already exists for this date');
        }
        this.validateOverrideTime(createOverrideDto);
        const override = this.scheduleOverrideRepository.create({
            staffId,
            date,
            overrideType: createOverrideDto.overrideType,
            startTime: createOverrideDto.startTime,
            endTime: createOverrideDto.endTime,
            reason: createOverrideDto.reason,
        });
        const savedOverride = await this.scheduleOverrideRepository.save(override);
        return this.mapOverrideToResponseDto(savedOverride);
    }
    async getScheduleOverrides(userId, staffId) {
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
        const [overrides, total] = await this.scheduleOverrideRepository
            .findAndCount({
            where: { staffId },
            order: { date: 'DESC' },
        });
        return {
            data: overrides.map(this.mapOverrideToResponseDto),
            total,
        };
    }
    async updateScheduleOverride(userId, staffId, overrideId, updateOverrideDto) {
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
        const override = await this.scheduleOverrideRepository.findOne({
            where: { id: overrideId, staffId },
        });
        if (!override) {
            throw new common_1.NotFoundException('Schedule override not found');
        }
        this.validateOverrideTime(updateOverrideDto);
        const updatedOverride = await this.scheduleOverrideRepository.save({
            ...override,
            ...updateOverrideDto,
        });
        return this.mapOverrideToResponseDto(updatedOverride);
    }
    async deleteScheduleOverride(userId, staffId, overrideId) {
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
        const override = await this.scheduleOverrideRepository.findOne({
            where: { id: overrideId, staffId },
        });
        if (!override) {
            throw new common_1.NotFoundException('Schedule override not found');
        }
        await this.scheduleOverrideRepository.remove(override);
    }
    async createStaffBreak(userId, staffId, createBreakDto) {
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
        this.validateBreakTime(createBreakDto);
        const breakData = this.staffBreakRepository.create({
            staffId,
            dayOfWeek: createBreakDto.dayOfWeek,
            startTime: createBreakDto.startTime,
            endTime: createBreakDto.endTime,
            breakType: createBreakDto.breakType,
            isRecurring: createBreakDto.isRecurring,
            effectiveFrom: createBreakDto.effectiveFrom ? new Date(createBreakDto.effectiveFrom) : undefined,
            effectiveTo: createBreakDto.effectiveTo ? new Date(createBreakDto.effectiveTo) : undefined,
        });
        const savedBreak = await this.staffBreakRepository.save(breakData);
        return this.mapBreakToResponseDto(savedBreak);
    }
    async getStaffBreaks(userId, staffId) {
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
        const [breaks, total] = await this.staffBreakRepository
            .findAndCount({
            where: { staffId, isActive: true },
            order: { dayOfWeek: 'ASC', startTime: 'ASC' },
        });
        return {
            data: breaks.map(this.mapBreakToResponseDto),
            total,
        };
    }
    async updateStaffBreak(userId, staffId, breakId, updateBreakDto) {
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
        const staffBreak = await this.staffBreakRepository.findOne({
            where: { id: breakId, staffId },
        });
        if (!staffBreak) {
            throw new common_1.NotFoundException('Staff break not found');
        }
        this.validateBreakTime(updateBreakDto);
        const updatedData = { ...updateBreakDto };
        if (updateBreakDto.effectiveFrom) {
            updatedData.effectiveFrom = new Date(updateBreakDto.effectiveFrom);
        }
        if (updateBreakDto.effectiveTo) {
            updatedData.effectiveTo = new Date(updateBreakDto.effectiveTo);
        }
        const updatedBreak = await this.staffBreakRepository.save({
            ...staffBreak,
            ...updatedData,
        });
        return this.mapBreakToResponseDto(updatedBreak);
    }
    async deleteStaffBreak(userId, staffId, breakId) {
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
        const staffBreak = await this.staffBreakRepository.findOne({
            where: { id: breakId, staffId },
        });
        if (!staffBreak) {
            throw new common_1.NotFoundException('Staff break not found');
        }
        await this.staffBreakRepository.update(breakId, { isActive: false });
    }
    async deleteAllStaffBreaks(userId, staffId) {
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
        await this.staffBreakRepository.delete({ staffId });
    }
    async deleteAllScheduleOverrides(userId, staffId) {
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
        await this.scheduleOverrideRepository.delete({ staffId });
    }
    validateOverrideTime(dto) {
        if (dto.startTime && dto.endTime) {
            const startTime = this.timeToMinutes(dto.startTime);
            const endTime = this.timeToMinutes(dto.endTime);
            if (startTime >= endTime) {
                throw new common_1.BadRequestException('Start time must be before end time');
            }
        }
    }
    validateBreakTime(dto) {
        if (dto.startTime && dto.endTime) {
            const startTime = this.timeToMinutes(dto.startTime);
            const endTime = this.timeToMinutes(dto.endTime);
            if (startTime >= endTime) {
                throw new common_1.BadRequestException('Break start time must be before end time');
            }
        }
        if (dto.effectiveFrom && dto.effectiveTo) {
            const fromDate = new Date(dto.effectiveFrom);
            const toDate = new Date(dto.effectiveTo);
            if (fromDate >= toDate) {
                throw new common_1.BadRequestException('Effective from date must be before effective to date');
            }
        }
    }
    timeToMinutes(time) {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }
    mapOverrideToResponseDto(override) {
        return {
            id: override.id,
            staffId: override.staffId,
            date: override.date,
            overrideType: override.overrideType,
            startTime: override.startTime,
            endTime: override.endTime,
            reason: override.reason,
            createdAt: override.createdAt,
        };
    }
    mapBreakToResponseDto(staffBreak) {
        return {
            id: staffBreak.id,
            staffId: staffBreak.staffId,
            dayOfWeek: staffBreak.dayOfWeek,
            startTime: staffBreak.startTime,
            endTime: staffBreak.endTime,
            breakType: staffBreak.breakType,
            isRecurring: staffBreak.isRecurring,
            isActive: staffBreak.isActive,
            effectiveFrom: staffBreak.effectiveFrom,
            effectiveTo: staffBreak.effectiveTo,
            createdAt: staffBreak.createdAt,
            updatedAt: staffBreak.updatedAt,
        };
    }
};
exports.StaffScheduleManagementService = StaffScheduleManagementService;
exports.StaffScheduleManagementService = StaffScheduleManagementService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Staff)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.BusinessOwner)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.StaffScheduleOverride)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.StaffBreak)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], StaffScheduleManagementService);
//# sourceMappingURL=staff-schedule-management.service.js.map