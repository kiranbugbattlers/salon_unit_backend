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
exports.AdvertisementService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../database/entities");
const s3_service_1 = require("../common/services/s3.service");
let AdvertisementService = class AdvertisementService {
    constructor(advertisementRepository, s3Service) {
        this.advertisementRepository = advertisementRepository;
        this.s3Service = s3Service;
    }
    async create(createDto, mediaFile, adminId) {
        if (createDto.startDate && createDto.endDate) {
            const start = new Date(createDto.startDate);
            const end = new Date(createDto.endDate);
            if (start >= end) {
                throw new common_1.BadRequestException('Start date must be before end date');
            }
        }
        this.validateTargetScreens(createDto.targetUserTypes, createDto.targetScreens);
        let mediaUrl;
        try {
            const uploadResult = await this.s3Service.uploadFile(mediaFile, {
                folder: 'advertisements',
            });
            mediaUrl = uploadResult.url;
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to upload media file');
        }
        const advertisement = this.advertisementRepository.create({
            ...createDto,
            mediaUrl,
            createdBy: adminId,
            startDate: createDto.startDate ? new Date(createDto.startDate) : undefined,
            endDate: createDto.endDate ? new Date(createDto.endDate) : undefined,
        });
        return await this.advertisementRepository.save(advertisement);
    }
    async findAll(queryDto) {
        const { page = 1, limit = 10, isActive, userType, screen } = queryDto;
        const skip = (page - 1) * limit;
        const queryBuilder = this.advertisementRepository
            .createQueryBuilder('ad')
            .leftJoinAndSelect('ad.admin', 'admin')
            .orderBy('ad.priority', 'DESC')
            .addOrderBy('ad.createdAt', 'DESC')
            .skip(skip)
            .take(limit);
        if (isActive !== undefined) {
            queryBuilder.andWhere('ad.isActive = :isActive', { isActive });
        }
        if (userType) {
            queryBuilder.andWhere("ad.targetUserTypes @> :userType::jsonb", { userType: JSON.stringify([userType]) });
        }
        if (screen && userType) {
            queryBuilder.andWhere(`ad.target_screens->'${userType}' @> :screen::jsonb`, { screen: JSON.stringify([screen]) });
        }
        const [data, total] = await queryBuilder.getManyAndCount();
        return {
            data,
            total,
            page,
            limit,
        };
    }
    async findOne(id) {
        const advertisement = await this.advertisementRepository.findOne({
            where: { id },
            relations: ['admin'],
        });
        if (!advertisement) {
            throw new common_1.NotFoundException(`Advertisement with ID ${id} not found`);
        }
        return advertisement;
    }
    async findActiveAds(userType, screen) {
        const currentDate = new Date();
        const queryBuilder = this.advertisementRepository
            .createQueryBuilder('ad')
            .where('ad.isActive = :isActive', { isActive: true })
            .andWhere("ad.targetUserTypes @> :userType::jsonb", { userType: JSON.stringify([userType]) })
            .andWhere(`ad.target_screens->'${userType}' @> :screen::jsonb`, { screen: JSON.stringify([screen]) })
            .andWhere('(ad.startDate IS NULL OR ad.startDate <= :currentDate)', { currentDate })
            .andWhere('(ad.endDate IS NULL OR ad.endDate >= :currentDate)', { currentDate })
            .orderBy('ad.priority', 'DESC')
            .addOrderBy('ad.createdAt', 'DESC');
        return await queryBuilder.getMany();
    }
    async update(id, updateDto, mediaFile) {
        const advertisement = await this.findOne(id);
        if (updateDto.startDate && updateDto.endDate) {
            const start = new Date(updateDto.startDate);
            const end = new Date(updateDto.endDate);
            if (start >= end) {
                throw new common_1.BadRequestException('Start date must be before end date');
            }
        }
        if (updateDto.targetUserTypes && updateDto.targetScreens) {
            this.validateTargetScreens(updateDto.targetUserTypes, updateDto.targetScreens);
        }
        if (mediaFile) {
            try {
                await this.s3Service.deleteFile(advertisement.mediaUrl);
                const uploadResult = await this.s3Service.uploadFile(mediaFile, {
                    folder: 'advertisements',
                });
                updateDto.mediaType = updateDto.mediaType;
                advertisement.mediaUrl = uploadResult.url;
            }
            catch (error) {
                throw new common_1.InternalServerErrorException('Failed to replace media file');
            }
        }
        Object.assign(advertisement, {
            ...updateDto,
            startDate: updateDto.startDate ? new Date(updateDto.startDate) : advertisement.startDate,
            endDate: updateDto.endDate ? new Date(updateDto.endDate) : advertisement.endDate,
        });
        return await this.advertisementRepository.save(advertisement);
    }
    async remove(id) {
        const advertisement = await this.findOne(id);
        try {
            await this.s3Service.deleteFile(advertisement.mediaUrl);
        }
        catch (error) {
            console.error('Failed to delete media from S3:', error);
        }
        await this.advertisementRepository.remove(advertisement);
    }
    async toggleActive(id) {
        const advertisement = await this.findOne(id);
        advertisement.isActive = !advertisement.isActive;
        return await this.advertisementRepository.save(advertisement);
    }
    async trackImpression(id, count = 1) {
        await this.advertisementRepository.increment({ id }, 'impressionCount', count);
    }
    async trackClick(id, count = 1) {
        await this.advertisementRepository.increment({ id }, 'clickCount', count);
    }
    async getAnalytics() {
        const totalAds = await this.advertisementRepository.count();
        const activeAds = await this.advertisementRepository.count({ where: { isActive: true } });
        const stats = await this.advertisementRepository
            .createQueryBuilder('ad')
            .select('SUM(ad.impressionCount)', 'totalImpressions')
            .addSelect('SUM(ad.clickCount)', 'totalClicks')
            .getRawOne();
        const topPerformingAds = await this.advertisementRepository.find({
            where: { isActive: true },
            order: { clickCount: 'DESC' },
            take: 10,
            relations: ['admin'],
        });
        return {
            totalAds,
            activeAds,
            totalImpressions: parseInt(stats.totalImpressions) || 0,
            totalClicks: parseInt(stats.totalClicks) || 0,
            topPerformingAds,
        };
    }
    validateTargetScreens(userTypes, targetScreens) {
        for (const userType of userTypes) {
            if (!targetScreens[userType] || targetScreens[userType].length === 0) {
                throw new common_1.BadRequestException(`At least one screen must be specified for user type: ${userType}`);
            }
        }
    }
};
exports.AdvertisementService = AdvertisementService;
exports.AdvertisementService = AdvertisementService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Advertisement)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        s3_service_1.S3Service])
], AdvertisementService);
//# sourceMappingURL=advertisement.service.js.map