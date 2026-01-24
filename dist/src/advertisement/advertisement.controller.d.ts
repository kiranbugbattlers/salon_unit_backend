import { AdvertisementService } from './advertisement.service';
import { CreateAdvertisementDto } from './dto/create-advertisement.dto';
import { UpdateAdvertisementDto } from './dto/update-advertisement.dto';
import { AdvertisementQueryDto } from './dto/advertisement-query.dto';
import { GetActiveAdsDto } from './dto/get-active-ads.dto';
import { TrackAdDto } from './dto/track-ad.dto';
import { ApiResponseDto } from '../common/dto/api-response.dto';
export declare class AdvertisementController {
    private readonly advertisementService;
    constructor(advertisementService: AdvertisementService);
    create(createDto: CreateAdvertisementDto, media: Express.Multer.File, req: any): Promise<import("../database/entities").Advertisement>;
    findAll(queryDto: AdvertisementQueryDto): Promise<{
        data: import("../database/entities").Advertisement[];
        total: number;
        page: number;
        limit: number;
    }>;
    getActiveAds(queryDto: GetActiveAdsDto): Promise<ApiResponseDto>;
    getAnalytics(): Promise<{
        totalAds: number;
        activeAds: number;
        totalImpressions: number;
        totalClicks: number;
        topPerformingAds: import("../database/entities").Advertisement[];
    }>;
    findOne(id: string): Promise<import("../database/entities").Advertisement>;
    update(id: string, updateDto: UpdateAdvertisementDto, media?: Express.Multer.File): Promise<import("../database/entities").Advertisement>;
    remove(id: string): Promise<{
        message: string;
    }>;
    toggleActive(id: string): Promise<import("../database/entities").Advertisement>;
    trackImpression(id: string, trackDto: TrackAdDto): Promise<{
        message: string;
    }>;
    trackClick(id: string, trackDto: TrackAdDto): Promise<{
        message: string;
    }>;
}
