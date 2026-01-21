import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service, ServiceCategory } from '../../database/entities';
import { S3Service } from '../../common/services/s3.service';
import { ServiceGenderEnum } from '../../common/enums/service-gender.enum';
import {
  CreateServiceDto,
  UpdateServiceDto,
  ServiceResponseDto,
  ServiceListResponseDto,
  ServicesGroupedByCategoryResponseDto,
  CategoryWithServicesDto,
  ServiceInCategoryDto,
} from '../dto';

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(ServiceCategory)
    private serviceCategoryRepository: Repository<ServiceCategory>,
    private s3Service: S3Service,
  ) {}

  async create(createDto: CreateServiceDto, file?: any): Promise<ServiceResponseDto> {
    // Validate category exists
    const category = await this.serviceCategoryRepository.findOne({
      where: { id: createDto.categoryId, isActive: true },
    });

    if (!category) {
      throw new NotFoundException('Service category not found or inactive');
    }

    // Check if service with same name exists in the category
    const existingService = await this.serviceRepository.findOne({
      where: { name: createDto.name, categoryId: createDto.categoryId },
    });

    if (existingService) {
      throw new ConflictException('Service with this name already exists in the category');
    }

    // Validate gender if provided
    if (createDto.gender && !Object.values(ServiceGenderEnum).includes(createDto.gender)) {
      throw new BadRequestException(`Invalid gender: ${createDto.gender}. Must be one of: ${Object.values(ServiceGenderEnum).join(', ')}`);
    }

    // Create service
    const service = this.serviceRepository.create(createDto);
    let savedService = await this.serviceRepository.save(service);

    // Upload image if provided
    if (file) {
      const uploadResult = await this.s3Service.uploadFile(file, {
        folder: 'services',
        prefix: `service-${savedService.id}`,
        publicRead: true,
      });

      // Update service with image info
      savedService = await this.serviceRepository.save({
        ...savedService,
        image: uploadResult.cdnUrl,
        imageS3Key: uploadResult.key,
      });
    }

    return this.findOne(savedService.id);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    categoryId?: string,
    isActive?: boolean,
    availableAtHome?: boolean,
  ): Promise<ServiceListResponseDto> {
    const skip = (page - 1) * limit;

    const queryBuilder = this.serviceRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.category', 'category')
      .orderBy('service.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (categoryId) {
      queryBuilder.andWhere('service.categoryId = :categoryId', { categoryId });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('service.isActive = :isActive', { isActive });
    }

    if (availableAtHome !== undefined) {
      queryBuilder.andWhere('service.availableAtHome = :availableAtHome', { availableAtHome });
    }

    const [services, total] = await queryBuilder.getManyAndCount();

    return {
      data: services.map(service => this.mapToResponseDto(service)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<ServiceResponseDto> {
    const service = await this.serviceRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.category', 'category')
      .where('service.id = :id', { id })
      .getOne();

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return this.mapToResponseDto(service);
  }

  async update(id: string, updateDto: UpdateServiceDto): Promise<ServiceResponseDto> {
    const service = await this.serviceRepository.findOne({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Validate category if being updated
    if (updateDto.categoryId && updateDto.categoryId !== service.categoryId) {
      const category = await this.serviceCategoryRepository.findOne({
        where: { id: updateDto.categoryId, isActive: true },
      });

      if (!category) {
        throw new NotFoundException('Service category not found or inactive');
      }
    }

    // Check name uniqueness if being updated
    if (updateDto.name && updateDto.name !== service.name) {
      const existingService = await this.serviceRepository.findOne({
        where: {
          name: updateDto.name,
          categoryId: updateDto.categoryId || service.categoryId
        },
      });

      if (existingService && existingService.id !== id) {
        throw new ConflictException('Service with this name already exists in the category');
      }
    }

    // Validate gender if provided
    if (updateDto.gender && !Object.values(ServiceGenderEnum).includes(updateDto.gender)) {
      throw new BadRequestException(`Invalid gender: ${updateDto.gender}. Must be one of: ${Object.values(ServiceGenderEnum).join(', ')}`);
    }

    // Update service
    const updatedService = await this.serviceRepository.save({
      ...service,
      ...updateDto,
    });

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: ['staffServices'],
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (service.staffServices && service.staffServices.length > 0) {
      throw new BadRequestException('Cannot delete service with staff assignments');
    }

    // Check if service is used in any bookings
    const bookingServicesCount = await this.serviceRepository.manager.query(
      'SELECT COUNT(*) as count FROM booking_services WHERE service_id = $1',
      [id]
    );

    if (bookingServicesCount && bookingServicesCount[0]?.count > 0) {
      throw new BadRequestException(
        'Cannot delete service that has been used in bookings. Consider deactivating it instead.'
      );
    }

    // Remove service
    await this.serviceRepository.remove(service);
  }

  async toggleActive(id: string): Promise<ServiceResponseDto> {
    const service = await this.serviceRepository.findOne({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const updatedService = await this.serviceRepository.save({
      ...service,
      isActive: !service.isActive,
    });

    return this.findOne(id);
  }

  async findServicesGroupedByCategory(
    page: number = 1,
    limit: number = 10,
    isActive?: boolean,
    availableAtHome?: boolean,
  ): Promise<ServicesGroupedByCategoryResponseDto> {
    const skip = (page - 1) * limit;

    // First get all active categories
    const categoryQuery = this.serviceCategoryRepository
      .createQueryBuilder('category')
      .where('category.isActive = :isActive', { isActive: true })
      .orderBy('category.name', 'ASC');

    const categories = await categoryQuery.getMany();

    // Get services for each category
    const categoriesWithServices: CategoryWithServicesDto[] = [];

    for (const category of categories) {
      const serviceQuery = this.serviceRepository
        .createQueryBuilder('service')
        .where('service.categoryId = :categoryId', { categoryId: category.id });

      if (isActive !== undefined) {
        serviceQuery.andWhere('service.isActive = :isActive', { isActive });
      }

      if (availableAtHome !== undefined) {
        serviceQuery.andWhere('service.availableAtHome = :availableAtHome', { availableAtHome });
      }

      serviceQuery.orderBy('service.name', 'ASC');

      const services = await serviceQuery.getMany();

      // Only include categories that have services
      if (services.length > 0) {
        categoriesWithServices.push({
          id: category.id,
          name: category.name,
          description: category.description,
          image: category.image,
          isActive: category.isActive,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
          services: services.map(service => this.mapToServiceInCategoryDto(service)),
        });
      }
    }

    // Apply pagination to categories
    const total = categoriesWithServices.length;
    const paginatedCategories = categoriesWithServices.slice(skip, skip + limit);

    return new ServicesGroupedByCategoryResponseDto(
      200,
      true,
      'Services grouped by categories retrieved successfully',
      {
        categories: paginatedCategories,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    );
  }

  async findByCategory(categoryId: string): Promise<ServiceResponseDto[]> {
    const services = await this.serviceRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.category', 'category')
      .where('service.categoryId = :categoryId', { categoryId })
      .andWhere('service.isActive = :isActive', { isActive: true })
      .orderBy('service.name', 'ASC')
      .getMany();

    return services.map(service => this.mapToResponseDto(service));
  }

  async uploadImage(id: string, file: any): Promise<{ serviceImage: string; serviceImageCdnUrl: string; serviceImageS3Key: string }> {
    const service = await this.serviceRepository.findOne({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Delete old image if it exists
    if (service.imageS3Key) {
      try {
        await this.s3Service.deleteFile(service.imageS3Key);
      } catch (error) {
        console.warn('Failed to delete old service image:', error);
      }
    }

    // Upload new image
    const uploadResult = await this.s3Service.uploadFile(file, {
      folder: 'services',
      prefix: `service-${id}`,
      publicRead: true,
    });

    // Update service with new image info
    await this.serviceRepository.update(id, {
      image: uploadResult.cdnUrl,
      imageS3Key: uploadResult.key,
    });

    return {
      serviceImage: uploadResult.url,
      serviceImageCdnUrl: uploadResult.cdnUrl,
      serviceImageS3Key: uploadResult.key,
    };
  }

  async deleteImage(id: string): Promise<{ message: string }> {
    const service = await this.serviceRepository.findOne({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (!service.imageS3Key) {
      throw new NotFoundException('No image found for this service');
    }

    // Delete from S3
    await this.s3Service.deleteFile(service.imageS3Key);

    // Update service to remove image references
    await this.serviceRepository.update(id, {
      image: null,
      imageS3Key: null,
    });

    return { message: 'Service image deleted successfully' };
  }

  private mapToResponseDto(service: Service): ServiceResponseDto {
    return {
      id: service.id,
      name: service.name,
      description: service.description,
      image: service.image,
      basePrice: service.basePrice,
      defaultDuration: service.defaultDuration,
      availableAtHome: service.availableAtHome,
      isActive: service.isActive,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
      category: {
        id: service.category.id,
        name: service.category.name,
        description: service.category.description,
        image: service.category.image,
        isActive: service.category.isActive,
        createdAt: service.category.createdAt,
        updatedAt: service.category.updatedAt,
      },
      gender: service.gender,
    };
  }

  private mapToServiceInCategoryDto(service: Service): ServiceInCategoryDto {
    return {
      id: service.id,
      name: service.name,
      description: service.description,
      image: service.image,
      basePrice: service.basePrice,
      defaultDuration: service.defaultDuration,
      availableAtHome: service.availableAtHome,
      isActive: service.isActive,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
      gender: service.gender,
    };
  }
}