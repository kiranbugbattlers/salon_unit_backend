import { Repository } from 'typeorm';
import { Advertisement } from '../database/entities';
import { CreateAdvertisementDto } from './dto/create-advertisement.dto';
import { UpdateAdvertisementDto } from './dto/update-advertisement.dto';
import { AdvertisementQueryDto } from './dto/advertisement-query.dto';
import { S3Service } from '../common/services/s3.service';
import { AdUserType } from '../common/enums';
export declare class AdvertisementService {
    private advertisementRepository;
    private s3Service;
    constructor(advertisementRepository: Repository<Advertisement>, s3Service: S3Service);
    create(createDto: CreateAdvertisementDto, mediaFile: Express.Multer.File, adminId: string): Promise<Advertisement>;
    findAll(queryDto: AdvertisementQueryDto): Promise<{
        data: Advertisement[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<Advertisement>;
    findActiveAds(userType: AdUserType, screen: string): Promise<Advertisement[]>;
    update(id: string, updateDto: UpdateAdvertisementDto, mediaFile?: Express.Multer.File): Promise<Advertisement>;
    remove(id: string): Promise<void>;
    toggleActive(id: string): Promise<Advertisement>;
    trackImpression(id: string, count?: number): Promise<void>;
    trackClick(id: string, count?: number): Promise<void>;
    getAnalytics(): Promise<{
        totalAds: number;
        activeAds: number;
        totalImpressions: number;
        totalClicks: number;
        topPerformingAds: Advertisement[];
    }>;
    private validateTargetScreens;
}
