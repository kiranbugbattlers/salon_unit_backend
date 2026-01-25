import { Repository } from 'typeorm';
import { Service, ServiceCategory } from '../../database/entities';
import { S3Service } from '../../common/services/s3.service';
import { CreateServiceDto, UpdateServiceDto, ServiceResponseDto, ServiceListResponseDto, ServicesGroupedByCategoryResponseDto } from '../dto';
export declare class ServiceService {
    private serviceRepository;
    private serviceCategoryRepository;
    private s3Service;
    constructor(serviceRepository: Repository<Service>, serviceCategoryRepository: Repository<ServiceCategory>, s3Service: S3Service);
    create(createDto: CreateServiceDto, file?: any): Promise<ServiceResponseDto>;
    findAll(page?: number, limit?: number, categoryId?: string, isActive?: boolean, availableAtHome?: boolean): Promise<ServiceListResponseDto>;
    findOne(id: string): Promise<ServiceResponseDto>;
    update(id: string, updateDto: UpdateServiceDto): Promise<ServiceResponseDto>;
    remove(id: string): Promise<void>;
    toggleActive(id: string): Promise<ServiceResponseDto>;
    findServicesGroupedByCategory(page?: number, limit?: number, isActive?: boolean, availableAtHome?: boolean): Promise<ServicesGroupedByCategoryResponseDto>;
    findByCategory(categoryId: string): Promise<ServiceResponseDto[]>;
    uploadImage(id: string, file: any): Promise<{
        serviceImage: string;
        serviceImageCdnUrl: string;
        serviceImageS3Key: string;
    }>;
    deleteImage(id: string): Promise<{
        message: string;
    }>;
    private mapToResponseDto;
    private mapToServiceInCategoryDto;
}
