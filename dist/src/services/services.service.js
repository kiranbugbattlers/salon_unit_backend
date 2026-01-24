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
exports.ServicesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../database/entities");
const distance_calculator_service_1 = require("../common/services/distance-calculator.service");
const dto_1 = require("./dto");
let ServicesService = class ServicesService {
    constructor(businessServiceRepository, businessOwnerRepository, businessAddressRepository, serviceRepository, serviceCategoryRepository, distanceCalculatorService) {
        this.businessServiceRepository = businessServiceRepository;
        this.businessOwnerRepository = businessOwnerRepository;
        this.businessAddressRepository = businessAddressRepository;
        this.serviceRepository = serviceRepository;
        this.serviceCategoryRepository = serviceCategoryRepository;
        this.distanceCalculatorService = distanceCalculatorService;
    }
    async getServices(query, userId) {
        try {
            this.validateLocationParams(query);
            const queryBuilder = this.buildBaseQuery();
            this.applyStatusFilter(queryBuilder, query);
            this.applyCategoryFilter(queryBuilder, query);
            this.applyAvailabilityFilter(queryBuilder, query);
            this.applyPriceFilter(queryBuilder, query);
            this.applyGenderFilter(queryBuilder, query);
            if (query.lat && query.lng && query.radius) {
                this.applyLocationFilter(queryBuilder, query);
            }
            this.applySorting(queryBuilder, query);
            const totalQuery = queryBuilder.clone();
            const total = await totalQuery.getCount();
            this.applyPagination(queryBuilder, query);
            let businessServices = await queryBuilder.getMany();
            let services = await this.transformToServiceItems(businessServices, query, userId);
            if (query.sort && query.lat && query.lng) {
                const sortConfigs = this.parseSortString(query.sort);
                const hasDistanceSort = sortConfigs.some(s => s.field === dto_1.ServiceSortField.DISTANCE);
                if (hasDistanceSort) {
                    services = this.sortServicesByDistance(services, query, sortConfigs);
                }
            }
            const meta = this.buildMetadata(query, total, services);
            const data = {
                services,
                meta,
            };
            return new dto_1.ServicesResponseDto(200, true, 'Services retrieved successfully', data);
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to retrieve services');
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
    applyStatusFilter(queryBuilder, query) {
        if (query.status === 'inactive') {
            queryBuilder.andWhere('businessService.isActive = :isActive', { isActive: false });
        }
    }
    applyCategoryFilter(queryBuilder, query) {
        if (query.category) {
            queryBuilder.andWhere('category.name ILIKE :categoryName', {
                categoryName: `%${query.category}%`,
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
    applyGenderFilter(queryBuilder, query) {
        if (query.gender) {
            queryBuilder.andWhere('(service.gender = :gender OR service.gender = :both)', {
                gender: query.gender,
                both: 'both',
            });
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
            queryBuilder.orderBy('businessService.createdAt', 'DESC');
            return;
        }
        const sortConfigs = this.parseSortString(query.sort);
        sortConfigs.forEach((sortConfig, index) => {
            const orderMethod = index === 0 ? 'orderBy' : 'addOrderBy';
            switch (sortConfig.field) {
                case dto_1.ServiceSortField.PRICE:
                    queryBuilder[orderMethod]('businessService.customPrice', sortConfig.order.toUpperCase());
                    break;
                case dto_1.ServiceSortField.NAME:
                    queryBuilder[orderMethod]('service.name', sortConfig.order.toUpperCase());
                    break;
                case dto_1.ServiceSortField.CREATED_AT:
                    queryBuilder[orderMethod]('businessService.createdAt', sortConfig.order.toUpperCase());
                    break;
                case dto_1.ServiceSortField.DISTANCE:
                    queryBuilder[orderMethod]('businessService.createdAt', 'DESC');
                    break;
                case dto_1.ServiceSortField.RATING:
                    queryBuilder[orderMethod]('businessService.createdAt', sortConfig.order.toUpperCase());
                    break;
                default:
                    queryBuilder[orderMethod]('businessService.createdAt', 'DESC');
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
    async transformToServiceItems(businessServices, query, userId) {
        return Promise.all(businessServices.map(async (businessService) => {
            const service = businessService.service;
            const businessOwner = businessService.businessOwner;
            const address = businessOwner.addresses?.[0];
            let distance;
            if (query.lat && query.lng && address?.latitude && address?.longitude) {
                distance = this.distanceCalculatorService.calculateDistance({ latitude: query.lat, longitude: query.lng }, { latitude: address.latitude, longitude: address.longitude });
            }
            const serviceItem = {
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
                },
                businessOwner: {
                    id: businessOwner.id,
                    shopId: businessOwner.shopId,
                    businessName: businessOwner.businessName,
                    businessDescription: businessOwner.businessDescription,
                    isApproved: businessOwner.isApproved,
                },
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
                isActive: businessService.isActive,
                createdAt: businessService.createdAt,
                updatedAt: businessService.updatedAt,
            };
            if (query.userspecific && userId) {
                serviceItem.userSpecific = await this.getUserSpecificData(businessService.id, userId);
            }
            return serviceItem;
        }));
    }
    async getUserSpecificData(businessServiceId, userId) {
        return {
            isFavorite: false,
            lastBookedAt: undefined,
            bookingCount: 0,
        };
    }
    sortServicesByDistance(services, query, sortConfigs) {
        return services.sort((a, b) => {
            const distanceSort = sortConfigs.find(s => s.field === dto_1.ServiceSortField.DISTANCE);
            if (!distanceSort || !a.businessAddress?.distance || !b.businessAddress?.distance) {
                return 0;
            }
            const diff = a.businessAddress.distance - b.businessAddress.distance;
            return distanceSort.order === dto_1.SortOrder.ASC ? diff : -diff;
        });
    }
    buildMetadata(query, total, services) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const totalPages = Math.ceil(total / limit);
        const meta = {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        };
        const filters = {};
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
};
exports.ServicesService = ServicesService;
exports.ServicesService = ServicesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.BusinessService)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.BusinessOwner)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.BusinessAddress)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.Service)),
    __param(4, (0, typeorm_1.InjectRepository)(entities_1.ServiceCategory)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        distance_calculator_service_1.DistanceCalculatorService])
], ServicesService);
//# sourceMappingURL=services.service.js.map