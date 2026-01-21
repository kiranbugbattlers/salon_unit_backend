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
exports.ServiceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../../database/entities");
const s3_service_1 = require("../../common/services/s3.service");
const service_gender_enum_1 = require("../../common/enums/service-gender.enum");
const dto_1 = require("../dto");
let ServiceService = class ServiceService {
    constructor(serviceRepository, serviceCategoryRepository, s3Service) {
        this.serviceRepository = serviceRepository;
        this.serviceCategoryRepository = serviceCategoryRepository;
        this.s3Service = s3Service;
    }
    async create(createDto, file) {
        const category = await this.serviceCategoryRepository.findOne({
            where: { id: createDto.categoryId, isActive: true },
        });
        if (!category) {
            throw new common_1.NotFoundException('Service category not found or inactive');
        }
        const existingService = await this.serviceRepository.findOne({
            where: { name: createDto.name, categoryId: createDto.categoryId },
        });
        if (existingService) {
            throw new common_1.ConflictException('Service with this name already exists in the category');
        }
        if (createDto.gender && !Object.values(service_gender_enum_1.ServiceGenderEnum).includes(createDto.gender)) {
            throw new common_1.BadRequestException(`Invalid gender: ${createDto.gender}. Must be one of: ${Object.values(service_gender_enum_1.ServiceGenderEnum).join(', ')}`);
        }
        const service = this.serviceRepository.create(createDto);
        let savedService = await this.serviceRepository.save(service);
        if (file) {
            const uploadResult = await this.s3Service.uploadFile(file, {
                folder: 'services',
                prefix: `service-${savedService.id}`,
                publicRead: true,
            });
            savedService = await this.serviceRepository.save({
                ...savedService,
                image: uploadResult.cdnUrl,
                imageS3Key: uploadResult.key,
            });
        }
        return this.findOne(savedService.id);
    }
    async findAll(page = 1, limit = 10, categoryId, isActive, availableAtHome) {
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
    async findOne(id) {
        const service = await this.serviceRepository
            .createQueryBuilder('service')
            .leftJoinAndSelect('service.category', 'category')
            .where('service.id = :id', { id })
            .getOne();
        if (!service) {
            throw new common_1.NotFoundException('Service not found');
        }
        return this.mapToResponseDto(service);
    }
    async update(id, updateDto) {
        const service = await this.serviceRepository.findOne({
            where: { id },
        });
        if (!service) {
            throw new common_1.NotFoundException('Service not found');
        }
        if (updateDto.categoryId && updateDto.categoryId !== service.categoryId) {
            const category = await this.serviceCategoryRepository.findOne({
                where: { id: updateDto.categoryId, isActive: true },
            });
            if (!category) {
                throw new common_1.NotFoundException('Service category not found or inactive');
            }
        }
        if (updateDto.name && updateDto.name !== service.name) {
            const existingService = await this.serviceRepository.findOne({
                where: {
                    name: updateDto.name,
                    categoryId: updateDto.categoryId || service.categoryId
                },
            });
            if (existingService && existingService.id !== id) {
                throw new common_1.ConflictException('Service with this name already exists in the category');
            }
        }
        if (updateDto.gender && !Object.values(service_gender_enum_1.ServiceGenderEnum).includes(updateDto.gender)) {
            throw new common_1.BadRequestException(`Invalid gender: ${updateDto.gender}. Must be one of: ${Object.values(service_gender_enum_1.ServiceGenderEnum).join(', ')}`);
        }
        const updatedService = await this.serviceRepository.save({
            ...service,
            ...updateDto,
        });
        return this.findOne(id);
    }
    async remove(id) {
        const service = await this.serviceRepository.findOne({
            where: { id },
            relations: ['staffServices'],
        });
        if (!service) {
            throw new common_1.NotFoundException('Service not found');
        }
        if (service.staffServices && service.staffServices.length > 0) {
            throw new common_1.BadRequestException('Cannot delete service with staff assignments');
        }
        const bookingServicesCount = await this.serviceRepository.manager.query('SELECT COUNT(*) as count FROM booking_services WHERE service_id = $1', [id]);
        if (bookingServicesCount && bookingServicesCount[0]?.count > 0) {
            throw new common_1.BadRequestException('Cannot delete service that has been used in bookings. Consider deactivating it instead.');
        }
        await this.serviceRepository.remove(service);
    }
    async toggleActive(id) {
        const service = await this.serviceRepository.findOne({
            where: { id },
        });
        if (!service) {
            throw new common_1.NotFoundException('Service not found');
        }
        const updatedService = await this.serviceRepository.save({
            ...service,
            isActive: !service.isActive,
        });
        return this.findOne(id);
    }
    async findServicesGroupedByCategory(page = 1, limit = 10, isActive, availableAtHome) {
        const skip = (page - 1) * limit;
        const categoryQuery = this.serviceCategoryRepository
            .createQueryBuilder('category')
            .where('category.isActive = :isActive', { isActive: true })
            .orderBy('category.name', 'ASC');
        const categories = await categoryQuery.getMany();
        const categoriesWithServices = [];
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
        const total = categoriesWithServices.length;
        const paginatedCategories = categoriesWithServices.slice(skip, skip + limit);
        return new dto_1.ServicesGroupedByCategoryResponseDto(200, true, 'Services grouped by categories retrieved successfully', {
            categories: paginatedCategories,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        });
    }
    async findByCategory(categoryId) {
        const services = await this.serviceRepository
            .createQueryBuilder('service')
            .leftJoinAndSelect('service.category', 'category')
            .where('service.categoryId = :categoryId', { categoryId })
            .andWhere('service.isActive = :isActive', { isActive: true })
            .orderBy('service.name', 'ASC')
            .getMany();
        return services.map(service => this.mapToResponseDto(service));
    }
    async uploadImage(id, file) {
        const service = await this.serviceRepository.findOne({
            where: { id },
        });
        if (!service) {
            throw new common_1.NotFoundException('Service not found');
        }
        if (service.imageS3Key) {
            try {
                await this.s3Service.deleteFile(service.imageS3Key);
            }
            catch (error) {
                console.warn('Failed to delete old service image:', error);
            }
        }
        const uploadResult = await this.s3Service.uploadFile(file, {
            folder: 'services',
            prefix: `service-${id}`,
            publicRead: true,
        });
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
    async deleteImage(id) {
        const service = await this.serviceRepository.findOne({
            where: { id },
        });
        if (!service) {
            throw new common_1.NotFoundException('Service not found');
        }
        if (!service.imageS3Key) {
            throw new common_1.NotFoundException('No image found for this service');
        }
        await this.s3Service.deleteFile(service.imageS3Key);
        await this.serviceRepository.update(id, {
            image: null,
            imageS3Key: null,
        });
        return { message: 'Service image deleted successfully' };
    }
    mapToResponseDto(service) {
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
    mapToServiceInCategoryDto(service) {
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
};
exports.ServiceService = ServiceService;
exports.ServiceService = ServiceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Service)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.ServiceCategory)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        s3_service_1.S3Service])
], ServiceService);
//# sourceMappingURL=service.service.js.map