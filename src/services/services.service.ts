import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  BusinessService,
  BusinessOwner,
  BusinessAddress,
  Service,
  ServiceCategory,
} from '../database/entities';
import { DistanceCalculatorService } from '../common/services/distance-calculator.service';
import {
  ServicesQueryDto,
  ServicesResponseDto,
  ServicesDataDto,
  ServiceItemDto,
  ServicesMetaDto,
  ServiceCategoryResponseDto,
  BusinessOwnerInfoDto,
  BusinessAddressDto,
  ServiceSortField,
  SortOrder,
} from './dto';

interface SortConfig {
  field: ServiceSortField;
  order: SortOrder;
}

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(BusinessService)
    private readonly businessServiceRepository: Repository<BusinessService>,
    @InjectRepository(BusinessOwner)
    private readonly businessOwnerRepository: Repository<BusinessOwner>,
    @InjectRepository(BusinessAddress)
    private readonly businessAddressRepository: Repository<BusinessAddress>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(ServiceCategory)
    private readonly serviceCategoryRepository: Repository<ServiceCategory>,
    private readonly distanceCalculatorService: DistanceCalculatorService,
  ) {}

  async getServices(
    query: ServicesQueryDto,
    userId?: string,
  ): Promise<ServicesResponseDto> {
    try {
      // Validate location parameters
      this.validateLocationParams(query);

      // Build the query using pipeline pattern
      const queryBuilder = this.buildBaseQuery();

      // Apply filters sequentially
      this.applyStatusFilter(queryBuilder, query);
      this.applyCategoryFilter(queryBuilder, query);
      this.applyAvailabilityFilter(queryBuilder, query);
      this.applyPriceFilter(queryBuilder, query);
      this.applyGenderFilter(queryBuilder, query);

      // Apply location filter if coordinates and radius provided
      if (query.lat && query.lng && query.radius) {
        this.applyLocationFilter(queryBuilder, query);
      }

      // Apply sorting
      this.applySorting(queryBuilder, query);

      // Get total count before pagination
      const totalQuery = queryBuilder.clone();
      const total = await totalQuery.getCount();

      // Apply pagination
      this.applyPagination(queryBuilder, query);

      // Execute query
      let businessServices = await queryBuilder.getMany();

      // Transform to response DTOs
      let services = await this.transformToServiceItems(
        businessServices,
        query,
        userId,
      );

      // Apply in-memory sorting for distance if needed
      if (query.sort && query.lat && query.lng) {
        const sortConfigs = this.parseSortString(query.sort);
        const hasDistanceSort = sortConfigs.some(s => s.field === ServiceSortField.DISTANCE);

        if (hasDistanceSort) {
          services = this.sortServicesByDistance(services, query, sortConfigs);
        }
      }

      // Build metadata
      const meta = this.buildMetadata(query, total, services);

      const data: ServicesDataDto = {
        services,
        meta,
      };

      return new ServicesResponseDto(
        200,
        true,
        'Services retrieved successfully',
        data,
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve services');
    }
  }

  private validateLocationParams(query: ServicesQueryDto): void {
    const hasLat = query.lat !== undefined;
    const hasLng = query.lng !== undefined;

    if (hasLat && !hasLng) {
      throw new BadRequestException('Longitude is required when latitude is provided');
    }
    if (hasLng && !hasLat) {
      throw new BadRequestException('Latitude is required when longitude is provided');
    }
    // Radius is now completely optional - if not provided, no location filtering will be applied
  }

  private buildBaseQuery(): SelectQueryBuilder<BusinessService> {
    return this.businessServiceRepository
      .createQueryBuilder('businessService')
      .leftJoinAndSelect('businessService.service', 'service')
      .leftJoinAndSelect('service.category', 'category')
      .leftJoinAndSelect('businessService.businessOwner', 'businessOwner')
      .leftJoinAndSelect('businessOwner.addresses', 'address')
      .where('businessService.isActive = :isActive', { isActive: true })
      .andWhere('service.isActive = :serviceIsActive', { serviceIsActive: true })
      .andWhere('businessOwner.isApproved = :isApproved', { isApproved: true });
  }

  private applyStatusFilter(
    queryBuilder: SelectQueryBuilder<BusinessService>,
    query: ServicesQueryDto,
  ): void {
    if (query.status === 'inactive') {
      queryBuilder.andWhere('businessService.isActive = :isActive', { isActive: false });
    }
  }

  private applyCategoryFilter(
    queryBuilder: SelectQueryBuilder<BusinessService>,
    query: ServicesQueryDto,
  ): void {
    if (query.category) {
      queryBuilder.andWhere('category.name ILIKE :categoryName', {
        categoryName: `%${query.category}%`,
      });
    }
  }

  private applyAvailabilityFilter(
    queryBuilder: SelectQueryBuilder<BusinessService>,
    query: ServicesQueryDto,
  ): void {
    if (query.availableAtHome !== undefined) {
      queryBuilder.andWhere('service.availableAtHome = :availableAtHome', {
        availableAtHome: query.availableAtHome,
      });
    }
  }

  private applyPriceFilter(
    queryBuilder: SelectQueryBuilder<BusinessService>,
    query: ServicesQueryDto,
  ): void {
    if (query.minPrice !== undefined) {
      queryBuilder.andWhere('businessService.customPrice >= :minPrice', {
        minPrice: query.minPrice,
      });
    }
    if (query.maxPrice !== undefined) {
      queryBuilder.andWhere('businessService.customPrice <= :maxPrice', {
        maxPrice: query.maxPrice,
      });
    }
  }

  private applyGenderFilter(
    queryBuilder: SelectQueryBuilder<BusinessService>,
    query: ServicesQueryDto,
  ): void {
    if (query.gender) {
      // Include services that match the requested gender OR services that are available for 'both' genders
      queryBuilder.andWhere('(service.gender = :gender OR service.gender = :both)', {
        gender: query.gender,
        both: 'both',
      });
    }
  }

  private applyLocationFilter(
    queryBuilder: SelectQueryBuilder<BusinessService>,
    query: ServicesQueryDto,
  ): void {
    // For now, skip PostGIS spatial queries as they require PostGIS extension
    // Instead, we'll use a simple bounding box filter
    const radius = query.radius!; // At this point, radius is guaranteed to be provided
    const latDelta = radius / 111; // Rough conversion: 1 degree ≈ 111 km
    const lngDelta = radius / (111 * Math.cos((query.lat! * Math.PI) / 180));

    queryBuilder
      .andWhere('address.latitude BETWEEN :minLat AND :maxLat', {
        minLat: query.lat! - latDelta,
        maxLat: query.lat! + latDelta,
      })
      .andWhere('address.longitude BETWEEN :minLng AND :maxLng', {
        minLng: query.lng! - lngDelta,
        maxLng: query.lng! + lngDelta,
      });
  }

  private applySorting(
    queryBuilder: SelectQueryBuilder<BusinessService>,
    query: ServicesQueryDto,
  ): void {
    if (!query.sort) {
      queryBuilder.orderBy('businessService.createdAt', 'DESC');
      return;
    }

    const sortConfigs = this.parseSortString(query.sort);

    sortConfigs.forEach((sortConfig, index) => {
      const orderMethod = index === 0 ? 'orderBy' : 'addOrderBy';

      switch (sortConfig.field) {
        case ServiceSortField.PRICE:
          queryBuilder[orderMethod]('businessService.customPrice', sortConfig.order.toUpperCase() as any);
          break;
        case ServiceSortField.NAME:
          queryBuilder[orderMethod]('service.name', sortConfig.order.toUpperCase() as any);
          break;
        case ServiceSortField.CREATED_AT:
          queryBuilder[orderMethod]('businessService.createdAt', sortConfig.order.toUpperCase() as any);
          break;
        case ServiceSortField.DISTANCE:
          // For distance sorting, we'll calculate it in memory after fetching
          // For now, just use default sorting and we'll sort by distance later
          queryBuilder[orderMethod]('businessService.createdAt', 'DESC');
          break;
        case ServiceSortField.RATING:
          // For now, just sort by created date as we don't have ratings yet
          queryBuilder[orderMethod]('businessService.createdAt', sortConfig.order.toUpperCase() as any);
          break;
        default:
          queryBuilder[orderMethod]('businessService.createdAt', 'DESC');
      }
    });
  }

  private parseSortString(sort: string): SortConfig[] {
    return sort.split(',').map(field => {
      const trimmed = field.trim();
      if (trimmed.startsWith('-')) {
        return {
          field: trimmed.substring(1) as ServiceSortField,
          order: SortOrder.DESC,
        };
      }
      return {
        field: trimmed as ServiceSortField,
        order: SortOrder.ASC,
      };
    });
  }

  private applyPagination(
    queryBuilder: SelectQueryBuilder<BusinessService>,
    query: ServicesQueryDto,
  ): void {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);
  }

  private async transformToServiceItems(
    businessServices: BusinessService[],
    query: ServicesQueryDto,
    userId?: string,
  ): Promise<ServiceItemDto[]> {
    return Promise.all(
      businessServices.map(async (businessService) => {
        const service = businessService.service;
        const businessOwner = businessService.businessOwner;
        const address = businessOwner.addresses?.[0];

        let distance: number | undefined;
        if (query.lat && query.lng && address?.latitude && address?.longitude) {
          distance = this.distanceCalculatorService.calculateDistance(
            { latitude: query.lat, longitude: query.lng },
            { latitude: address.latitude, longitude: address.longitude },
          );
        }

        const serviceItem: ServiceItemDto = {
          id: businessService.id,
          name: service.name,
          description: service.description,
          basePrice: service.basePrice,
          customPrice: businessService.customPrice,
          defaultDuration: service.defaultDuration,
          customDurationMinutes: businessService.customDurationMinutes,
          availableAtHome: service.availableAtHome,
          image: service.image,
          gender: service.gender,
          category: {
            id: service.category.id,
            name: service.category.name,
            description: service.category.description,
          } as ServiceCategoryResponseDto,
          businessOwner: {
            id: businessOwner.id,
            shopId: businessOwner.shopId,
            businessName: businessOwner.businessName,
            businessDescription: businessOwner.businessDescription,
            isApproved: businessOwner.isApproved,
          } as BusinessOwnerInfoDto,
          businessAddress: address ? {
            id: address.id,
            streetAddress: address.streetAddress,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2,
            landmark: address.landmark,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
            latitude: address.latitude,
            longitude: address.longitude,
            distance,
          } as BusinessAddressDto : undefined,
          isActive: businessService.isActive,
          createdAt: businessService.createdAt,
          updatedAt: businessService.updatedAt,
        };

        // Add user-specific data if requested and userId provided
        if (query.userspecific && userId) {
          serviceItem.userSpecific = await this.getUserSpecificData(businessService.id, userId);
        }

        return serviceItem;
      }),
    );
  }

  private async getUserSpecificData(businessServiceId: string, userId: string): Promise<any> {
    // TODO: Implement user-specific data retrieval
    // This would typically involve checking:
    // - User favorites
    // - Booking history
    // - Personal preferences
    return {
      isFavorite: false,
      lastBookedAt: undefined,
      bookingCount: 0,
    };
  }

  private sortServicesByDistance(
    services: ServiceItemDto[],
    query: ServicesQueryDto,
    sortConfigs: SortConfig[],
  ): ServiceItemDto[] {
    return services.sort((a, b) => {
      // Find the distance sort configuration
      const distanceSort = sortConfigs.find(s => s.field === ServiceSortField.DISTANCE);
      if (!distanceSort || !a.businessAddress?.distance || !b.businessAddress?.distance) {
        return 0;
      }

      const diff = a.businessAddress.distance - b.businessAddress.distance;
      return distanceSort.order === SortOrder.ASC ? diff : -diff;
    });
  }

  private buildMetadata(
    query: ServicesQueryDto,
    total: number,
    services: ServiceItemDto[],
  ): ServicesMetaDto {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const totalPages = Math.ceil(total / limit);

    const meta: ServicesMetaDto = {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    // Add filters summary
    const filters: any = {};

    if (query.lat && query.lng) {
      filters.location = {
        lat: query.lat,
        lng: query.lng,
        ...(query.radius && { radius: query.radius }),
      };
    }

    if (query.category) {
      filters.category = query.category;
    }

    if (query.minPrice || query.maxPrice) {
      filters.priceRange = {
        min: query.minPrice,
        max: query.maxPrice,
      };
    }

    if (query.availableAtHome !== undefined) {
      filters.availableAtHome = query.availableAtHome;
    }

    if (query.gender) {
      filters.gender = query.gender;
    }

    if (query.sort) {
      filters.sort = query.sort;
    }

    if (Object.keys(filters).length > 0) {
      meta.filters = filters;
    }

    return meta;
  }
}