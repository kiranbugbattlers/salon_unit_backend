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
  Service,
  StaffService as StaffServiceEntity,
} from '../../database/entities';
import {
  AssignServiceDto,
  UpdateStaffServiceDto,
  StaffServiceResponseDto,
  StaffServiceListResponseDto,
} from '../dto';

@Injectable()
export class StaffServiceManagementService {
  constructor(
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
    @InjectRepository(BusinessOwner)
    private businessOwnerRepository: Repository<BusinessOwner>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(StaffServiceEntity)
    private staffServiceRepository: Repository<StaffServiceEntity>,
  ) {}

  async assignService(
    userId: string,
    staffId: string,
    assignServiceDto: AssignServiceDto,
  ): Promise<StaffServiceResponseDto> {
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

    const service = await this.serviceRepository.findOne({
      where: { id: assignServiceDto.serviceId, isActive: true },
      relations: ['category'],
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const existingAssignment = await this.staffServiceRepository.findOne({
      where: { staffId, serviceId: assignServiceDto.serviceId },
    });

    if (existingAssignment && existingAssignment.isActive) {
      throw new ConflictException('Service already assigned to this staff member');
    }

    let staffService: StaffServiceEntity;

    if (existingAssignment && !existingAssignment.isActive) {
      staffService = await this.staffServiceRepository.save({
        ...existingAssignment,
        customPrice: assignServiceDto.customPrice,
        customDurationMinutes: assignServiceDto.customDurationMinutes,
        isActive: true,
      });
    } else {
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

  async getStaffServices(
    userId: string,
    staffId: string,
  ): Promise<StaffServiceListResponseDto> {
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

  async updateStaffService(
    userId: string,
    staffId: string,
    serviceId: string,
    updateStaffServiceDto: UpdateStaffServiceDto,
  ): Promise<StaffServiceResponseDto> {
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

    const staffService = await this.staffServiceRepository.findOne({
      where: { staffId, serviceId, isActive: true },
      relations: ['service', 'service.category'],
    });

    if (!staffService) {
      throw new NotFoundException('Service assignment not found');
    }

    const updatedStaffService = await this.staffServiceRepository.save({
      ...staffService,
      ...updateStaffServiceDto,
    });

    return this.mapToResponseDto(updatedStaffService, updatedStaffService.service);
  }

  async removeStaffService(
    userId: string,
    staffId: string,
    serviceId: string,
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

    const staffService = await this.staffServiceRepository.findOne({
      where: { staffId, serviceId, isActive: true },
    });

    if (!staffService) {
      throw new NotFoundException('Service assignment not found');
    }

    await this.staffServiceRepository.update(staffService.id, { isActive: false });
  }

  private mapToResponseDto(
    staffService: StaffServiceEntity,
    service: Service,
  ): StaffServiceResponseDto {
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
}