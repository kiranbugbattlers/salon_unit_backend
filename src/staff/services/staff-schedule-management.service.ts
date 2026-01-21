import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Staff,
  BusinessOwner,
  StaffScheduleOverride,
  StaffBreak,
} from '../../database/entities';
import {
  CreateScheduleOverrideDto,
  UpdateScheduleOverrideDto,
  ScheduleOverrideResponseDto,
  ScheduleOverrideListResponseDto,
  CreateStaffBreakDto,
  UpdateStaffBreakDto,
  StaffBreakResponseDto,
  StaffBreakListResponseDto,
} from '../dto';

@Injectable()
export class StaffScheduleManagementService {
  constructor(
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
    @InjectRepository(BusinessOwner)
    private businessOwnerRepository: Repository<BusinessOwner>,
    @InjectRepository(StaffScheduleOverride)
    private scheduleOverrideRepository: Repository<StaffScheduleOverride>,
    @InjectRepository(StaffBreak)
    private staffBreakRepository: Repository<StaffBreak>,
  ) {}

  async createScheduleOverride(
    userId: string,
    staffId: string,
    createOverrideDto: CreateScheduleOverrideDto,
  ): Promise<ScheduleOverrideResponseDto> {
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    const staff = await this.staffRepository.findOne({
      where: { id: staffId, businessOwnerId: businessOwner.id },
    });

    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }

    const date = new Date(createOverrideDto.date);
    const existingOverride = await this.scheduleOverrideRepository.findOne({
      where: { staffId, date },
    });

    if (existingOverride) {
      throw new ConflictException('Schedule override already exists for this date');
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

  async getScheduleOverrides(
    userId: string,
    staffId: string,
  ): Promise<ScheduleOverrideListResponseDto> {
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    const staff = await this.staffRepository.findOne({
      where: { id: staffId, businessOwnerId: businessOwner.id },
    });

    if (!staff) {
      throw new NotFoundException('Staff member not found');
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

  async updateScheduleOverride(
    userId: string,
    staffId: string,
    overrideId: string,
    updateOverrideDto: UpdateScheduleOverrideDto,
  ): Promise<ScheduleOverrideResponseDto> {
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    const staff = await this.staffRepository.findOne({
      where: { id: staffId, businessOwnerId: businessOwner.id },
    });

    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }

    const override = await this.scheduleOverrideRepository.findOne({
      where: { id: overrideId, staffId },
    });

    if (!override) {
      throw new NotFoundException('Schedule override not found');
    }

    this.validateOverrideTime(updateOverrideDto);

    const updatedOverride = await this.scheduleOverrideRepository.save({
      ...override,
      ...updateOverrideDto,
    });

    return this.mapOverrideToResponseDto(updatedOverride);
  }

  async deleteScheduleOverride(
    userId: string,
    staffId: string,
    overrideId: string,
  ): Promise<void> {
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    const staff = await this.staffRepository.findOne({
      where: { id: staffId, businessOwnerId: businessOwner.id },
    });

    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }

    const override = await this.scheduleOverrideRepository.findOne({
      where: { id: overrideId, staffId },
    });

    if (!override) {
      throw new NotFoundException('Schedule override not found');
    }

    await this.scheduleOverrideRepository.remove(override);
  }

  async createStaffBreak(
    userId: string,
    staffId: string,
    createBreakDto: CreateStaffBreakDto,
  ): Promise<StaffBreakResponseDto> {
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    const staff = await this.staffRepository.findOne({
      where: { id: staffId, businessOwnerId: businessOwner.id },
    });

    if (!staff) {
      throw new NotFoundException('Staff member not found');
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

  async getStaffBreaks(
    userId: string,
    staffId: string,
  ): Promise<StaffBreakListResponseDto> {
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    const staff = await this.staffRepository.findOne({
      where: { id: staffId, businessOwnerId: businessOwner.id },
    });

    if (!staff) {
      throw new NotFoundException('Staff member not found');
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

  async updateStaffBreak(
    userId: string,
    staffId: string,
    breakId: string,
    updateBreakDto: UpdateStaffBreakDto,
  ): Promise<StaffBreakResponseDto> {
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    const staff = await this.staffRepository.findOne({
      where: { id: staffId, businessOwnerId: businessOwner.id },
    });

    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }

    const staffBreak = await this.staffBreakRepository.findOne({
      where: { id: breakId, staffId },
    });

    if (!staffBreak) {
      throw new NotFoundException('Staff break not found');
    }

    this.validateBreakTime(updateBreakDto);

    const updatedData: any = { ...updateBreakDto };
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

  async deleteStaffBreak(
    userId: string,
    staffId: string,
    breakId: string,
  ): Promise<void> {
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    const staff = await this.staffRepository.findOne({
      where: { id: staffId, businessOwnerId: businessOwner.id },
    });

    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }

    const staffBreak = await this.staffBreakRepository.findOne({
      where: { id: breakId, staffId },
    });

    if (!staffBreak) {
      throw new NotFoundException('Staff break not found');
    }

    await this.staffBreakRepository.update(breakId, { isActive: false });
  }

  async deleteAllStaffBreaks(userId: string, staffId: string): Promise<void> {
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    const staff = await this.staffRepository.findOne({
      where: { id: staffId, businessOwnerId: businessOwner.id },
    });

    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }

    // Delete all staff breaks for this staff member
    await this.staffBreakRepository.delete({ staffId });
  }

  async deleteAllScheduleOverrides(userId: string, staffId: string): Promise<void> {
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    const staff = await this.staffRepository.findOne({
      where: { id: staffId, businessOwnerId: businessOwner.id },
    });

    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }

    // Delete all schedule overrides for this staff member
    await this.scheduleOverrideRepository.delete({ staffId });
  }

  private validateOverrideTime(dto: CreateScheduleOverrideDto | UpdateScheduleOverrideDto): void {
    if (dto.startTime && dto.endTime) {
      const startTime = this.timeToMinutes(dto.startTime);
      const endTime = this.timeToMinutes(dto.endTime);

      if (startTime >= endTime) {
        throw new BadRequestException('Start time must be before end time');
      }
    }
  }

  private validateBreakTime(dto: CreateStaffBreakDto | UpdateStaffBreakDto): void {
    if (dto.startTime && dto.endTime) {
      const startTime = this.timeToMinutes(dto.startTime);
      const endTime = this.timeToMinutes(dto.endTime);

      if (startTime >= endTime) {
        throw new BadRequestException('Break start time must be before end time');
      }
    }

    if (dto.effectiveFrom && dto.effectiveTo) {
      const fromDate = new Date(dto.effectiveFrom);
      const toDate = new Date(dto.effectiveTo);

      if (fromDate >= toDate) {
        throw new BadRequestException('Effective from date must be before effective to date');
      }
    }
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private mapOverrideToResponseDto(override: StaffScheduleOverride): ScheduleOverrideResponseDto {
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

  private mapBreakToResponseDto(staffBreak: StaffBreak): StaffBreakResponseDto {
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
}