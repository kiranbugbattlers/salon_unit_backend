import { ServiceCategoryService } from '../services';
import { CreateServiceCategoryDto, UpdateServiceCategoryDto, ServiceCategoryApiResponseDto, ServiceCategoryListApiResponseDto } from '../dto';
export declare class ServiceCategoryController {
    private readonly serviceCategoryService;
    constructor(serviceCategoryService: ServiceCategoryService);
    create(createDto: CreateServiceCategoryDto, file?: any): Promise<ServiceCategoryApiResponseDto>;
    findAll(page?: number, limit?: number, isActive?: boolean): Promise<ServiceCategoryListApiResponseDto>;
    findOne(id: string): Promise<ServiceCategoryApiResponseDto>;
    update(id: string, updateDto: UpdateServiceCategoryDto): Promise<ServiceCategoryApiResponseDto>;
    toggleActive(id: string): Promise<ServiceCategoryApiResponseDto>;
    remove(id: string): Promise<void>;
}
