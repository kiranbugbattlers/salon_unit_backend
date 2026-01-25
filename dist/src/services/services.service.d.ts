import { Repository } from 'typeorm';
import { BusinessService, BusinessOwner, BusinessAddress, Service, ServiceCategory } from '../database/entities';
import { DistanceCalculatorService } from '../common/services/distance-calculator.service';
import { ServicesQueryDto, ServicesResponseDto } from './dto';
export declare class ServicesService {
    private readonly businessServiceRepository;
    private readonly businessOwnerRepository;
    private readonly businessAddressRepository;
    private readonly serviceRepository;
    private readonly serviceCategoryRepository;
    private readonly distanceCalculatorService;
    constructor(businessServiceRepository: Repository<BusinessService>, businessOwnerRepository: Repository<BusinessOwner>, businessAddressRepository: Repository<BusinessAddress>, serviceRepository: Repository<Service>, serviceCategoryRepository: Repository<ServiceCategory>, distanceCalculatorService: DistanceCalculatorService);
    getServices(query: ServicesQueryDto, userId?: string): Promise<ServicesResponseDto>;
    private validateLocationParams;
    private buildBaseQuery;
    private applyStatusFilter;
    private applyCategoryFilter;
    private applyAvailabilityFilter;
    private applyPriceFilter;
    private applyGenderFilter;
    private applyLocationFilter;
    private applySorting;
    private parseSortString;
    private applyPagination;
    private transformToServiceItems;
    private getUserSpecificData;
    private sortServicesByDistance;
    private buildMetadata;
}
