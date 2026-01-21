import { Repository } from 'typeorm';
import { ServiceCategory } from '../../database/entities';
import { S3Service } from '../../common/services/s3.service';
import { CreateServiceCategoryDto, UpdateServiceCategoryDto, ServiceCategoryApiResponseDto, ServiceCategoryListApiResponseDto } from '../dto';
export declare class ServiceCategoryService {
    private serviceCategoryRepository;
    private s3Service;
    constructor(serviceCategoryRepository: Repository<ServiceCategory>, s3Service: S3Service);
    create(createDto: CreateServiceCategoryDto, file?: any): Promise<ServiceCategoryApiResponseDto>;
    findAll(page?: number, limit?: number, isActive?: boolean): Promise<ServiceCategoryListApiResponseDto>;
    findOne(id: string): Promise<ServiceCategoryApiResponseDto>;
    update(id: string, updateDto: UpdateServiceCategoryDto): Promise<ServiceCategoryApiResponseDto>;
    remove(id: string): Promise<void>;
    toggleActive(id: string): Promise<ServiceCategoryApiResponseDto>;
    uploadImage(id: string, file: any): Promise<{
        categoryImage: string;
        categoryImageCdnUrl: string;
        categoryImageS3Key: string;
    }>;
    deleteImage(id: string): Promise<{
        message: string;
    }>;
    private mapToResponseDto;
}
