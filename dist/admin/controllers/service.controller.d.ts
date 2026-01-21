import { ServiceService } from '../services';
import { CreateServiceDto, UpdateServiceDto, ServiceResponseDto, ServiceListResponseDto, ServicesGroupedByCategoryResponseDto } from '../dto';
export declare class ServiceController {
    private readonly serviceService;
    constructor(serviceService: ServiceService);
    create(createDto: CreateServiceDto, file?: any): Promise<ServiceResponseDto>;
    findAll(page?: number, limit?: number, categoryId?: string, isActive?: boolean, availableAtHome?: boolean): Promise<ServiceListResponseDto>;
    findServicesGroupedByCategory(page?: number, limit?: number, isActive?: boolean, availableAtHome?: boolean): Promise<ServicesGroupedByCategoryResponseDto>;
    findByCategory(categoryId: string): Promise<ServiceResponseDto[]>;
    findOne(id: string): Promise<ServiceResponseDto>;
    update(id: string, updateDto: UpdateServiceDto): Promise<ServiceResponseDto>;
    toggleActive(id: string): Promise<ServiceResponseDto>;
    remove(id: string): Promise<void>;
}
