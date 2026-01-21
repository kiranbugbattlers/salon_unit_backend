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
exports.BusinessService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../database/entities");
const distance_calculator_service_1 = require("../common/services/distance-calculator.service");
const dto_1 = require("./dto");
let BusinessService = class BusinessService {
    constructor(businessOwnerRepository, businessAddressRepository, businessMediaRepository, businessServiceRepository, serviceRepository, serviceCategoryRepository, staffRepository, staffServiceRepository, bookingRepository, staffWorkingHoursRepository, businessOperatingHoursRepository, servicePackageRepository, servicePackageItemRepository, customerRepository, customerFavoriteRepository, reviewRepository, distanceCalculatorService) {
        this.businessOwnerRepository = businessOwnerRepository;
        this.businessAddressRepository = businessAddressRepository;
        this.businessMediaRepository = businessMediaRepository;
        this.businessServiceRepository = businessServiceRepository;
        this.serviceRepository = serviceRepository;
        this.serviceCategoryRepository = serviceCategoryRepository;
        this.staffRepository = staffRepository;
        this.staffServiceRepository = staffServiceRepository;
        this.bookingRepository = bookingRepository;
        this.staffWorkingHoursRepository = staffWorkingHoursRepository;
        this.businessOperatingHoursRepository = businessOperatingHoursRepository;
        this.servicePackageRepository = servicePackageRepository;
        this.servicePackageItemRepository = servicePackageItemRepository;
        this.customerRepository = customerRepository;
        this.customerFavoriteRepository = customerFavoriteRepository;
        this.reviewRepository = reviewRepository;
        this.distanceCalculatorService = distanceCalculatorService;
    }
    async getBusinesses(query, userId, customerId) {
        try {
            this.validateLocationParams(query);
            let customerGender;
            if (customerId) {
                const customer = await this.customerRepository.findOne({
                    where: { id: customerId },
                    select: ['id', 'gender'],
                });
                customerGender = customer?.gender;
            }
            const queryBuilder = this.buildBaseQuery();
            this.applyCategoryFilter(queryBuilder, query);
            this.applyAvailabilityFilter(queryBuilder, query);
            this.applyPriceFilter(queryBuilder, query);
            this.applyGenderFilter(queryBuilder, query, customerGender);
            this.applyOperatingYearsFilter(queryBuilder, query);
            this.applySearchFilter(queryBuilder, query);
            if (query.lat && query.lng && query.radius) {
                this.applyLocationFilter(queryBuilder, query);
            }
            this.applySorting(queryBuilder, query);
            const totalQuery = queryBuilder.clone();
            const total = await totalQuery.getCount();
            this.applyPagination(queryBuilder, query);
            let businessOwners = await queryBuilder.getMany();
            let businesses = await this.transformToBusinessItems(businessOwners, query, userId, customerId);
            if (query.lat && query.lng) {
                let sortConfigs;
                if (query.sort) {
                    sortConfigs = this.parseSortString(query.sort);
                }
                else {
                    sortConfigs = [{ field: dto_1.BusinessSortField.DISTANCE, order: 'ASC' }];
                }
                const hasDistanceSort = sortConfigs.some(s => s.field === dto_1.BusinessSortField.DISTANCE);
                if (hasDistanceSort) {
                    businesses = this.sortBusinessesByDistance(businesses, query, sortConfigs);
                }
            }
            const meta = this.buildMetadata(query, total, businesses);
            const data = {
                businesses,
                meta,
            };
            return new dto_1.BusinessResponseDto(200, true, 'Businesses retrieved successfully', data);
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to retrieve businesses');
        }
    }
    async getBusinessDetail(shopId, userId, customerId) {
        try {
            let customerGender;
            if (customerId) {
                const customer = await this.customerRepository.findOne({
                    where: { id: customerId },
                    select: ['id', 'gender'],
                });
                customerGender = customer?.gender;
            }
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
                throw new common_1.BadRequestException('Business not found or not approved');
            }
            const address = businessOwner.addresses?.[0];
            const businessMedia = await this.businessMediaRepository.find({
                where: { businessOwnerId: businessOwner.id, isActive: true },
                order: { displayOrder: 'ASC', createdAt: 'ASC' },
            });
            let filteredBusinessServices = businessOwner.businessServices?.filter(bs => bs.isActive && bs.service.isActive) || [];
            if (customerGender && (customerGender === 'male' || customerGender === 'female')) {
                filteredBusinessServices = filteredBusinessServices.filter(bs => bs.service.gender === customerGender || bs.service.gender === 'both');
            }
            const services = filteredBusinessServices
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
                },
                isActive: bs.isActive,
            }));
            const staff = await this.staffRepository.find({
                where: { businessOwnerId: businessOwner.id, isActive: true },
                relations: ['staffServices'],
            });
            const staffDetails = staff.map(staffMember => ({
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
            const allOperatingHours = await this.businessOperatingHoursRepository.find({
                where: { businessOwnerId: businessOwner.id },
                order: { dayOfWeek: 'ASC' },
            });
            const closedDays = allOperatingHours
                .filter(hour => hour.isClosed)
                .map(hour => hour.dayOfWeek);
            const operatingHours = allOperatingHours.filter(hour => !hour.isClosed);
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
            const servicePackagesDto = servicePackages.map(pkg => {
                const packageItems = pkg.packageItems?.filter(item => item.businessService?.isActive && item.businessService?.service?.isActive) || [];
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
            const prices = services.map(s => s.customPrice).filter(p => p > 0);
            const priceRange = prices.length > 0 ? {
                min: Math.min(...prices),
                max: Math.max(...prices),
            } : undefined;
            const serviceLocationType = businessOwner.onboarding?.step3Data?.serviceLocationType;
            let userSpecific = undefined;
            if (customerId) {
                const isFavorite = await this.customerFavoriteRepository.findOne({
                    where: { customerId, businessOwnerId: businessOwner.id },
                });
                userSpecific = {
                    isFavorite: !!isFavorite,
                };
            }
            const businessDetail = {
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
            return new dto_1.BusinessDetailResponseDto(200, true, 'Business details retrieved successfully', businessDetail);
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to retrieve business details');
        }
    }
    async getBookedSlots(shopId, date, staffId) {
        try {
            const businessOwner = await this.businessOwnerRepository.findOne({
                where: { shopId, isApproved: true, isDefaulter: false },
            });
            if (!businessOwner) {
                throw new common_1.BadRequestException('Business not found or not approved');
            }
            let staff = null;
            let whereCondition = {
                businessOwnerId: businessOwner.id,
                appointmentDate: date,
                status: (0, typeorm_2.In)(['pending', 'confirmed', 'in-progress']),
            };
            if (staffId) {
                staff = await this.staffRepository.findOne({
                    where: { id: staffId, businessOwnerId: businessOwner.id, isActive: true },
                });
                if (!staff) {
                    throw new common_1.BadRequestException('Staff member not found or not active for this business');
                }
                whereCondition.staffId = staffId;
            }
            const bookings = await this.bookingRepository.find({
                where: whereCondition,
                relations: ['service', 'customer', 'staff'],
                order: { startTime: 'ASC' },
            });
            const bookedSlots = bookings.map(booking => ({
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
            const data = {
                date,
                staffId: staffId || undefined,
                shopId,
                staffName: staff ? `${staff.firstName} ${staff.lastName}` : undefined,
                bookedSlots,
                totalBookings: bookedSlots.length,
            };
            return new dto_1.BookedSlotsResponseDto(200, true, 'Booked slots retrieved successfully', data);
        }
        catch (error) {
            console.error('❌ Error in getBookedSlots:', error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to retrieve booked slots: ' + (error.message || error));
        }
    }
    validateLocationParams(query) {
        const hasLat = query.lat !== undefined;
        const hasLng = query.lng !== undefined;
        if (hasLat && !hasLng) {
            throw new common_1.BadRequestException('Longitude is required when latitude is provided');
        }
        if (hasLng && !hasLat) {
            throw new common_1.BadRequestException('Latitude is required when longitude is provided');
        }
    }
    buildBaseQuery() {
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
    applyCategoryFilter(queryBuilder, query) {
        if (query.category) {
            queryBuilder.andWhere('category.id = :categoryId', {
                categoryId: query.category,
            });
        }
    }
    applyAvailabilityFilter(queryBuilder, query) {
        if (query.availableAtHome !== undefined) {
            queryBuilder.andWhere('service.availableAtHome = :availableAtHome', {
                availableAtHome: query.availableAtHome,
            });
        }
    }
    applyPriceFilter(queryBuilder, query) {
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
    applyGenderFilter(queryBuilder, query, customerGender) {
        if (customerGender && (customerGender === 'male' || customerGender === 'female')) {
            queryBuilder.andWhere('(service.gender = :customerGender OR service.gender = :both)', {
                customerGender,
                both: 'both',
            });
        }
        if (query.gender) {
            queryBuilder.andWhere('(service.gender = :queryGender OR service.gender = :queryBoth)', {
                queryGender: query.gender,
                queryBoth: 'both',
            });
        }
    }
    applyOperatingYearsFilter(queryBuilder, query) {
        if (query.minOperatingYears !== undefined) {
            queryBuilder.andWhere('businessOwner.operatingYears >= :minOperatingYears', {
                minOperatingYears: query.minOperatingYears,
            });
        }
    }
    applySearchFilter(queryBuilder, query) {
        if (query.search) {
            queryBuilder.andWhere('(businessOwner.businessName ILIKE :search OR businessOwner.businessDescription ILIKE :search OR address.city ILIKE :search OR address.streetAddress ILIKE :search OR address.addressLine1 ILIKE :search OR address.landmark ILIKE :search)', { search: `%${query.search}%` });
        }
    }
    applyLocationFilter(queryBuilder, query) {
        const radius = query.radius;
        const latDelta = radius / 111;
        const lngDelta = radius / (111 * Math.cos((query.lat * Math.PI) / 180));
        queryBuilder
            .andWhere('address.latitude BETWEEN :minLat AND :maxLat', {
            minLat: query.lat - latDelta,
            maxLat: query.lat + latDelta,
        })
            .andWhere('address.longitude BETWEEN :minLng AND :maxLng', {
            minLng: query.lng - lngDelta,
            maxLng: query.lng + lngDelta,
        });
    }
    applySorting(queryBuilder, query) {
        if (!query.sort) {
            queryBuilder.orderBy('businessOwner.createdAt', 'DESC');
            return;
        }
        const sortConfigs = this.parseSortString(query.sort);
        sortConfigs.forEach((sortConfig, index) => {
            const orderMethod = index === 0 ? 'orderBy' : 'addOrderBy';
            switch (sortConfig.field) {
                case dto_1.BusinessSortField.NAME:
                    queryBuilder[orderMethod]('businessOwner.businessName', sortConfig.order.toUpperCase());
                    break;
                case dto_1.BusinessSortField.CREATED_AT:
                    queryBuilder[orderMethod]('businessOwner.createdAt', sortConfig.order.toUpperCase());
                    break;
                case dto_1.BusinessSortField.OPERATING_YEARS:
                    queryBuilder[orderMethod]('businessOwner.operatingYears', sortConfig.order.toUpperCase());
                    break;
                case dto_1.BusinessSortField.DISTANCE:
                    queryBuilder[orderMethod]('businessOwner.createdAt', 'DESC');
                    break;
                case dto_1.BusinessSortField.RATING:
                    queryBuilder[orderMethod]('businessOwner.createdAt', sortConfig.order.toUpperCase());
                    break;
                default:
                    queryBuilder[orderMethod]('businessOwner.createdAt', 'DESC');
            }
        });
    }
    parseSortString(sort) {
        return sort.split(',').map(field => {
            const trimmed = field.trim();
            if (trimmed.startsWith('-')) {
                return {
                    field: trimmed.substring(1),
                    order: dto_1.SortOrder.DESC,
                };
            }
            return {
                field: trimmed,
                order: dto_1.SortOrder.ASC,
            };
        });
    }
    applyPagination(queryBuilder, query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);
    }
    async transformToBusinessItems(businessOwners, query, userId, customerId) {
        let favoritesMap = new Map();
        const businessOwnerIds = businessOwners.map(bo => bo.id);
        if (customerId && businessOwners.length > 0) {
            favoritesMap = await this.checkFavoritesForBusinesses(customerId, businessOwnerIds);
        }
        const ratingsMap = await this.calculateBulkBusinessRatings(businessOwnerIds);
        return Promise.all(businessOwners.map(async (businessOwner) => {
            const address = businessOwner.addresses?.[0];
            let distance;
            if (query.lat && query.lng && address?.latitude && address?.longitude) {
                distance = this.distanceCalculatorService.calculateDistance({ latitude: query.lat, longitude: query.lng }, { latitude: address.latitude, longitude: address.longitude });
            }
            const businessMedia = await this.businessMediaRepository.find({
                where: { businessOwnerId: businessOwner.id, isActive: true },
                order: { displayOrder: 'ASC', createdAt: 'ASC' },
                take: 10,
            });
            const userSpecific = customerId ? {
                isFavorite: favoritesMap.get(businessOwner.id) || false,
            } : undefined;
            const businessItem = {
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
                } : undefined,
                businessMedia: businessMedia.map(media => ({
                    id: media.id,
                    mediaUrl: media.mediaUrl,
                    mediaCdnUrl: media.cdnUrl,
                    mediaType: media.mediaType,
                    createdAt: media.createdAt,
                })),
                averageRating: ratingsMap.get(businessOwner.id)?.averageRating ?? null,
                reviewCount: ratingsMap.get(businessOwner.id)?.reviewCount ?? 0,
                userSpecific,
                createdAt: businessOwner.createdAt,
                updatedAt: businessOwner.updatedAt,
            };
            return businessItem;
        }));
    }
    sortBusinessesByDistance(businesses, query, sortConfigs) {
        return businesses.sort((a, b) => {
            for (const sortConfig of sortConfigs) {
                let compareResult = 0;
                switch (sortConfig.field) {
                    case dto_1.BusinessSortField.DISTANCE:
                        const aDistance = a.businessAddress?.distance ?? Infinity;
                        const bDistance = b.businessAddress?.distance ?? Infinity;
                        compareResult = aDistance - bDistance;
                        break;
                    case dto_1.BusinessSortField.NAME:
                        compareResult = (a.businessName || '').localeCompare(b.businessName || '');
                        break;
                    case dto_1.BusinessSortField.OPERATING_YEARS:
                        compareResult = (a.operatingYears || 0) - (b.operatingYears || 0);
                        break;
                    case dto_1.BusinessSortField.CREATED_AT:
                        compareResult = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                        break;
                }
                if (compareResult !== 0) {
                    return sortConfig.order === dto_1.SortOrder.DESC ? -compareResult : compareResult;
                }
            }
            return 0;
        });
    }
    buildMetadata(query, total, businesses) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const totalPages = Math.ceil(total / limit);
        const filters = {};
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
    async getAvailableSlots(shopId, query) {
        const business = await this.businessOwnerRepository.findOne({
            where: { shopId: shopId },
            relations: ['addresses'],
        });
        if (!business) {
            throw new common_1.BadRequestException('Business not found');
        }
        const startDate = new Date(query.startDate);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + query.numberOfDays - 1);
        const dates = [];
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            dates.push(new Date(d));
        }
        const businessHours = await this.businessOperatingHoursRepository.find({
            where: { businessOwnerId: business.id },
        });
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
            throw new common_1.BadRequestException('No staff found for the specified criteria');
        }
        const staffIds = staff.map(s => s.id);
        const staffWorkingHours = await this.staffWorkingHoursRepository.find({
            where: { staffId: (0, typeorm_2.In)(staffIds), isActive: true },
        });
        const bookings = await this.bookingRepository.find({
            where: {
                businessOwnerId: business.id,
                staffId: (0, typeorm_2.In)(staffIds),
                appointmentDate: (0, typeorm_2.In)(dates),
                status: (0, typeorm_2.In)(['pending', 'confirmed', 'in-progress']),
            },
            relations: ['service'],
        });
        const days = [];
        for (const date of dates) {
            const dayOfWeek = date.getDay();
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
            const dateStr = date.toISOString().split('T')[0];
            const businessHour = businessHours.find(bh => bh.dayOfWeek === dayOfWeek);
            const isBusinessOpen = businessHour && !businessHour.isClosed;
            const dayAvailability = {
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
                const timeSlots = [];
                for (const staffMember of staff) {
                    const staffWorkingHour = staffWorkingHours.find(swh => swh.staffId === staffMember.id && swh.dayOfWeek === dayOfWeek);
                    if (staffWorkingHour) {
                        const slots = this.generateTimeSlots(staffWorkingHour.startTime, staffWorkingHour.endTime, 60);
                        for (const slot of slots) {
                            const isSlotBooked = bookings.some(booking => booking.staffId === staffMember.id &&
                                booking.appointmentDate.toISOString().split('T')[0] === dateStr &&
                                this.isTimeOverlapping(slot.startTime, slot.endTime, booking.startTime, booking.endTime));
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
        const totalAvailableSlots = days.reduce((total, day) => total + day.timeSlots.filter(slot => slot.isAvailable).length, 0);
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
    generateTimeSlots(startTime, endTime, durationMinutes) {
        const slots = [];
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;
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
    isTimeOverlapping(start1, end1, start2, end2) {
        const timeToMinutes = (time) => {
            const [hours, minutes] = time.split(':').map(Number);
            return hours * 60 + minutes;
        };
        const start1Minutes = timeToMinutes(start1);
        const end1Minutes = timeToMinutes(end1);
        const start2Minutes = timeToMinutes(start2);
        const end2Minutes = timeToMinutes(end2);
        return start1Minutes < end2Minutes && start2Minutes < end1Minutes;
    }
    async checkFavoritesForBusinesses(customerId, businessOwnerIds) {
        if (!customerId || businessOwnerIds.length === 0) {
            return new Map();
        }
        const favorites = await this.customerFavoriteRepository.find({
            where: { customerId },
            select: ['businessOwnerId'],
        });
        const favoriteMap = new Map();
        const favoritedBusinessIds = new Set(favorites.map(f => f.businessOwnerId));
        businessOwnerIds.forEach(id => {
            favoriteMap.set(id, favoritedBusinessIds.has(id));
        });
        return favoriteMap;
    }
    async calculateBusinessRating(businessOwnerId) {
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
    async calculateBulkBusinessRatings(businessOwnerIds) {
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
        const ratingsMap = new Map();
        businessOwnerIds.forEach(id => {
            ratingsMap.set(id, { averageRating: null, reviewCount: 0 });
        });
        results.forEach(result => {
            ratingsMap.set(result.businessOwnerId, {
                averageRating: result.avgRating ? parseFloat(parseFloat(result.avgRating).toFixed(1)) : null,
                reviewCount: parseInt(result.reviewCount) || 0,
            });
        });
        return ratingsMap;
    }
};
exports.BusinessService = BusinessService;
exports.BusinessService = BusinessService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.BusinessOwner)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.BusinessAddress)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.BusinessMedia)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.BusinessService)),
    __param(4, (0, typeorm_1.InjectRepository)(entities_1.Service)),
    __param(5, (0, typeorm_1.InjectRepository)(entities_1.ServiceCategory)),
    __param(6, (0, typeorm_1.InjectRepository)(entities_1.Staff)),
    __param(7, (0, typeorm_1.InjectRepository)(entities_1.StaffService)),
    __param(8, (0, typeorm_1.InjectRepository)(entities_1.Booking)),
    __param(9, (0, typeorm_1.InjectRepository)(entities_1.StaffWorkingHours)),
    __param(10, (0, typeorm_1.InjectRepository)(entities_1.BusinessOperatingHours)),
    __param(11, (0, typeorm_1.InjectRepository)(entities_1.ServicePackage)),
    __param(12, (0, typeorm_1.InjectRepository)(entities_1.ServicePackageItem)),
    __param(13, (0, typeorm_1.InjectRepository)(entities_1.Customer)),
    __param(14, (0, typeorm_1.InjectRepository)(entities_1.CustomerFavorite)),
    __param(15, (0, typeorm_1.InjectRepository)(entities_1.Review)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        distance_calculator_service_1.DistanceCalculatorService])
], BusinessService);
//# sourceMappingURL=business.service.js.map