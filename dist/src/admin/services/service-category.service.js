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
exports.ServiceCategoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../../database/entities");
const s3_service_1 = require("../../common/services/s3.service");
const dto_1 = require("../dto");
let ServiceCategoryService = class ServiceCategoryService {
    constructor(serviceCategoryRepository, s3Service) {
        this.serviceCategoryRepository = serviceCategoryRepository;
        this.s3Service = s3Service;
    }
    async create(createDto, file) {
        const existingCategory = await this.serviceCategoryRepository.findOne({
            where: { name: createDto.name },
        });
        if (existingCategory) {
            throw new common_1.ConflictException('Service category with this name already exists');
        }
        const category = this.serviceCategoryRepository.create(createDto);
        let savedCategory = await this.serviceCategoryRepository.save(category);
        if (file) {
            const uploadResult = await this.s3Service.uploadFile(file, {
                folder: 'service-categories',
                prefix: `category-${savedCategory.id}`,
                publicRead: true,
            });
            savedCategory = await this.serviceCategoryRepository.save({
                ...savedCategory,
                image: uploadResult.cdnUrl,
                imageS3Key: uploadResult.key,
            });
        }
        const responseData = this.mapToResponseDto(savedCategory);
        return new dto_1.ServiceCategoryApiResponseDto(201, true, 'Service category created successfully', responseData);
    }
    async findAll(page = 1, limit = 10, isActive) {
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
        const listData = {
            categories: categories.map(category => this.mapToResponseDto(category)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
        return new dto_1.ServiceCategoryListApiResponseDto(200, true, 'Service categories retrieved successfully', listData);
    }
    async findOne(id) {
        const category = await this.serviceCategoryRepository.findOne({
            where: { id },
            relations: ['services'],
        });
        if (!category) {
            throw new common_1.NotFoundException('Service category not found');
        }
        const responseData = this.mapToResponseDto(category);
        return new dto_1.ServiceCategoryApiResponseDto(200, true, 'Service category retrieved successfully', responseData);
    }
    async update(id, updateDto) {
        const category = await this.serviceCategoryRepository.findOne({
            where: { id },
        });
        if (!category) {
            throw new common_1.NotFoundException('Service category not found');
        }
        if (updateDto.name && updateDto.name !== category.name) {
            const existingCategory = await this.serviceCategoryRepository.findOne({
                where: { name: updateDto.name },
            });
            if (existingCategory) {
                throw new common_1.ConflictException('Service category with this name already exists');
            }
        }
        const updatedCategory = await this.serviceCategoryRepository.save({
            ...category,
            ...updateDto,
        });
        const responseData = this.mapToResponseDto(updatedCategory);
        return new dto_1.ServiceCategoryApiResponseDto(200, true, 'Service category updated successfully', responseData);
    }
    async remove(id) {
        const category = await this.serviceCategoryRepository.findOne({
            where: { id },
            relations: ['services'],
        });
        if (!category) {
            throw new common_1.NotFoundException('Service category not found');
        }
        if (category.services && category.services.length > 0) {
            throw new common_1.BadRequestException('Cannot delete category with associated services');
        }
        await this.serviceCategoryRepository.remove(category);
    }
    async toggleActive(id) {
        const category = await this.serviceCategoryRepository.findOne({
            where: { id },
        });
        if (!category) {
            throw new common_1.NotFoundException('Service category not found');
        }
        const updatedCategory = await this.serviceCategoryRepository.save({
            ...category,
            isActive: !category.isActive,
        });
        const responseData = this.mapToResponseDto(updatedCategory);
        return new dto_1.ServiceCategoryApiResponseDto(200, true, 'Service category status toggled successfully', responseData);
    }
    async uploadImage(id, file) {
        const category = await this.serviceCategoryRepository.findOne({
            where: { id },
        });
        if (!category) {
            throw new common_1.NotFoundException('Service category not found');
        }
        if (category.imageS3Key) {
            try {
                await this.s3Service.deleteFile(category.imageS3Key);
            }
            catch (error) {
                console.warn('Failed to delete old category image:', error);
            }
        }
        const uploadResult = await this.s3Service.uploadFile(file, {
            folder: 'service-categories',
            prefix: `category-${id}`,
            publicRead: true,
        });
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
    async deleteImage(id) {
        const category = await this.serviceCategoryRepository.findOne({
            where: { id },
        });
        if (!category) {
            throw new common_1.NotFoundException('Service category not found');
        }
        if (!category.imageS3Key) {
            throw new common_1.NotFoundException('No image found for this category');
        }
        await this.s3Service.deleteFile(category.imageS3Key);
        await this.serviceCategoryRepository.update(id, {
            image: null,
            imageS3Key: null,
        });
        return { message: 'Category image deleted successfully' };
    }
    mapToResponseDto(category) {
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
};
exports.ServiceCategoryService = ServiceCategoryService;
exports.ServiceCategoryService = ServiceCategoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.ServiceCategory)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        s3_service_1.S3Service])
], ServiceCategoryService);
//# sourceMappingURL=service-category.service.js.map