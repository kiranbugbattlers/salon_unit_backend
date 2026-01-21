import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, IsNull } from 'typeorm';
import { Advertisement } from '../database/entities';
import { CreateAdvertisementDto } from './dto/create-advertisement.dto';
import { UpdateAdvertisementDto } from './dto/update-advertisement.dto';
import { AdvertisementQueryDto } from './dto/advertisement-query.dto';
import { S3Service } from '../common/services/s3.service';
import { AdUserType } from '../common/enums';

@Injectable()
export class AdvertisementService {
  constructor(
    @InjectRepository(Advertisement)
    private advertisementRepository: Repository<Advertisement>,
    private s3Service: S3Service,
  ) {}

  async create(
    createDto: CreateAdvertisementDto,
    mediaFile: Express.Multer.File,
    adminId: string,
  ): Promise<Advertisement> {
    // Validate date range
    if (createDto.startDate && createDto.endDate) {
      const start = new Date(createDto.startDate);
      const end = new Date(createDto.endDate);
      if (start >= end) {
        throw new BadRequestException('Start date must be before end date');
      }
    }

    // Validate targetScreens structure
    this.validateTargetScreens(createDto.targetUserTypes, createDto.targetScreens);

    // Upload media to S3
    let mediaUrl: string;
    try {
      const uploadResult = await this.s3Service.uploadFile(mediaFile, {
        folder: 'advertisements',
      });
      mediaUrl = uploadResult.url;
    } catch (error) {
      throw new InternalServerErrorException('Failed to upload media file');
    }

    // Create advertisement
    const advertisement = this.advertisementRepository.create({
      ...createDto,
      mediaUrl,
      createdBy: adminId,
      startDate: createDto.startDate ? new Date(createDto.startDate) : undefined,
      endDate: createDto.endDate ? new Date(createDto.endDate) : undefined,
    });

    return await this.advertisementRepository.save(advertisement);
  }

  async findAll(queryDto: AdvertisementQueryDto): Promise<{
    data: Advertisement[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10, isActive, userType, screen } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.advertisementRepository
      .createQueryBuilder('ad')
      .leftJoinAndSelect('ad.admin', 'admin')
      .orderBy('ad.priority', 'DESC')
      .addOrderBy('ad.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    // Apply filters
    if (isActive !== undefined) {
      queryBuilder.andWhere('ad.isActive = :isActive', { isActive });
    }

    if (userType) {
      queryBuilder.andWhere(
        "ad.targetUserTypes @> :userType::jsonb",
        { userType: JSON.stringify([userType]) }
      );
    }

    if (screen && userType) {
      queryBuilder.andWhere(
        `ad.target_screens->'${userType}' @> :screen::jsonb`,
        { screen: JSON.stringify([screen]) }
      );
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Advertisement> {
    const advertisement = await this.advertisementRepository.findOne({
      where: { id },
      relations: ['admin'],
    });

    if (!advertisement) {
      throw new NotFoundException(`Advertisement with ID ${id} not found`);
    }

    return advertisement;
  }

  async findActiveAds(userType: AdUserType, screen: string): Promise<Advertisement[]> {
    const currentDate = new Date();

    const queryBuilder = this.advertisementRepository
      .createQueryBuilder('ad')
      .where('ad.isActive = :isActive', { isActive: true })
      .andWhere(
        "ad.targetUserTypes @> :userType::jsonb",
        { userType: JSON.stringify([userType]) }
      )
      .andWhere(
        `ad.target_screens->'${userType}' @> :screen::jsonb`,
        { screen: JSON.stringify([screen]) }
      )
      .andWhere(
        '(ad.startDate IS NULL OR ad.startDate <= :currentDate)',
        { currentDate }
      )
      .andWhere(
        '(ad.endDate IS NULL OR ad.endDate >= :currentDate)',
        { currentDate }
      )
      .orderBy('ad.priority', 'DESC')
      .addOrderBy('ad.createdAt', 'DESC');

    return await queryBuilder.getMany();
  }

  async update(
    id: string,
    updateDto: UpdateAdvertisementDto,
    mediaFile?: Express.Multer.File,
  ): Promise<Advertisement> {
    const advertisement = await this.findOne(id);

    // Validate date range if provided
    if (updateDto.startDate && updateDto.endDate) {
      const start = new Date(updateDto.startDate);
      const end = new Date(updateDto.endDate);
      if (start >= end) {
        throw new BadRequestException('Start date must be before end date');
      }
    }

    // Validate targetScreens if provided
    if (updateDto.targetUserTypes && updateDto.targetScreens) {
      this.validateTargetScreens(updateDto.targetUserTypes, updateDto.targetScreens);
    }

    // Handle media file replacement
    if (mediaFile) {
      try {
        // Delete old media from S3
        await this.s3Service.deleteFile(advertisement.mediaUrl);

        // Upload new media
        const uploadResult = await this.s3Service.uploadFile(mediaFile, {
          folder: 'advertisements',
        });
        updateDto.mediaType = updateDto.mediaType; // Keep or update media type
        advertisement.mediaUrl = uploadResult.url;
      } catch (error) {
        throw new InternalServerErrorException('Failed to replace media file');
      }
    }

    // Update fields
    Object.assign(advertisement, {
      ...updateDto,
      startDate: updateDto.startDate ? new Date(updateDto.startDate) : advertisement.startDate,
      endDate: updateDto.endDate ? new Date(updateDto.endDate) : advertisement.endDate,
    });

    return await this.advertisementRepository.save(advertisement);
  }

  async remove(id: string): Promise<void> {
    const advertisement = await this.findOne(id);

    // Delete media from S3
    try {
      await this.s3Service.deleteFile(advertisement.mediaUrl);
    } catch (error) {
      // Log but don't fail if S3 deletion fails
      console.error('Failed to delete media from S3:', error);
    }

    await this.advertisementRepository.remove(advertisement);
  }

  async toggleActive(id: string): Promise<Advertisement> {
    const advertisement = await this.findOne(id);
    advertisement.isActive = !advertisement.isActive;
    return await this.advertisementRepository.save(advertisement);
  }

  async trackImpression(id: string, count: number = 1): Promise<void> {
    await this.advertisementRepository.increment({ id }, 'impressionCount', count);
  }

  async trackClick(id: string, count: number = 1): Promise<void> {
    await this.advertisementRepository.increment({ id }, 'clickCount', count);
  }

  async getAnalytics(): Promise<{
    totalAds: number;
    activeAds: number;
    totalImpressions: number;
    totalClicks: number;
    topPerformingAds: Advertisement[];
  }> {
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

  private validateTargetScreens(
    userTypes: AdUserType[],
    targetScreens: Record<string, string[]>,
  ): void {
    for (const userType of userTypes) {
      if (!targetScreens[userType] || targetScreens[userType].length === 0) {
        throw new BadRequestException(
          `At least one screen must be specified for user type: ${userType}`,
        );
      }
    }
  }
}
