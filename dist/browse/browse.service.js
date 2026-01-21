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
exports.BrowseService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../database/entities");
const dto_1 = require("../business-owner/dto");
let BrowseService = class BrowseService {
    constructor(businessOwnerRepository, servicePackageRepository) {
        this.businessOwnerRepository = businessOwnerRepository;
        this.servicePackageRepository = servicePackageRepository;
    }
    async browseServicePackages(shopId, page = 1, limit = 10, isActive = true) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { shopId, isApproved: true, isDefaulter: false },
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business not found');
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
        const responseData = {
            packages: packageData,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
        return new dto_1.ServicePackageListResponseDto(200, true, 'Service packages retrieved successfully', responseData);
    }
    async browseServicePackageById(shopId, packageId) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { shopId, isApproved: true, isDefaulter: false },
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business not found');
        }
        const servicePackage = await this.servicePackageRepository.findOne({
            where: {
                id: packageId,
                businessOwnerId: businessOwner.id,
                isActive: true
            },
            relations: [
                'packageItems',
                'packageItems.businessService',
                'packageItems.businessService.service',
                'packageItems.businessService.service.category',
            ],
        });
        if (!servicePackage) {
            throw new common_1.NotFoundException('Service package not found');
        }
        servicePackage.packageItems = servicePackage.packageItems.filter(item => item.businessService.isActive);
        return this.mapToServicePackageResponseDto(servicePackage);
    }
    mapToServicePackageResponseDto(servicePackage) {
        const packageItems = servicePackage.packageItems || [];
        let totalOriginalPrice = 0;
        let totalDiscountedPrice = 0;
        let totalDurationMinutes = 0;
        const services = packageItems.map(item => {
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
                finalPrice: 0,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
            };
        });
        const discountPercent = Number(servicePackage.discountPercentage) || 0;
        const packageDiscountAmount = (totalOriginalPrice * discountPercent) / 100;
        totalDiscountedPrice = totalOriginalPrice - packageDiscountAmount;
        const totalSavings = totalOriginalPrice - totalDiscountedPrice;
        services.forEach(service => {
            if (totalOriginalPrice > 0) {
                const serviceDiscountAmount = (service.customPrice * discountPercent) / 100;
                service.finalPrice = service.customPrice - serviceDiscountAmount;
            }
            else {
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
};
exports.BrowseService = BrowseService;
exports.BrowseService = BrowseService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.BusinessOwner)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.ServicePackage)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], BrowseService);
//# sourceMappingURL=browse.service.js.map