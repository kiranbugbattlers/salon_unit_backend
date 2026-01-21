import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, In } from 'typeorm';
import {
  BusinessOwner,
  BusinessAddress,
  BusinessMedia,
  BusinessService as BusinessServiceEntity,
  Service,
  ServiceCategory,
  Staff,
  StaffService,
  Booking,
  StaffWorkingHours,
  BusinessOperatingHours,
  ServicePackage,
  ServicePackageItem,
  Customer,
  CustomerFavorite,
  Review,
} from '../database/entities';
import { DistanceCalculatorService } from '../common/services/distance-calculator.service';
import {
  BusinessQueryDto,
  BusinessResponseDto,
  BusinessDataDto,
  BusinessItemDto,
  BusinessMetaDto,
  BusinessAddressDto,
  BusinessMediaDto,
  BusinessSortField,
  SortOrder,
  BusinessDetailDto,
  BusinessDetailResponseDto,
  BusinessServiceDetailDto,
  StaffDetailDto,
  ServiceCategoryDto,
  BookedSlotsResponseDto,
  BookedSlotsDataDto,
  BookedSlotItemDto,
  AvailableSlotsQueryDto,
  AvailableSlotsResponseDto,
  DayAvailabilityDto,
  TimeSlotDto,
} from './dto';
import { ServicePackageResponseDto } from '../business-owner/dto';

interface SortConfig {
  field: BusinessSortField;
  order: SortOrder;
}

@Injectable()
export class BusinessService {
  constructor(
    @InjectRepository(BusinessOwner)
    private readonly businessOwnerRepository: Repository<BusinessOwner>,
    @InjectRepository(BusinessAddress)
    private readonly businessAddressRepository: Repository<BusinessAddress>,
    @InjectRepository(BusinessMedia)
    private readonly businessMediaRepository: Repository<BusinessMedia>,
    @InjectRepository(BusinessServiceEntity)
    private readonly businessServiceRepository: Repository<BusinessServiceEntity>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(ServiceCategory)
    private readonly serviceCategoryRepository: Repository<ServiceCategory>,
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    @InjectRepository(StaffService)
    private readonly staffServiceRepository: Repository<StaffService>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(StaffWorkingHours)
    private readonly staffWorkingHoursRepository: Repository<StaffWorkingHours>,
    @InjectRepository(BusinessOperatingHours)
    private readonly businessOperatingHoursRepository: Repository<BusinessOperatingHours>,
    @InjectRepository(ServicePackage)
    private readonly servicePackageRepository: Repository<ServicePackage>,
    @InjectRepository(ServicePackageItem)
    private readonly servicePackageItemRepository: Repository<ServicePackageItem>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(CustomerFavorite)
    private readonly customerFavoriteRepository: Repository<CustomerFavorite>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    private readonly distanceCalculatorService: DistanceCalculatorService,
  ) {}

  async getBusinesses(
    query: BusinessQueryDto,
    userId?: string,
    customerId?: string,
  ): Promise<BusinessResponseDto> {
    try {
      // Validate location parameters
      this.validateLocationParams(query);

      // Fetch customer gender if customerId is provided
      let customerGender: string | undefined;
      if (customerId) {
        const customer = await this.customerRepository.findOne({
          where: { id: customerId },
          select: ['id', 'gender'],
        });
        customerGender = customer?.gender;
      }

      // Build the query using pipeline pattern
      const queryBuilder = this.buildBaseQuery();

      // Apply filters sequentially
      this.applyCategoryFilter(queryBuilder, query);
      this.applyAvailabilityFilter(queryBuilder, query);
      this.applyPriceFilter(queryBuilder, query);
      this.applyGenderFilter(queryBuilder, query, customerGender);
      this.applyOperatingYearsFilter(queryBuilder, query);
      this.applySearchFilter(queryBuilder, query);

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
      let businessOwners = await queryBuilder.getMany();

      // Transform to response DTOs
      let businesses = await this.transformToBusinessItems(
        businessOwners,
        query,
        userId,
        customerId,
      );

      // Apply in-memory sorting for distance if needed
      // Auto-sort by distance when lat/lng are provided, unless another sort is specified
      if (query.lat && query.lng) {
        let sortConfigs: any[];

        if (query.sort) {
          sortConfigs = this.parseSortString(query.sort);
        } else {
          // Auto-enable distance sorting when coordinates provided but no explicit sort
          sortConfigs = [{ field: BusinessSortField.DISTANCE, order: 'ASC' }];
        }

        const hasDistanceSort = sortConfigs.some(s => s.field === BusinessSortField.DISTANCE);

        if (hasDistanceSort) {
          businesses = this.sortBusinessesByDistance(businesses, query, sortConfigs);
        }
      }

      // Build metadata
      const meta = this.buildMetadata(query, total, businesses);

      const data: BusinessDataDto = {
        businesses,
        meta,
      };

      return new BusinessResponseDto(
        200,
        true,
        'Businesses retrieved successfully',
        data,
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve businesses');
    }
  }

  async getBusinessDetail(
    shopId: string,
    userId?: string,
    customerId?: string,
  ): Promise<BusinessDetailResponseDto> {
    try {
      // Fetch customer gender if customerId is provided
      let customerGender: string | undefined;
      if (customerId) {
        const customer = await this.customerRepository.findOne({
          where: { id: customerId },
          select: ['id', 'gender'],
        });
        customerGender = customer?.gender;
      }

      // Find business by shopId with all related data
      const businessOwner = await this.businessOwnerRepository.findOne({
        where: { shopId, isApproved: true, isDefaulter: false },
        relations: [
          'addresses',
          'businessServices',
          'businessServices.service',
          'businessServices.service.category',
          'staff',
          'onboarding',
        ],
      });

      if (!businessOwner) {
        throw new BadRequestException('Business not found or not approved');
      }

      const address = businessOwner.addresses?.[0];

      // Get business media
      const businessMedia = await this.businessMediaRepository.find({
        where: { businessOwnerId: businessOwner.id, isActive: true },
        order: { displayOrder: 'ASC', createdAt: 'ASC' },
      });

      // Transform business services with gender filtering
      let filteredBusinessServices = businessOwner.businessServices?.filter(bs => bs.isActive && bs.service.isActive) || [];

      // Apply gender filter if customer has gender male or female
      if (customerGender && (customerGender === 'male' || customerGender === 'female')) {
        filteredBusinessServices = filteredBusinessServices.filter(bs =>
          bs.service.gender === customerGender || bs.service.gender === 'both'
        );
      }

      const services: BusinessServiceDetailDto[] = filteredBusinessServices
        .map(bs => ({
          id: bs.id,
          name: bs.service.name,
          description: bs.service.description,
          basePrice: bs.service.basePrice,
          customPrice: bs.customPrice,
          defaultDuration: bs.service.defaultDuration,
          customDurationMinutes: bs.customDurationMinutes,
          availableAtHome: bs.service.availableAtHome,
          image: bs.service.image,
          gender: bs.service.gender,
          category: {
            id: bs.service.category.id,
            name: bs.service.category.name,
            description: bs.service.category.description,
          } as ServiceCategoryDto,
          isActive: bs.isActive,
        }));

      // Get staff with their services
      const staff = await this.staffRepository.find({
        where: { businessOwnerId: businessOwner.id, isActive: true },
        relations: ['staffServices'],
      });

      // Transform staff data
      const staffDetails: StaffDetailDto[] = staff.map(staffMember => ({
        id: staffMember.id,
        firstName: staffMember.firstName,
        lastName: staffMember.lastName,
        dateOfBirth: staffMember.dateOfBirth,
        gender: staffMember.gender,
        profilePic: staffMember.profilePic,
        profilePicCdnUrl: staffMember.profilePicCdnUrl,
        serviceIds: staffMember.staffServices
          ?.filter(ss => ss.isActive)
          .map(ss => ss.serviceId) || [],
      }));

      // Get operating hours to determine closed days
      const allOperatingHours = await this.businessOperatingHoursRepository.find({
        where: { businessOwnerId: businessOwner.id },
        order: { dayOfWeek: 'ASC' },
      });

      // Extract days when business is closed
      const closedDays = allOperatingHours
        .filter(hour => hour.isClosed)
        .map(hour => hour.dayOfWeek);

      // Only include operating hours for days that are NOT closed
      const operatingHours = allOperatingHours.filter(hour => !hour.isClosed);

      // Get service packages for this business
      const servicePackages = await this.servicePackageRepository.find({
        where: { businessOwnerId: businessOwner.id, isActive: true },
        relations: [
          'packageItems',
          'packageItems.businessService',
          'packageItems.businessService.service',
          'packageItems.businessService.service.category',
        ],
        order: { createdAt: 'DESC' },
      });

      // Transform service packages
      const servicePackagesDto: ServicePackageResponseDto[] = servicePackages.map(pkg => {
        const packageItems = pkg.packageItems?.filter(item =>
          item.businessService?.isActive && item.businessService?.service?.isActive
        ) || [];

        const servicesInPackage = packageItems.map(item => {
          const bs = item.businessService;
          const service = bs.service;
          const finalPrice = bs.customPrice * (1 - pkg.discountPercentage / 100);
          const effectiveDuration = bs.customDurationMinutes || service?.defaultDuration || 0;

          if (effectiveDuration === 0) {
            console.warn(`⚠️ Service ${bs.id} (${service.name}) in package ${pkg.id} has 0 duration. customDurationMinutes: ${bs.customDurationMinutes}, defaultDuration: ${service?.defaultDuration}`);
          }

          return {
            id: item.id,
            businessServiceId: bs.id,
            serviceName: service.name,
            serviceDescription: service.description,
            serviceCategoryName: service.category?.name || '',
            defaultPrice: service.basePrice,
            customPrice: bs.customPrice,
            defaultDurationMinutes: service.defaultDuration,
            customDurationMinutes: bs.customDurationMinutes,
            effectiveDurationMinutes: effectiveDuration,
            finalPrice,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          };
        });

        const totalOriginalPrice = servicesInPackage.reduce((sum, s) => sum + s.customPrice, 0);
        const totalDiscountedPrice = servicesInPackage.reduce((sum, s) => sum + s.finalPrice, 0);
        const totalDurationMinutes = servicesInPackage.reduce((sum, s) => sum + s.effectiveDurationMinutes, 0);

        return {
          id: pkg.id,
          name: pkg.name,
          description: pkg.description,
          discountPercentage: pkg.discountPercentage,
          totalOriginalPrice,
          totalDiscountedPrice,
          totalSavings: totalOriginalPrice - totalDiscountedPrice,
          totalDurationMinutes,
          serviceCount: servicesInPackage.length,
          isActive: pkg.isActive,
          services: servicesInPackage,
          createdAt: pkg.createdAt,
          updatedAt: pkg.updatedAt,
        };
      });

      // Calculate price range
      const prices = services.map(s => s.customPrice).filter(p => p > 0);
      const priceRange = prices.length > 0 ? {
        min: Math.min(...prices),
        max: Math.max(...prices),
      } : undefined;

      // Extract service location type from onboarding data
      const serviceLocationType = businessOwner.onboarding?.step3Data?.serviceLocationType;

      // Build user-specific data if customerId is provided
      let userSpecific = undefined;
      if (customerId) {
        const isFavorite = await this.customerFavoriteRepository.findOne({
          where: { customerId, businessOwnerId: businessOwner.id },
        });
        userSpecific = {
          isFavorite: !!isFavorite,
        };
      }

      const businessDetail: BusinessDetailDto = {
        id: businessOwner.id,
        shopId: businessOwner.shopId,
        businessName: businessOwner.businessName,
        businessDescription: businessOwner.businessDescription,
        operatingYears: businessOwner.operatingYears,
        isApproved: businessOwner.isApproved,
        approvedAt: businessOwner.approvedAt,
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
        } : undefined,
        businessMedia: businessMedia.map(media => ({
          id: media.id,
          mediaUrl: media.mediaUrl,
          mediaCdnUrl: media.cdnUrl,
          mediaType: media.mediaType,
        })),
        services,
        servicePackages: servicePackagesDto,
        staff: staffDetails,
        priceRange,
        // Calculate and set business rating
        ...await this.calculateBusinessRating(businessOwner.id),
        userSpecific,
        closedDays,
        operatingHours: operatingHours.map(hour => ({
          dayOfWeek: hour.dayOfWeek,
          openTime: hour.openTime,
          closeTime: hour.closeTime,
        })),
        serviceLocationType,
      };

      return new BusinessDetailResponseDto(
        200,
        true,
        'Business details retrieved successfully',
        businessDetail,
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve business details');
    }
  }

  async getBookedSlots(
    shopId: string,
    date: string,
    staffId?: string,
  ): Promise<BookedSlotsResponseDto> {
    try {
      // Validate business exists and is approved
      const businessOwner = await this.businessOwnerRepository.findOne({
        where: { shopId, isApproved: true, isDefaulter: false },
      });

      if (!businessOwner) {
        throw new BadRequestException('Business not found or not approved');
      }

      let staff = null;
      let whereCondition: any = {
        businessOwnerId: businessOwner.id,
        appointmentDate: date,
        status: In(['pending', 'confirmed', 'in-progress']), // Exclude cancelled/completed
      };

      // If staffId is provided, validate staff and add to where condition
      if (staffId) {
        staff = await this.staffRepository.findOne({
          where: { id: staffId, businessOwnerId: businessOwner.id, isActive: true },
        });

        if (!staff) {
          throw new BadRequestException('Staff member not found or not active for this business');
        }

        whereCondition.staffId = staffId;
      }

      // Get all bookings for the specified date (filtered by staff if provided)
      const bookings = await this.bookingRepository.find({
        where: whereCondition,
        relations: ['service', 'customer', 'staff'],
        order: { startTime: 'ASC' },
      });

      // Transform bookings to response format
      const bookedSlots: BookedSlotItemDto[] = bookings.map(booking => ({
        bookingId: booking.id,
        startTime: booking.startTime,
        endTime: booking.endTime,
        serviceName: booking.service.name,
        status: booking.status,
        serviceLocation: booking.serviceLocation,
        customerFirstName: booking.customer?.firstName || 'Guest',
        staffId: booking.staff.id,
        staffName: `${booking.staff.firstName} ${booking.staff.lastName}`,
      }));

      const data: BookedSlotsDataDto = {
        date,
        staffId: staffId || undefined,
        shopId,
        staffName: staff ? `${staff.firstName} ${staff.lastName}` : undefined,
        bookedSlots,
        totalBookings: bookedSlots.length,
      };

      return new BookedSlotsResponseDto(
        200,
        true,
        'Booked slots retrieved successfully',
        data,
      );
    } catch (error) {
      console.error('❌ Error in getBookedSlots:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve booked slots: ' + (error.message || error));
    }
  }

  private validateLocationParams(query: BusinessQueryDto): void {
    const hasLat = query.lat !== undefined;
    const hasLng = query.lng !== undefined;

    if (hasLat && !hasLng) {
      throw new BadRequestException('Longitude is required when latitude is provided');
    }
    if (hasLng && !hasLat) {
      throw new BadRequestException('Latitude is required when longitude is provided');
    }
  }

  private buildBaseQuery(): SelectQueryBuilder<BusinessOwner> {
    return this.businessOwnerRepository
      .createQueryBuilder('businessOwner')
      .leftJoinAndSelect('businessOwner.addresses', 'address')
      .leftJoinAndSelect('businessOwner.businessServices', 'businessService')
      .leftJoinAndSelect('businessService.service', 'service')
      .leftJoinAndSelect('service.category', 'category')
      .where('businessOwner.isApproved = :isApproved', { isApproved: true })
      .andWhere('businessOwner.isDefaulter = :isDefaulter', { isDefaulter: false })
      .andWhere('businessService.isActive = :isActive', { isActive: true })
      .andWhere('service.isActive = :serviceIsActive', { serviceIsActive: true });
  }


  private applyCategoryFilter(
    queryBuilder: SelectQueryBuilder<BusinessOwner>,
    query: BusinessQueryDto,
  ): void {
    if (query.category) {
      queryBuilder.andWhere('category.id = :categoryId', {
        categoryId: query.category,
      });
    }
  }

  private applyAvailabilityFilter(
    queryBuilder: SelectQueryBuilder<BusinessOwner>,
    query: BusinessQueryDto,
  ): void {
    if (query.availableAtHome !== undefined) {
      queryBuilder.andWhere('service.availableAtHome = :availableAtHome', {
        availableAtHome: query.availableAtHome,
      });
    }
  }

  private applyPriceFilter(
    queryBuilder: SelectQueryBuilder<BusinessOwner>,
    query: BusinessQueryDto,
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
    queryBuilder: SelectQueryBuilder<BusinessOwner>,
    query: BusinessQueryDto,
    customerGender?: string,
  ): void {
    // Apply customer gender filter if customer is authenticated and has gender male or female
    if (customerGender && (customerGender === 'male' || customerGender === 'female')) {
      // Filter: show businesses with services matching customer's gender OR 'both'
      queryBuilder.andWhere('(service.gender = :customerGender OR service.gender = :both)', {
        customerGender,
        both: 'both',
      });
    }
    // If customerGender is 'other' or 'prefer_not_to_say', no gender filtering is applied

    // Apply query parameter gender filter if provided (independent of customer gender)
    if (query.gender) {
      // Include services that match the requested gender OR services that are available for 'both' genders
      queryBuilder.andWhere('(service.gender = :queryGender OR service.gender = :queryBoth)', {
        queryGender: query.gender,
        queryBoth: 'both',
      });
    }
  }

  private applyOperatingYearsFilter(
    queryBuilder: SelectQueryBuilder<BusinessOwner>,
    query: BusinessQueryDto,
  ): void {
    if (query.minOperatingYears !== undefined) {
      queryBuilder.andWhere('businessOwner.operatingYears >= :minOperatingYears', {
        minOperatingYears: query.minOperatingYears,
      });
    }
  }

  private applySearchFilter(
    queryBuilder: SelectQueryBuilder<BusinessOwner>,
    query: BusinessQueryDto,
  ): void {
    if (query.search) {
      // Search across salon name, description, city, area (streetAddress, addressLine1), and landmark
      queryBuilder.andWhere(
        '(businessOwner.businessName ILIKE :search OR businessOwner.businessDescription ILIKE :search OR address.city ILIKE :search OR address.streetAddress ILIKE :search OR address.addressLine1 ILIKE :search OR address.landmark ILIKE :search)',
        { search: `%${query.search}%` }
      );
    }
  }

  private applyLocationFilter(
    queryBuilder: SelectQueryBuilder<BusinessOwner>,
    query: BusinessQueryDto,
  ): void {
    const radius = query.radius!;
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
    queryBuilder: SelectQueryBuilder<BusinessOwner>,
    query: BusinessQueryDto,
  ): void {
    if (!query.sort) {
      queryBuilder.orderBy('businessOwner.createdAt', 'DESC');
      return;
    }

    const sortConfigs = this.parseSortString(query.sort);

    sortConfigs.forEach((sortConfig, index) => {
      const orderMethod = index === 0 ? 'orderBy' : 'addOrderBy';

      switch (sortConfig.field) {
        case BusinessSortField.NAME:
          queryBuilder[orderMethod]('businessOwner.businessName', sortConfig.order.toUpperCase() as any);
          break;
        case BusinessSortField.CREATED_AT:
          queryBuilder[orderMethod]('businessOwner.createdAt', sortConfig.order.toUpperCase() as any);
          break;
        case BusinessSortField.OPERATING_YEARS:
          queryBuilder[orderMethod]('businessOwner.operatingYears', sortConfig.order.toUpperCase() as any);
          break;
        case BusinessSortField.DISTANCE:
          // For distance sorting, we'll calculate it in memory after fetching
          queryBuilder[orderMethod]('businessOwner.createdAt', 'DESC');
          break;
        case BusinessSortField.RATING:
          // For now, just sort by created date as we don't have ratings yet
          queryBuilder[orderMethod]('businessOwner.createdAt', sortConfig.order.toUpperCase() as any);
          break;
        default:
          queryBuilder[orderMethod]('businessOwner.createdAt', 'DESC');
      }
    });
  }

  private parseSortString(sort: string): SortConfig[] {
    return sort.split(',').map(field => {
      const trimmed = field.trim();
      if (trimmed.startsWith('-')) {
        return {
          field: trimmed.substring(1) as BusinessSortField,
          order: SortOrder.DESC,
        };
      }
      return {
        field: trimmed as BusinessSortField,
        order: SortOrder.ASC,
      };
    });
  }

  private applyPagination(
    queryBuilder: SelectQueryBuilder<BusinessOwner>,
    query: BusinessQueryDto,
  ): void {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);
  }

  private async transformToBusinessItems(
    businessOwners: BusinessOwner[],
    query: BusinessQueryDto,
    userId?: string,
    customerId?: string,
  ): Promise<BusinessItemDto[]> {
    // Bulk fetch favorites for all businesses if customerId is provided
    let favoritesMap = new Map<string, boolean>();
    const businessOwnerIds = businessOwners.map(bo => bo.id);
    
    if (customerId && businessOwners.length > 0) {
      favoritesMap = await this.checkFavoritesForBusinesses(customerId, businessOwnerIds);
    }

    // Bulk fetch ratings for all businesses (more efficient than individual queries)
    const ratingsMap = await this.calculateBulkBusinessRatings(businessOwnerIds);

    return Promise.all(
      businessOwners.map(async (businessOwner) => {
        const address = businessOwner.addresses?.[0];

        let distance: number | undefined;
        if (query.lat && query.lng && address?.latitude && address?.longitude) {
          distance = this.distanceCalculatorService.calculateDistance(
            { latitude: query.lat, longitude: query.lng },
            { latitude: address.latitude, longitude: address.longitude },
          );
        }

        // Get business media
        const businessMedia = await this.businessMediaRepository.find({
          where: { businessOwnerId: businessOwner.id, isActive: true },
          order: { displayOrder: 'ASC', createdAt: 'ASC' },
          take: 10, // Limit to first 10 media items
        });

        // Build user-specific data if customerId is provided
        const userSpecific = customerId ? {
          isFavorite: favoritesMap.get(businessOwner.id) || false,
        } : undefined;

        const businessItem: BusinessItemDto = {
          id: businessOwner.id,
          shopId: businessOwner.shopId,
          businessName: businessOwner.businessName,
          businessDescription: businessOwner.businessDescription,
          operatingYears: businessOwner.operatingYears,
          isApproved: businessOwner.isApproved,
          approvedAt: businessOwner.approvedAt,
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
          businessMedia: businessMedia.map(media => ({
            id: media.id,
            mediaUrl: media.mediaUrl,
            mediaCdnUrl: media.cdnUrl,
            mediaType: media.mediaType,
            createdAt: media.createdAt,
          } as BusinessMediaDto)),
          // Get ratings from bulk-fetched map
          averageRating: ratingsMap.get(businessOwner.id)?.averageRating ?? null,
          reviewCount: ratingsMap.get(businessOwner.id)?.reviewCount ?? 0,
          userSpecific,
          createdAt: businessOwner.createdAt,
          updatedAt: businessOwner.updatedAt,
        };

        return businessItem;
      })
    );
  }

  private sortBusinessesByDistance(
    businesses: BusinessItemDto[],
    query: BusinessQueryDto,
    sortConfigs: SortConfig[],
  ): BusinessItemDto[] {
    return businesses.sort((a, b) => {
      for (const sortConfig of sortConfigs) {
        let compareResult = 0;

        switch (sortConfig.field) {
          case BusinessSortField.DISTANCE:
            const aDistance = a.businessAddress?.distance ?? Infinity;
            const bDistance = b.businessAddress?.distance ?? Infinity;
            compareResult = aDistance - bDistance;
            break;
          case BusinessSortField.NAME:
            compareResult = (a.businessName || '').localeCompare(b.businessName || '');
            break;
          case BusinessSortField.OPERATING_YEARS:
            compareResult = (a.operatingYears || 0) - (b.operatingYears || 0);
            break;
          case BusinessSortField.CREATED_AT:
            compareResult = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
        }

        if (compareResult !== 0) {
          return sortConfig.order === SortOrder.DESC ? -compareResult : compareResult;
        }
      }
      return 0;
    });
  }

  private buildMetadata(
    query: BusinessQueryDto,
    total: number,
    businesses: BusinessItemDto[],
  ): BusinessMetaDto {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const totalPages = Math.ceil(total / limit);

    const filters: any = {};

    if (query.lat && query.lng && query.radius) {
      filters.location = {
        lat: query.lat,
        lng: query.lng,
        radius: query.radius,
      };
    }

    if (query.category) {
      filters.category = query.category;
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      filters.priceRange = {
        min: query.minPrice,
        max: query.maxPrice,
      };
    }

    if (query.availableAtHome !== undefined) {
      filters.availableAtHome = query.availableAtHome;
    }

    if (query.minOperatingYears !== undefined) {
      filters.operatingYears = {
        min: query.minOperatingYears,
      };
    }

    if (query.search) {
      filters.search = query.search;
    }

    if (query.sort) {
      filters.sort = query.sort;
    }

    return {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
    };
  }

  async getAvailableSlots(
    shopId: string,
    query: AvailableSlotsQueryDto,
  ): Promise<AvailableSlotsResponseDto> {
    // Validate business exists
    const business = await this.businessOwnerRepository.findOne({
      where: { shopId: shopId },
      relations: ['addresses'],
    });

    if (!business) {
      throw new BadRequestException('Business not found');
    }

    // Parse dates
    const startDate = new Date(query.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + query.numberOfDays - 1);

    // Generate date array
    const dates: Date[] = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }

    // Get business operating hours
    const businessHours = await this.businessOperatingHoursRepository.find({
      where: { businessOwnerId: business.id },
    });

    // Get staff (filter by staffId if provided)
    let staffQuery = this.staffRepository
      .createQueryBuilder('staff')
      .leftJoinAndSelect('staff.staffServices', 'staffServices')
      .leftJoinAndSelect('staffServices.service', 'service')
      .where('staff.businessOwnerId = :businessOwnerId', { businessOwnerId: business.id });

    if (query.staffId) {
      staffQuery = staffQuery.andWhere('staff.id = :staffId', { staffId: query.staffId });
    }

    const staff = await staffQuery.getMany();

    if (staff.length === 0) {
      throw new BadRequestException('No staff found for the specified criteria');
    }

    // Get staff working hours
    const staffIds = staff.map(s => s.id);
    const staffWorkingHours = await this.staffWorkingHoursRepository.find({
      where: { staffId: In(staffIds), isActive: true },
    });

    // Get existing bookings for the date range
    const bookings = await this.bookingRepository.find({
      where: {
        businessOwnerId: business.id,
        staffId: In(staffIds),
        appointmentDate: In(dates),
        status: In(['pending', 'confirmed', 'in-progress']),
      },
      relations: ['service'],
    });

    // Generate available slots for each day
    const days: DayAvailabilityDto[] = [];

    for (const date of dates) {
      const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday, etc.
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const dateStr = date.toISOString().split('T')[0];

      // Get business hours for this day
      const businessHour = businessHours.find(bh => bh.dayOfWeek === dayOfWeek);
      const isBusinessOpen = businessHour && !businessHour.isClosed;

      const dayAvailability: DayAvailabilityDto = {
        date: dateStr,
        dayOfWeek: dayName,
        isBusinessOpen,
        businessHours: isBusinessOpen ? {
          openTime: businessHour.openTime,
          closeTime: businessHour.closeTime,
        } : null,
        timeSlots: [],
      };

      if (isBusinessOpen) {
        // Generate time slots for each staff member
        const timeSlots: TimeSlotDto[] = [];

        for (const staffMember of staff) {
          // Get staff working hours for this day
          const staffWorkingHour = staffWorkingHours.find(
            swh => swh.staffId === staffMember.id && swh.dayOfWeek === dayOfWeek
          );

          if (staffWorkingHour) {
            // Generate hourly slots (can be customized for 30min, 15min, etc.)
            const slots = this.generateTimeSlots(
              staffWorkingHour.startTime,
              staffWorkingHour.endTime,
              60 // 60-minute slots
            );

            // Check availability for each slot
            for (const slot of slots) {
              const isSlotBooked = bookings.some(booking =>
                booking.staffId === staffMember.id &&
                booking.appointmentDate.toISOString().split('T')[0] === dateStr &&
                this.isTimeOverlapping(slot.startTime, slot.endTime, booking.startTime, booking.endTime)
              );

              timeSlots.push({
                startTime: slot.startTime,
                endTime: slot.endTime,
                isAvailable: !isSlotBooked,
                staff: {
                  id: staffMember.id,
                  firstName: staffMember.firstName,
                  lastName: staffMember.lastName,
                  specializations: staffMember.staffServices?.map(ss => ss.service.name) || [],
                },
              });
            }
          }
        }

        dayAvailability.timeSlots = timeSlots;
      }

      days.push(dayAvailability);
    }

    // Calculate total available slots
    const totalAvailableSlots = days.reduce((total, day) =>
      total + day.timeSlots.filter(slot => slot.isAvailable).length, 0
    );

    return {
      business: {
        id: business.id,
        name: business.businessName,
        address: business.addresses && business.addresses.length > 0 ?
          `${business.addresses[0].streetAddress}, ${business.addresses[0].city}, ${business.addresses[0].state}` :
          'Address not available',
      },
      dateRange: {
        startDate: query.startDate,
        endDate: endDate.toISOString().split('T')[0],
        numberOfDays: query.numberOfDays,
      },
      days,
      totalAvailableSlots,
    };
  }

  private generateTimeSlots(startTime: string, endTime: string, durationMinutes: number): { startTime: string; endTime: string }[] {
    const slots: { startTime: string; endTime: string }[] = [];

    // Parse start and end times
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    // Generate slots
    for (let minutes = startMinutes; minutes + durationMinutes <= endMinutes; minutes += durationMinutes) {
      const slotStartHour = Math.floor(minutes / 60);
      const slotStartMinute = minutes % 60;
      const slotEndMinutes = minutes + durationMinutes;
      const slotEndHour = Math.floor(slotEndMinutes / 60);
      const slotEndMinute = slotEndMinutes % 60;

      slots.push({
        startTime: `${slotStartHour.toString().padStart(2, '0')}:${slotStartMinute.toString().padStart(2, '0')}`,
        endTime: `${slotEndHour.toString().padStart(2, '0')}:${slotEndMinute.toString().padStart(2, '0')}`,
      });
    }

    return slots;
  }

  private isTimeOverlapping(start1: string, end1: string, start2: string, end2: string): boolean {
    // Convert time strings to minutes for easier comparison
    const timeToMinutes = (time: string): number => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const start1Minutes = timeToMinutes(start1);
    const end1Minutes = timeToMinutes(end1);
    const start2Minutes = timeToMinutes(start2);
    const end2Minutes = timeToMinutes(end2);

    // Check if time ranges overlap
    return start1Minutes < end2Minutes && start2Minutes < end1Minutes;
  }

  /**
   * Check favorites for multiple businesses (bulk operation for efficiency)
   * Returns a Map of businessOwnerId -> isFavorite boolean
   */
  private async checkFavoritesForBusinesses(customerId: string, businessOwnerIds: string[]): Promise<Map<string, boolean>> {
    if (!customerId || businessOwnerIds.length === 0) {
      return new Map();
    }

    const favorites = await this.customerFavoriteRepository.find({
      where: { customerId },
      select: ['businessOwnerId'],
    });

    const favoriteMap = new Map<string, boolean>();
    const favoritedBusinessIds = new Set(favorites.map(f => f.businessOwnerId));

    businessOwnerIds.forEach(id => {
      favoriteMap.set(id, favoritedBusinessIds.has(id));
    });

    return favoriteMap;
  }

  /**
   * Calculate average rating and review count for a business
   * Only counts approved reviews
   */
  private async calculateBusinessRating(businessOwnerId: string): Promise<{ averageRating: number | null; reviewCount: number }> {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avgRating')
      .addSelect('COUNT(review.id)', 'reviewCount')
      .where('review.businessOwnerId = :businessOwnerId', { businessOwnerId })
      .andWhere('review.isApproved = :isApproved', { isApproved: true })
      .getRawOne();

    return {
      averageRating: result.avgRating ? parseFloat(parseFloat(result.avgRating).toFixed(1)) : null,
      reviewCount: parseInt(result.reviewCount) || 0,
    };
  }

  /**
   * Bulk calculate ratings for multiple businesses (for listing efficiency)
   */
  private async calculateBulkBusinessRatings(businessOwnerIds: string[]): Promise<Map<string, { averageRating: number | null; reviewCount: number }>> {
    if (businessOwnerIds.length === 0) {
      return new Map();
    }

    const results = await this.reviewRepository
      .createQueryBuilder('review')
      .select('review.businessOwnerId', 'businessOwnerId')
      .addSelect('AVG(review.rating)', 'avgRating')
      .addSelect('COUNT(review.id)', 'reviewCount')
      .where('review.businessOwnerId IN (:...businessOwnerIds)', { businessOwnerIds })
      .andWhere('review.isApproved = :isApproved', { isApproved: true })
      .groupBy('review.businessOwnerId')
      .getRawMany();

    const ratingsMap = new Map<string, { averageRating: number | null; reviewCount: number }>();

    // Initialize all businesses with null rating and 0 count
    businessOwnerIds.forEach(id => {
      ratingsMap.set(id, { averageRating: null, reviewCount: 0 });
    });

    // Update with actual ratings
    results.forEach(result => {
      ratingsMap.set(result.businessOwnerId, {
        averageRating: result.avgRating ? parseFloat(parseFloat(result.avgRating).toFixed(1)) : null,
        reviewCount: parseInt(result.reviewCount) || 0,
      });
    });

    return ratingsMap;
  }
}