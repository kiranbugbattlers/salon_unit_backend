import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceCategory } from '../../database/entities';
import { S3Service } from '../../common/services/s3.service';
import {
  CreateServiceCategoryDto,
  UpdateServiceCategoryDto,
  ServiceCategoryResponseDto,
  ServiceCategoryListResponseDto,
  ServiceCategoryApiResponseDto,
  ServiceCategoryListApiResponseDto,
} from '../dto';

@Injectable()
export class ServiceCategoryService {
  constructor(
    @InjectRepository(ServiceCategory)
    private serviceCategoryRepository: Repository<ServiceCategory>,
    private s3Service: S3Service,
  ) {}

  async create(createDto: CreateServiceCategoryDto, file?: any): Promise<ServiceCategoryApiResponseDto> {
    const existingCategory = await this.serviceCategoryRepository.findOne({
      where: { name: createDto.name },
    });

    if (existingCategory) {
      throw new ConflictException('Service category with this name already exists');
    }

    const category = this.serviceCategoryRepository.create(createDto);
    let savedCategory = await this.serviceCategoryRepository.save(category);

    // Upload image if provided
    if (file) {
      const uploadResult = await this.s3Service.uploadFile(file, {
        folder: 'service-categories',
        prefix: `category-${savedCategory.id}`,
        publicRead: true,
      });

      // Update category with image info
      savedCategory = await this.serviceCategoryRepository.save({
        ...savedCategory,
        image: uploadResult.cdnUrl,
        imageS3Key: uploadResult.key,
      });
    }

    const responseData = this.mapToResponseDto(savedCategory);
    return new ServiceCategoryApiResponseDto(201, true, 'Service category created successfully', responseData);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    isActive?: boolean,
  ): Promise<ServiceCategoryListApiResponseDto> {
    const skip = (page - 1) * limit;

    const queryBuilder = this.serviceCategoryRepository
      .createQueryBuilder('category')
      .orderBy('category.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (isActive !== undefined) {
      queryBuilder.andWhere('category.isActive = :isActive', { isActive });
    }

    const [categories, total] = await queryBuilder.getManyAndCount();

    const listData: ServiceCategoryListResponseDto = {
      categories: categories.map(category => this.mapToResponseDto(category)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    return new ServiceCategoryListApiResponseDto(200, true, 'Service categories retrieved successfully', listData);
  }

  async findOne(id: string): Promise<ServiceCategoryApiResponseDto> {
    const category = await this.serviceCategoryRepository.findOne({
      where: { id },
      relations: ['services'],
    });

    if (!category) {
      throw new NotFoundException('Service category not found');
    }

    const responseData = this.mapToResponseDto(category);
    return new ServiceCategoryApiResponseDto(200, true, 'Service category retrieved successfully', responseData);
  }

  async update(id: string, updateDto: UpdateServiceCategoryDto): Promise<ServiceCategoryApiResponseDto> {
    const category = await this.serviceCategoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Service category not found');
    }

    if (updateDto.name && updateDto.name !== category.name) {
      const existingCategory = await this.serviceCategoryRepository.findOne({
        where: { name: updateDto.name },
      });

      if (existingCategory) {
        throw new ConflictException('Service category with this name already exists');
      }
    }

    const updatedCategory = await this.serviceCategoryRepository.save({
      ...category,
      ...updateDto,
    });

    const responseData = this.mapToResponseDto(updatedCategory);
    return new ServiceCategoryApiResponseDto(200, true, 'Service category updated successfully', responseData);
  }

  async remove(id: string): Promise<void> {
    const category = await this.serviceCategoryRepository.findOne({
      where: { id },
      relations: ['services'],
    });

    if (!category) {
      throw new NotFoundException('Service category not found');
    }

    if (category.services && category.services.length > 0) {
      throw new BadRequestException('Cannot delete category with associated services');
    }

    await this.serviceCategoryRepository.remove(category);
  }

  async toggleActive(id: string): Promise<ServiceCategoryApiResponseDto> {
    const category = await this.serviceCategoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Service category not found');
    }

    const updatedCategory = await this.serviceCategoryRepository.save({
      ...category,
      isActive: !category.isActive,
    });

    const responseData = this.mapToResponseDto(updatedCategory);
    return new ServiceCategoryApiResponseDto(200, true, 'Service category status toggled successfully', responseData);
  }

  async uploadImage(id: string, file: any): Promise<{ categoryImage: string; categoryImageCdnUrl: string; categoryImageS3Key: string }> {
    const category = await this.serviceCategoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Service category not found');
    }

    // Delete old image if it exists
    if (category.imageS3Key) {
      try {
        await this.s3Service.deleteFile(category.imageS3Key);
      } catch (error) {
        console.warn('Failed to delete old category image:', error);
      }
    }

    // Upload new image
    const uploadResult = await this.s3Service.uploadFile(file, {
      folder: 'service-categories',
      prefix: `category-${id}`,
      publicRead: true,
    });

    // Update category with new image info
    await this.serviceCategoryRepository.update(id, {
      image: uploadResult.cdnUrl,
      imageS3Key: uploadResult.key,
    });

    return {
      categoryImage: uploadResult.url,
      categoryImageCdnUrl: uploadResult.cdnUrl,
      categoryImageS3Key: uploadResult.key,
    };
  }

  async deleteImage(id: string): Promise<{ message: string }> {
    const category = await this.serviceCategoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Service category not found');
    }

    if (!category.imageS3Key) {
      throw new NotFoundException('No image found for this category');
    }

    // Delete from S3
    await this.s3Service.deleteFile(category.imageS3Key);

    // Update category to remove image references
    await this.serviceCategoryRepository.update(id, {
      image: null,
      imageS3Key: null,
    });

    return { message: 'Category image deleted successfully' };
  }

  private mapToResponseDto(category: ServiceCategory): ServiceCategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      image: category.image,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}