import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BusinessOwner,
  ServicePackage,
} from '../database/entities';
import {
  ServicePackageResponseDto,
  ServicePackageListResponseDto,
  ServicePackageListDataDto,
  ServicePackageItemResponseDto,
} from '../business-owner/dto';

@Injectable()
export class BrowseService {
  constructor(
    @InjectRepository(BusinessOwner)
    private businessOwnerRepository: Repository<BusinessOwner>,
    @InjectRepository(ServicePackage)
    private servicePackageRepository: Repository<ServicePackage>,
  ) {}

  /**
   * Browse all service packages for a business by shopId (Public endpoint)
   */
  async browseServicePackages(
    shopId: string,
    page: number = 1,
    limit: number = 10,
    isActive: boolean = true, // Default to only active packages for public access
  ): Promise<ServicePackageListResponseDto> {
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { shopId, isApproved: true, isDefaulter: false },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business not found');
    }

    const skip = (page - 1) * limit;

    const queryBuilder = this.servicePackageRepository
      .createQueryBuilder('package')
      .leftJoinAndSelect('package.packageItems', 'packageItem')
      .leftJoinAndSelect('packageItem.businessService', 'businessService')
      .leftJoinAndSelect('businessService.service', 'service')
      .leftJoinAndSelect('service.category', 'category')
      .where('package.businessOwnerId = :businessOwnerId', { businessOwnerId: businessOwner.id })
      .andWhere('package.isActive = :isActive', { isActive })
      .andWhere('businessService.isActive = :businessServiceIsActive', { businessServiceIsActive: true })
      .orderBy('package.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [packages, total] = await queryBuilder.getManyAndCount();

    const packageData = packages.map(pkg => this.mapToServicePackageResponseDto(pkg));

    const responseData: ServicePackageListDataDto = {
      packages: packageData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    return new ServicePackageListResponseDto(
      200,
      true,
      'Service packages retrieved successfully',
      responseData
    );
  }

  /**
   * Browse a single service package by ID and shopId (Public endpoint)
   */
  async browseServicePackageById(shopId: string, packageId: string): Promise<ServicePackageResponseDto> {
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { shopId, isApproved: true, isDefaulter: false },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business not found');
    }

    const servicePackage = await this.servicePackageRepository.findOne({
      where: {
        id: packageId,
        businessOwnerId: businessOwner.id,
        isActive: true // Only return active packages for public access
      },
      relations: [
        'packageItems',
        'packageItems.businessService',
        'packageItems.businessService.service',
        'packageItems.businessService.service.category',
      ],
    });

    if (!servicePackage) {
      throw new NotFoundException('Service package not found');
    }

    // Filter out inactive business services for public access
    servicePackage.packageItems = servicePackage.packageItems.filter(
      item => item.businessService.isActive
    );

    return this.mapToServicePackageResponseDto(servicePackage);
  }

  /**
   * Map ServicePackage entity to ServicePackageResponseDto
   */
  private mapToServicePackageResponseDto(servicePackage: ServicePackage): ServicePackageResponseDto {
    const packageItems = servicePackage.packageItems || [];

    // Calculate pricing
    let totalOriginalPrice = 0;
    let totalDiscountedPrice = 0;
    let totalDurationMinutes = 0;

    const services: ServicePackageItemResponseDto[] = packageItems.map(item => {
      const originalPrice = Number(item.businessService.customPrice);
      const effectiveDuration = item.businessService.customDurationMinutes || item.businessService.service?.defaultDuration || 0;

      totalOriginalPrice += originalPrice;
      totalDurationMinutes += effectiveDuration;

      if (effectiveDuration === 0) {
        console.warn(`⚠️ Service ${item.businessService.id} (${item.businessService.service.name}) in package ${servicePackage.id} has 0 duration. customDurationMinutes: ${item.businessService.customDurationMinutes}, defaultDuration: ${item.businessService.service?.defaultDuration}`);
      }

      return {
        id: item.id,
        businessServiceId: item.businessServiceId,
        serviceName: item.businessService.service.name,
        serviceDescription: item.businessService.service.description || '',
        serviceCategoryName: item.businessService.service.category.name,
        defaultPrice: Number(item.businessService.service.basePrice) || 0,
        customPrice: originalPrice,
        defaultDurationMinutes: item.businessService.service.defaultDuration || 0,
        customDurationMinutes: item.businessService.customDurationMinutes,
        effectiveDurationMinutes: effectiveDuration,
        finalPrice: 0, // Will be calculated after package discount is applied
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    });

    // Apply package discount to the total original price
    const discountPercent = Number(servicePackage.discountPercentage) || 0;
    const packageDiscountAmount = (totalOriginalPrice * discountPercent) / 100;
    totalDiscountedPrice = totalOriginalPrice - packageDiscountAmount;

    const totalSavings = totalOriginalPrice - totalDiscountedPrice;

    // Calculate final price per service (proportional discount)
    services.forEach(service => {
      if (totalOriginalPrice > 0) {
        const serviceDiscountAmount = (service.customPrice * discountPercent) / 100;
        service.finalPrice = service.customPrice - serviceDiscountAmount;
      } else {
        service.finalPrice = service.customPrice;
      }
    });

    return {
      id: servicePackage.id,
      name: servicePackage.name,
      description: servicePackage.description || '',
      discountPercentage: discountPercent,
      totalOriginalPrice,
      totalDiscountedPrice,
      totalSavings,
      totalDurationMinutes,
      serviceCount: packageItems.length,
      isActive: servicePackage.isActive ?? true,
      services,
      createdAt: servicePackage.createdAt,
      updatedAt: servicePackage.updatedAt,
    };
  }
}